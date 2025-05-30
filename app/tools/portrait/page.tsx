"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, RefreshCw, AlertCircle, Upload, X, Download, Share2, ArrowRight } from "lucide-react"
import Image from "next/image"
import { generatePortrait, type GRSAIResponse } from "@/lib/api-client"
import { getNextTool } from "@/lib/tools-config"

// 提示词示例（扩展池）
const allExamplePrompts = [
  "Harry Potter",
  "Elon Musk", 
  "Donald Trump",
  "Albert Einstein",
  "Leonardo da Vinci",
  "Marilyn Monroe",
  "young businessman in suit",
  "elderly wise woman",
  "mysterious hooded figure",
  "elegant Victorian lady",
  "rugged cowboy",
  "wise old professor",
  "mysterious ninja",
  "graceful ballerina", 
  "confident CEO",
  "artistic musician",
  "brave firefighter",
  "kind grandmother",
  "rebellious teenager",
  "sophisticated gentleman"
]

// 示例作品缩略图
const exampleThumbnails = [
  "/images/tools/portrait-example.jpg",
  "/images/tools/portrait-example.jpg", 
  "/placeholder.jpg",
  "/placeholder.jpg"
]

export default function PortraitToolPage() {
  const [characterDescription, setCharacterDescription] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const [currentInspiration, setCurrentInspiration] = useState<string[]>([])
  const [aspectRatio, setAspectRatio] = useState<string>("auto")
  const [referenceImage, setReferenceImage] = useState<string | null>(null)

  // 尺寸比例选项
  const aspectRatioOptions = [
    { value: "auto", label: "Auto", description: "自动比例" },
    { value: "2:3", label: "2:3", description: "竖版" },
    { value: "3:2", label: "3:2", description: "横版" },
    { value: "1:1", label: "1:1", description: "正方形" }
  ]

  // 初始化时生成随机灵感
  useEffect(() => {
    generateRandomInspiration()
  }, [])

  // 生成随机灵感（6个不重复）
  const generateRandomInspiration = () => {
    const shuffled = [...allExamplePrompts].sort(() => 0.5 - Math.random())
    setCurrentInspiration(shuffled.slice(0, 6))
  }

  const handleGenerate = async () => {
    if (!characterDescription.trim()) {
      setError("请输入人物描述")
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setGeneratedImages([])
    setError("")

    await generatePortrait({
      characterDescription: characterDescription.trim(),
      aspectRatio: aspectRatio,
      referenceImage: referenceImage,
      onProgress: (progressValue) => {
        setProgress(progressValue)
      },
      onSuccess: (response: GRSAIResponse) => {
        if (response.results && response.results.length > 0) {
          setGeneratedImages(response.results.map(result => result.url))
        } else if (response.url) {
          setGeneratedImages([response.url])
        }
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

  const handleRegenerate = () => {
    setGeneratedImages([])
    handleGenerate()
  }

  const handleExampleClick = (example: string) => {
    setCharacterDescription(example)
    setError("")
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setReferenceImage(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setError("请上传图片文件")
      }
    }
  }

  const removeReferenceImage = () => {
    setReferenceImage(null)
  }

  // Canvas工具函数：将图片URL转换为canvas
  const imageUrlToCanvas = (imageUrl: string): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      console.log('开始加载图片:', imageUrl)
      
      const img = new HTMLImageElement()
      let isResolved = false
      
      // 设置超时机制
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true
          console.error('图片加载超时')
          reject(new Error('图片加载超时'))
        }
      }, 15000) // 15秒超时
      
      img.onload = () => {
        if (isResolved) return
        isResolved = true
        clearTimeout(timeout)
        
        console.log('图片加载成功，尺寸:', img.width, 'x', img.height)
        
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          
          if (ctx) {
            // 设置白色背景（确保JPG格式正确）
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0)
            console.log('Canvas绘制完成')
            resolve(canvas)
          } else {
            console.error('无法获取canvas context')
            reject(new Error('无法获取canvas context'))
          }
        } catch (error) {
          console.error('Canvas处理错误:', error)
          reject(error)
        }
      }
      
      img.onerror = (error) => {
        if (isResolved) return
        isResolved = true
        clearTimeout(timeout)
        console.error('图片加载失败:', error)
        reject(new Error('图片加载失败'))
      }
      
      // 尝试设置CORS，但不强制要求
      try {
        img.crossOrigin = 'anonymous'
      } catch (error) {
        console.warn('无法设置crossOrigin:', error)
      }
      
      img.src = imageUrl
    })
  }

  // Canvas工具函数：将canvas转换为blob
  const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      console.log('开始转换Canvas为Blob')
      
      try {
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('Blob转换成功，大小:', blob.size, '字节')
            resolve(blob)
          } else {
            console.error('Canvas转换为Blob失败')
            reject(new Error('Canvas转换失败'))
          }
        }, 'image/jpeg', 0.9) // 提高质量到0.9
      } catch (error) {
        console.error('toBlob调用失败:', error)
        reject(error)
      }
    })
  }

  const downloadImage = async (imageUrl: string, index: number) => {
    console.log('开始下载图片:', imageUrl)
    setError("") // 清除之前的错误
    
    const fileName = `portrait-${Date.now()}-${index + 1}.jpg`
    
    try {
      console.log('使用服务器代理下载')
      
      // 调用服务器代理API
      const response = await fetch('/api/download-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          fileName: fileName
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '下载请求失败')
      }

      console.log('代理请求成功，开始下载文件')
      
      // 获取文件blob
      const blob = await response.blob()
      console.log('文件blob获取成功，大小:', blob.size, '字节')

      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.style.display = 'none'
      document.body.appendChild(link)
      
      // 触发下载
      link.click()
      
      // 清理
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log('下载成功完成')
      
    } catch (error) {
      console.error('下载失败:', error)
      setError(`下载失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const shareImage = async (imageUrl: string, index: number) => {
    try {
      // 使用canvas将图片转换为blob，然后复制到剪贴板
      const canvas = await imageUrlToCanvas(imageUrl)
      const blob = await canvasToBlob(canvas)
      
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/jpeg': blob })
        ])
        // 显示成功提示
        alert('图片已复制，可以直接粘贴分享')
      } else {
        // Fallback: 复制图片链接
        await navigator.clipboard.writeText(imageUrl)
        alert('图片链接已复制到剪贴板')
      }
    } catch (error) {
      // 最终fallback: Web Share API或复制链接
      if (navigator.share) {
        try {
          await navigator.share({
            title: '我的AI肖像作品',
            text: '看看我用Artspark生成的黑白肖像艺术！',
            url: imageUrl
          })
        } catch (shareError) {
          // 用户取消分享
        }
      } else {
        try {
          await navigator.clipboard.writeText(imageUrl)
          alert('图片链接已复制到剪贴板')
        } catch (fallbackError) {
          setError("分享失败，请重试")
        }
      }
    }
  }

  // 获取下一个工具
  const nextTool = getNextTool('portrait')

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50/30 relative">
      {/* Subtle decorative elements */}
      <div className="absolute top-20 right-20 w-2 h-2 bg-stone-300 rounded-full opacity-40"></div>
      <div className="absolute top-40 left-16 w-1 h-1 bg-amber-300 rounded-full opacity-30"></div>
      <div className="absolute bottom-32 right-32 w-1.5 h-1.5 bg-stone-400 rounded-full opacity-25"></div>

      {/* Header */}
      <header className="container mx-auto px-8 py-12">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/wander">
            <Button
              variant="ghost"
              className="group bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-full px-6 py-4 hover:bg-white hover:shadow-sm transition-all duration-500 ease-out"
            >
              <div className="flex items-center gap-3 text-stone-600">
                <ArrowLeft className="w-4 h-4" />
                <span className="font-light">返回工具列表</span>
              </div>
            </Button>
          </Link>

          <div className="flex items-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl px-8 py-4 shadow-sm border border-stone-100/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-stone-200 to-amber-200 rounded-full flex items-center justify-center">
                  <span className="text-sm">✨</span>
                </div>
                <h1 className="text-2xl font-light text-stone-700 tracking-wide">Artspark</h1>
                <div className="w-8 h-8 bg-gradient-to-br from-amber-200 to-stone-200 rounded-full flex items-center justify-center">
                  <span className="text-sm">🎨</span>
                </div>
              </div>
            </div>
          </div>

          <Link href={nextTool.path}>
            <Button
              variant="ghost"
              className="group bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-full px-6 py-4 hover:bg-white hover:shadow-sm transition-all duration-500 ease-out"
            >
              <div className="flex items-center gap-3 text-stone-600">
                <span className="font-light">试试下一个工具</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8 max-w-6xl">
        {/* Tool Header */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-block bg-white/60 backdrop-blur-sm rounded-2xl px-8 py-4 border border-stone-100/50">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center">
                <span className="text-sm">✨</span>
              </div>
              <h2 className="text-2xl font-light text-stone-700 tracking-wide">黑白肖像艺术</h2>
            </div>
          </div>
          <p className="text-stone-500 font-light tracking-wide max-w-md mx-auto leading-relaxed">
            输入人物描述，AI将为您生成电影风格的黑白艺术肖像
          </p>
          <div className="flex justify-center gap-3">
            <span className="px-4 py-2 bg-stone-100/60 text-stone-600 rounded-full text-sm font-light border border-stone-200/50">
              人物肖像
            </span>
            <span className="px-4 py-2 bg-stone-100/60 text-stone-600 rounded-full text-sm font-light border border-stone-200/50">
              黑白艺术
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Input Section */}
          <div className="space-y-8">
            {/* Character Description Input */}
            <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-light text-stone-700 mb-6 flex items-center gap-3 tracking-wide">
                <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">👤</span>
                </div>
                描述你想要生成的人物
              </h3>
              
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="例如：Harry Potter, Elon Musk, 或任何人物描述..."
                  value={characterDescription}
                  onChange={(e) => setCharacterDescription(e.target.value)}
                  className="w-full px-6 py-4 text-base border border-stone-200/50 rounded-2xl bg-white/60 backdrop-blur-sm focus:bg-white focus:border-amber-300 transition-all duration-300 font-light placeholder:text-stone-400"
                />
                
                <p className="text-sm text-stone-500 font-light">
                  可以是知名人物、虚拟角色，或具体的外貌描述
                </p>
              </div>
            </div>

            {/* Image Aspect Ratio Selection */}
            <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-light text-stone-700 mb-6 flex items-center gap-3 tracking-wide">
                <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">📐</span>
                </div>
                图片尺寸比例
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {aspectRatioOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setAspectRatio(option.value)}
                    className={`p-4 text-center border rounded-xl transition-all duration-300 text-sm font-light ${
                      aspectRatio === option.value
                        ? 'bg-amber-100/60 border-amber-300/50 text-amber-700'
                        : 'bg-white/40 border-stone-200/50 text-stone-700 hover:bg-white/60 hover:border-stone-300/50'
                    }`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs mt-1 opacity-75">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Example Prompts */}
            <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-light text-stone-700 flex items-center gap-3 tracking-wide">
                  <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">💡</span>
                  </div>
                  灵感提示
                </h3>
                <Button
                  variant="outline"
                  onClick={generateRandomInspiration}
                  className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-full px-4 py-2 hover:bg-white hover:shadow-sm transition-all duration-500 ease-out text-stone-600 font-light"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎲</span>
                    <span>变一变</span>
                  </div>
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {currentInspiration.map((example, index) => (
                  <button
                    key={index}
                    className="p-3 text-left bg-white/40 border border-stone-200/50 rounded-xl hover:bg-white/60 hover:border-stone-300/50 transition-all duration-300 text-sm font-light text-stone-700"
                    onClick={() => handleExampleClick(example)}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Image Upload */}
            <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-light text-stone-700 mb-6 flex items-center gap-3 tracking-wide">
                <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">🖼️</span>
                </div>
                上传参考图（可选）
              </h3>
              
              {referenceImage ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <Image
                      src={referenceImage}
                      alt="参考图"
                      width={200}
                      height={200}
                      className="w-32 h-32 object-cover rounded-xl border border-stone-200/50"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeReferenceImage}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-100 border-red-200 hover:bg-red-200 p-0"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  <p className="text-sm text-stone-500 font-light">
                    参考图已上传，将作为生成参考
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                    <div className="border-2 border-dashed border-stone-300/50 rounded-xl p-8 text-center hover:border-stone-400/50 hover:bg-stone-50/30 transition-all duration-300 cursor-pointer">
                      <Upload className="w-8 h-8 text-stone-400 mx-auto mb-3" />
                      <p className="text-stone-600 font-light mb-1">点击上传参考图</p>
                      <p className="text-sm text-stone-500 font-light">支持 JPG、PNG 格式</p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <div className="text-center space-y-4">
              <Button
                onClick={handleGenerate}
                disabled={!characterDescription.trim() || isGenerating}
                className="bg-gradient-to-r from-stone-300 to-amber-300 hover:from-stone-400 hover:to-amber-400 text-stone-700 px-12 py-6 text-lg rounded-full font-light border-0 shadow-lg hover:shadow-xl transition-all duration-700 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-white/50 rounded-full flex items-center justify-center">
                      <span className="text-xs animate-pulse">✨</span>
                    </div>
                    <span>正在生成... {progress}%</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-white/50 rounded-full flex items-center justify-center">
                      <span className="text-xs">🪄</span>
                    </div>
                    <span>开始生成</span>
                  </div>
                )}
              </Button>

              {/* Progress Bar */}
              {isGenerating && (
                <div className="max-w-xs mx-auto">
                  <div className="bg-stone-200/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-stone-400 to-amber-400 h-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-stone-500 font-light mt-2">
                    {progress < 30 ? "正在理解您的描述..." : 
                     progress < 60 ? "AI正在构思画面..." : 
                     progress < 90 ? "正在绘制细节..." : "即将完成..."}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="max-w-md mx-auto bg-red-50/80 border border-red-200/50 rounded-2xl p-4">
                  <div className="flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-light">{error}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-light text-stone-700 flex items-center gap-3 tracking-wide">
                  <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">🖼️</span>
                  </div>
                  生成结果
                </h3>
                {generatedImages.length > 0 && !isGenerating && (
                  <Button
                    variant="outline"
                    className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-full px-4 py-2 hover:bg-white hover:shadow-sm transition-all duration-500 ease-out text-stone-600 font-light"
                    onClick={handleRegenerate}
                  >
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      <span>重新生成</span>
                    </div>
                  </Button>
                )}
              </div>

              {/* Results Display */}
              <div className="min-h-[400px] flex items-center justify-center">
                {generatedImages.length > 0 ? (
                  <div className="grid gap-6">
                    {generatedImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
                          <Image
                            src={imageUrl}
                            alt={`生成的肖像 ${index + 1}`}
                            width={400}
                            height={400}
                            className="w-full h-auto rounded-xl object-cover group-hover:scale-[1.02] transition-transform duration-500"
                          />
                        </div>
                        
                        {/* Download and Share Buttons */}
                        <div className="flex justify-center gap-3 mt-4">
                          <Button
                            variant="outline"
                            onClick={() => downloadImage(imageUrl, index)}
                            className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-full px-4 py-2 hover:bg-white hover:shadow-sm transition-all duration-500 ease-out text-stone-600 font-light"
                          >
                            <div className="flex items-center gap-2">
                              <Download className="w-4 h-4" />
                              <span>下载</span>
                            </div>
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => shareImage(imageUrl, index)}
                            className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-full px-4 py-2 hover:bg-white hover:shadow-sm transition-all duration-500 ease-out text-stone-600 font-light"
                          >
                            <div className="flex items-center gap-2">
                              <Share2 className="w-4 h-4" />
                              <span>分享</span>
                            </div>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isGenerating ? (
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-stone-200 to-amber-200 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-3xl animate-pulse">🎨</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-stone-600 font-light">AI正在创作中...</p>
                      <p className="text-sm text-stone-500 font-light">这可能需要1-2分钟</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-6">
                    {/* 示例作品标题 */}
                    <div className="text-center">
                      <h4 className="text-base font-light text-stone-600 tracking-wide">示例作品 / Example shots</h4>
                    </div>
                    
                    {/* 2×2缩略图网格 */}
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                      {exampleThumbnails.map((thumbnail, index) => (
                        <div 
                          key={index}
                          className="aspect-square rounded-xl overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-yellow-300/40 cursor-pointer"
                          style={{backgroundColor: '#FFFCF7'}}
                        >
                          <Image
                            src={thumbnail}
                            alt={`示例作品 ${index + 1}`}
                            width={150}
                            height={150}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    
                    {/* 提示文案 */}
                    <div className="text-center space-y-2 text-stone-500">
                      <p className="text-sm font-light">输入人物描述后点击生成按钮</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
