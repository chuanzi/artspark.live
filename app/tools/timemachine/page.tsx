"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, AlertCircle, Upload, X, Download, Share2, ArrowRight, Clock } from "lucide-react"
import Image from "next/image"
import { generateTimeMachine, compressImage } from "@/lib/timemachine-api"
import { AGE_PRESETS, type AgePreset } from "@/lib/timemachine-types"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"

export default function TimeMachinePage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [selectedAge, setSelectedAge] = useState<string>("25")
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理文件上传
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setError("")
        setUploadedFile(file)
        
        try {
          // 压缩图片
          const compressedBase64 = await compressImage(file)
          setUploadedImage(compressedBase64)
        } catch (compressError) {
          console.error('图片压缩失败:', compressError)
          // 如果压缩失败，使用原图
          const reader = new FileReader()
          reader.onload = (e) => {
            setUploadedImage(e.target?.result as string)
          }
          reader.readAsDataURL(file)
        }
      } else {
        setError("请上传JPG、PNG或WebP格式的图片文件")
      }
    }
  }

  // 处理文件直接上传（用于拖拽）
  const handleFileDirectUpload = async (file: File) => {
    if (file.type.startsWith('image/')) {
      setError("")
      setUploadedFile(file)
      
      try {
        // 压缩图片
        const compressedBase64 = await compressImage(file)
        setUploadedImage(compressedBase64)
      } catch (compressError) {
        console.error('图片压缩失败:', compressError)
        // 如果压缩失败，使用原图
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadedImage(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    } else {
      setError("请上传JPG、PNG或WebP格式的图片文件")
    }
  }

  // 处理拖拽上传
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      handleFileDirectUpload(file)
    }
  }

  // 生成时光机效果
  const handleGenerate = async () => {
    if (!uploadedImage || !uploadedFile) {
      setError("请先上传图片")
      return
    }

    if (!selectedAge) {
      setError("请选择目标年龄")
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setGeneratedImage(null)
    setError("")

    await generateTimeMachine({
      image: uploadedFile,
      targetAge: selectedAge,
      onProgress: (progressValue) => {
        setProgress(progressValue)
      },
      onSuccess: (imageUrl: string) => {
        setGeneratedImage(imageUrl)
        setIsGenerating(false)
        setProgress(100)
      },
      onError: (errorMessage) => {
        setError(errorMessage)
        setIsGenerating(false)
        setProgress(0)
      }
    })
  }

  // 重新生成
  const handleRegenerate = () => {
    setGeneratedImage(null)
    handleGenerate()
  }

  // 下载图片
  const downloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `timemachine-result-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('下载失败:', error)
      setError("下载失败，请重试")
    }
  }

  // 分享图片
  const shareImage = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const file = new File([blob], 'timemachine-result.jpg', { type: 'image/jpeg' })
        
        await navigator.share({
          title: '我的时光机作品',
          text: '看看AI为我生成的不同年龄样貌！',
          files: [file]
        })
      } catch (error) {
        console.error('分享失败:', error)
        // 降级到复制链接
        navigator.clipboard.writeText(imageUrl)
        alert('图片链接已复制到剪贴板')
      }
    } else {
      // 降级到复制链接
      navigator.clipboard.writeText(imageUrl)
      alert('图片链接已复制到剪贴板')
    }
  }

  // 清除上传的图片
  const clearUploadedImage = () => {
    setUploadedImage(null)
    setUploadedFile(null)
    setGeneratedImage(null)
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50/30">
      {/* 顶部导航 */}
      <div className="container mx-auto px-8 py-12">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Link href="/">
            <Button
              variant="ghost"
              className="group bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-full px-8 py-6 hover:bg-white hover:shadow-sm transition-all duration-500 ease-out"
            >
              <div className="flex items-center gap-4 text-stone-600">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                <div className="text-left">
                  <div className="font-medium text-base">返回首页</div>
                  <div className="text-sm text-stone-500">探索更多工具</div>
                </div>
              </div>
            </Button>
          </Link>

          <div className="flex flex-col items-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl px-10 py-6 shadow-sm border border-stone-100/50">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-stone-200 to-amber-200 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-stone-600" />
                </div>
                <h1 className="text-3xl font-light text-stone-700 tracking-wide">时光机</h1>
                <div className="w-10 h-10 bg-gradient-to-br from-amber-200 to-stone-200 rounded-full flex items-center justify-center">
                  <span className="text-lg">⏰</span>
                </div>
              </div>
              <p className="text-stone-500 text-center font-light tracking-wider">穿越时光，看见不同年龄的自己</p>
            </div>
          </div>

          <div className="w-[200px]"></div>
        </div>
      </div>

      {/* 主要内容区 */}
      <main className="container mx-auto px-8 pb-20 max-w-4xl">
        <div className="space-y-12">
          {/* 图片上传区域 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-stone-100/50">
            <h2 className="text-xl font-medium text-stone-700 mb-6 flex items-center gap-3">
              <Upload className="w-5 h-5" />
              上传照片
            </h2>
            
            {!uploadedImage ? (
              <div
                className="border-2 border-dashed border-stone-300 rounded-2xl p-12 text-center hover:border-amber-400 transition-colors duration-300 cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-stone-500" />
                  </div>
                  <div>
                    <p className="text-lg text-stone-600 font-medium">点击或拖拽上传照片</p>
                    <p className="text-sm text-stone-500 mt-2">支持 JPG、PNG、WebP 格式，最大 10MB</p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden">
                  <Image
                    src={uploadedImage}
                    alt="上传的照片"
                    width={400}
                    height={400}
                    className="w-full max-w-md mx-auto object-cover"
                  />
                </div>
                <Button
                  onClick={clearUploadedImage}
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white border-stone-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* 年龄选择区域 */}
          {uploadedImage && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-stone-100/50">
              <h2 className="text-xl font-medium text-stone-700 mb-6 flex items-center gap-3">
                <Clock className="w-5 h-5" />
                选择目标年龄
              </h2>
              
              {/* 预设年龄选项 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {AGE_PRESETS.map((preset: AgePreset) => (
                  <Button
                    key={preset.value}
                    variant={selectedAge === preset.value ? "default" : "outline"}
                    className={`h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-300 ${
                      selectedAge === preset.value
                        ? "bg-gradient-to-r from-stone-300 to-amber-300 text-stone-700 border-0"
                        : "bg-white/50 border-stone-200 hover:bg-white hover:border-amber-300"
                    }`}
                    onClick={() => setSelectedAge(preset.value)}
                  >
                    <span className="font-medium">{preset.label}</span>
                    <span className="text-sm opacity-75">{preset.ageRange}岁</span>
                    <span className="text-xs opacity-60">{preset.description}</span>
                  </Button>
                ))}
              </div>

              {/* 自定义年龄滑块 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-stone-600">自定义年龄</label>
                  <span className="text-sm text-stone-500">{selectedAge}岁</span>
                </div>
                <Slider
                  value={[parseInt(selectedAge)]}
                  onValueChange={(value) => setSelectedAge(value[0].toString())}
                  max={80}
                  min={18}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-stone-400">
                  <span>18岁</span>
                  <span>80岁</span>
                </div>
              </div>
            </div>
          )}

          {/* 生成按钮和进度 */}
          {uploadedImage && (
            <div className="text-center space-y-6">
              {!isGenerating ? (
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedAge}
                  size="lg"
                  className="bg-gradient-to-r from-stone-300 to-amber-300 hover:from-stone-400 hover:to-amber-400 text-stone-700 px-16 py-8 text-xl font-light rounded-full shadow-lg hover:shadow-xl transition-all duration-700 ease-out border-0 tracking-wide"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-6 h-6 bg-white/50 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span>开启时光机</span>
                    <div className="w-6 h-6 bg-white/50 rounded-full flex items-center justify-center">
                      <span className="text-sm">✨</span>
                    </div>
                  </div>
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-4">
                    <RefreshCw className="w-6 h-6 text-stone-600 animate-spin" />
                    <span className="text-lg text-stone-600">时光机正在运转中...</span>
                  </div>
                  <div className="max-w-md mx-auto">
                    <Progress value={progress} className="h-3 bg-stone-200" />
                    <p className="text-sm text-stone-500 mt-2">{progress}% 完成</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <div>
                <p className="text-red-700 font-medium">处理失败</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* 结果展示区域 */}
          {generatedImage && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-stone-100/50">
              <h2 className="text-xl font-medium text-stone-700 mb-6 flex items-center gap-3">
                <span className="text-lg">🎭</span>
                时光机效果
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* 原图 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-stone-600 text-center">原图</h3>
                  <div className="rounded-2xl overflow-hidden">
                    <Image
                      src={uploadedImage!}
                      alt="原图"
                      width={400}
                      height={400}
                      className="w-full object-cover"
                    />
                  </div>
                </div>

                {/* 处理后图片 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-stone-600 text-center">{selectedAge}岁的你</h3>
                  <div className="rounded-2xl overflow-hidden">
                    <Image
                      src={generatedImage}
                      alt={`${selectedAge}岁效果`}
                      width={400}
                      height={400}
                      className="w-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Button
                  onClick={handleRegenerate}
                  variant="outline"
                  className="bg-white/50 border-stone-200 hover:bg-white hover:border-amber-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新生成
                </Button>
                <Button
                  onClick={() => downloadImage(generatedImage)}
                  variant="outline"
                  className="bg-white/50 border-stone-200 hover:bg-white hover:border-amber-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载图片
                </Button>
                <Button
                  onClick={() => shareImage(generatedImage)}
                  variant="outline"
                  className="bg-white/50 border-stone-200 hover:bg-white hover:border-amber-300"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  分享作品
                </Button>
              </div>
            </div>
          )}

          {/* 下一个工具提示 */}
          <div className="text-center space-y-4">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-stone-300 to-transparent mx-auto"></div>
            <Link href="/tools/portrait">
              <Button
                variant="ghost"
                className="group bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-full px-8 py-4 hover:bg-white hover:shadow-sm transition-all duration-500 ease-out"
              >
                <div className="flex items-center gap-4 text-stone-600">
                  <span className="font-light">下一个工具</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎨 肖像画生成</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Button>
            </Link>
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-stone-300 to-transparent mx-auto"></div>
          </div>
        </div>
      </main>
    </div>
  )
} 