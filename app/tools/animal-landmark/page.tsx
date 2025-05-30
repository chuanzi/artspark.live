"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, AlertCircle, Shuffle, Download, Share2, ArrowRight } from "lucide-react"
import Image from "next/image"
import { generateAnimalLandmarkPhoto } from "@/lib/animal-landmark-api"
import { animalTypes, landmarks, getBgColorClass, getSelectedColorClass, type AnimalType, type LandmarkType } from "@/lib/animal-landmark-data"
import { getNextTool } from "@/lib/tools-config"

// 推荐动物地标组合 - 修正为与实际数据完全匹配
const recommendedCombinations = [
  { animal: "熊猫", landmark: "万里长城", description: "憨态可掬的熊猫在万里长城前的皇家范儿" },
  { animal: "企鹅", landmark: "自由女神像", description: "优雅的企鹅与自由女神的经典邂逅" },
  { animal: "狮子", landmark: "悉尼歌剧院", description: "威严狮王在悉尼歌剧院前的霸气pose" },
  { animal: "大象", landmark: "泰姬陵", description: "温柔大象与印度古迹的神秘邂逅" },
  { animal: "狮子", landmark: "埃菲尔铁塔", description: "威严狮王在浪漫巴黎的意外柔情" },
  { animal: "小熊", landmark: "大本钟", description: "憨厚小熊与英伦风情的温馨碰撞" },
  { animal: "狐狸", landmark: "富士山", description: "灵动狐狸在富士山下的优雅身姿" },
  { animal: "兔子", landmark: "伦敦塔桥", description: "可爱兔子在伦敦塔桥前的甜美合影" }
]

// 示例作品缩略图
const exampleThumbnails = [
  "/images/tools/animal-landmark-example.jpg",
  "/images/tools/animal-landmark-example.jpg", 
  "/images/tools/animal-landmark-example.jpg",
  "/images/tools/animal-landmark-example.jpg"
]

export default function AnimalLandmarkPage() {
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType | null>(null)
  const [selectedLandmark, setSelectedLandmark] = useState<LandmarkType | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [error, setError] = useState<string>("")
  const [currentRecommendations, setCurrentRecommendations] = useState<typeof recommendedCombinations>([])
  
  // 新增状态管理
  const [displayedAnimals, setDisplayedAnimals] = useState<AnimalType[]>([])
  const [displayedLandmarks, setDisplayedLandmarks] = useState<LandmarkType[]>([])
  const [customAnimalKeyword, setCustomAnimalKeyword] = useState<string>("")
  const [customLandmarkKeyword, setCustomLandmarkKeyword] = useState<string>("")
  const [isRetrying, setIsRetrying] = useState<boolean>(false)
  const [errorDetails, setErrorDetails] = useState<string>("")

  // 初始化
  useEffect(() => {
    generateRandomRecommendations()
    generateRandomAnimals()
    generateRandomLandmarks()
  }, [])

  // 生成随机推荐组合（4个不重复）
  const generateRandomRecommendations = () => {
    const shuffled = [...recommendedCombinations].sort(() => 0.5 - Math.random())
    setCurrentRecommendations(shuffled.slice(0, 4))
  }

  // 生成随机4个动物选项
  const generateRandomAnimals = () => {
    const shuffled = [...animalTypes].sort(() => 0.5 - Math.random())
    setDisplayedAnimals(shuffled.slice(0, 4))
  }

  // 生成随机4个地标选项
  const generateRandomLandmarks = () => {
    const shuffled = [...landmarks].sort(() => 0.5 - Math.random())
    setDisplayedLandmarks(shuffled.slice(0, 4))
  }

  // 处理动物关键词输入
  const handleAnimalKeywordChange = (keyword: string) => {
    setCustomAnimalKeyword(keyword)
    // 当输入关键词时，清除预设选择
    if (keyword.trim() !== "") {
      setSelectedAnimal(null)
    }
    setError("")
  }

  // 处理地标关键词输入
  const handleLandmarkKeywordChange = (keyword: string) => {
    setCustomLandmarkKeyword(keyword)
    // 当输入关键词时，清除预设选择
    if (keyword.trim() !== "") {
      setSelectedLandmark(null)
    }
    setError("")
  }

  // 处理动物选择
  const handleAnimalSelect = (animal: AnimalType) => {
    setSelectedAnimal(animal)
    // 当选择预设动物时，清除自定义关键词
    setCustomAnimalKeyword("")
    setError("")
  }

  // 处理地标选择
  const handleLandmarkSelect = (landmark: LandmarkType) => {
    setSelectedLandmark(landmark)
    // 当选择预设地标时，清除自定义关键词
    setCustomLandmarkKeyword("")
    setError("")
  }

  // 增强的应用推荐组合功能
  const applyRecommendation = (recommendation: typeof recommendedCombinations[0]) => {
    console.log('应用推荐组合:', recommendation)
    
    // 优化匹配逻辑：支持displayName匹配
    const animal = animalTypes.find(a => 
      a.displayName === recommendation.animal || 
      a.name === recommendation.animal ||
      a.displayName.includes(recommendation.animal) ||
      recommendation.animal.includes(a.displayName)
    )
    
    const landmark = landmarks.find(l => 
      l.displayName === recommendation.landmark || 
      l.name === recommendation.landmark ||
      l.displayName.includes(recommendation.landmark) ||
      recommendation.landmark.includes(l.displayName)
    )
    
    console.log('找到的动物:', animal)
    console.log('找到的地标:', landmark)
    
    if (animal) {
      setSelectedAnimal(animal)
      setCustomAnimalKeyword("")
      // 确保选中的动物在显示列表中
      if (!displayedAnimals.find(a => a.id === animal.id)) {
        setDisplayedAnimals(prev => [animal, ...prev.slice(0, 3)])
      }
    }
    
    if (landmark) {
      setSelectedLandmark(landmark)
      setCustomLandmarkKeyword("")
      // 确保选中的地标在显示列表中
      if (!displayedLandmarks.find(l => l.id === landmark.id)) {
        setDisplayedLandmarks(prev => [landmark, ...prev.slice(0, 3)])
      }
    }
    
    setError("")
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
    
    const fileName = `animal-landmark-${Date.now()}-${index + 1}.jpg`
    
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
            title: '我的AI动物地标作品',
            text: '看看我用Artspark生成的动物地标合照！',
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

  const handleGenerate = async () => {
    // 检查是否有选择的动物或输入的动物关键词
    const finalAnimalType = customAnimalKeyword.trim() !== "" 
      ? customAnimalKeyword.trim()
      : selectedAnimal?.name

    // 检查是否有选择的地标或输入的地标关键词  
    const finalLandmarkType = customLandmarkKeyword.trim() !== ""
      ? customLandmarkKeyword.trim()
      : selectedLandmark?.name

    if (!finalAnimalType || !finalLandmarkType) {
      setError("请选择动物和地标，或输入关键词")
      setErrorDetails("")
      return
    }

    setIsGenerating(true)
    setIsRetrying(false)
    setProgress(0)
    setGeneratedImages([])
    setError("")
    setErrorDetails("")

    console.log(`开始生成：${finalAnimalType} + ${finalLandmarkType}`)

    await generateAnimalLandmarkPhoto({
      animalType: finalAnimalType,
      landmark: finalLandmarkType,
      onProgress: (progressValue) => {
        setProgress(progressValue)
        // 如果有进度更新，说明连接正常，清除重试状态
        setIsRetrying(false)
      },
      onSuccess: (response) => {
        console.log('生成成功:', response)
        if (response.results && response.results.length > 0) {
          setGeneratedImages(response.results.map((result: any) => result.url))
        } else if (response.url) {
          setGeneratedImages([response.url])
        }
        setIsGenerating(false)
        setIsRetrying(false)
        setProgress(100)
        setError("")
        setErrorDetails("")
      },
      onError: (errorMessage) => {
        console.error('生成失败:', errorMessage)
        
        // 分析错误类型并提供相应的用户指导
        let userFriendlyError = errorMessage
        let details = ""
        
        if (errorMessage.includes('API密钥未配置')) {
          userFriendlyError = "服务暂时不可用"
          details = "请联系管理员配置服务"
        } else if (errorMessage.includes('API连接失败')) {
          userFriendlyError = "网络连接问题"
          details = "请检查网络连接，稍后重试"
        } else if (errorMessage.includes('网络连接中断') || errorMessage.includes('连接超时')) {
          userFriendlyError = "网络不稳定"
          details = "请检查网络连接，尝试刷新页面后重试"
        } else if (errorMessage.includes('请求超时')) {
          userFriendlyError = "请求处理超时"
          details = "服务器响应较慢，请稍后重试"
        } else if (errorMessage.includes('多次中断')) {
          userFriendlyError = "连接多次中断"
          details = "网络可能不稳定，请检查网络后重新尝试"
        } else if (errorMessage.includes('重试')) {
          setIsRetrying(true)
          userFriendlyError = "正在重试连接..."
          details = "请稍候，系统正在尝试重新连接"
        }
        
        setError(userFriendlyError)
        setErrorDetails(details)
        setIsGenerating(false)
        setIsRetrying(false)
        setProgress(0)
      }
    })
  }

  const handleRegenerate = () => {
    setGeneratedImages([])
    handleGenerate()
  }

  const handleShuffle = () => {
    // 随机选择动物和地标
    const randomAnimal = animalTypes[Math.floor(Math.random() * animalTypes.length)]
    const randomLandmark = landmarks[Math.floor(Math.random() * landmarks.length)]
    setSelectedAnimal(randomAnimal)
    setSelectedLandmark(randomLandmark)
    setError("")
  }

  // 获取下一个工具
  const nextTool = getNextTool('animal-landmark')

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
        {/* Tool Header - 封面展示区 */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-block bg-white/60 backdrop-blur-sm rounded-2xl px-8 py-4 border border-stone-100/50">
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🦊</span>
              </div>
              <h2 className="text-2xl font-light text-stone-700 tracking-wide">动物地标自拍</h2>
            </div>
          </div>
          <p className="text-stone-500 font-light tracking-wide max-w-lg mx-auto leading-relaxed">
            选择三只可爱的动物，让它们在世界著名地标前拍一张温馨的合照selfie
          </p>
          <div className="flex justify-center gap-3">
            <span className="px-4 py-2 bg-amber-100/60 text-amber-700 rounded-full text-sm font-light border border-amber-200/50">
              动物合照
            </span>
            <span className="px-4 py-2 bg-stone-100/60 text-stone-600 rounded-full text-sm font-light border border-stone-200/50">
              世界地标
            </span>
            <span className="px-4 py-2 bg-orange-100/60 text-orange-700 rounded-full text-sm font-light border border-orange-200/50">
              黄金时光
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Input Section - 用户输入区 */}
          <div className="space-y-8">
            {/* Recommended Combinations */}
            <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-light text-stone-700 flex items-center gap-3 tracking-wide">
                  <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">💡</span>
                  </div>
                  推荐组合
                </h3>
                <Button
                  variant="outline"
                  onClick={generateRandomRecommendations}
                  className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-full px-4 py-2 hover:bg-white hover:shadow-sm transition-all duration-500 ease-out text-stone-600 font-light"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎲</span>
                    <span>换一批</span>
                  </div>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {currentRecommendations.map((rec, index) => (
                  <button
                    key={index}
                    className="p-4 text-left bg-white/40 border border-stone-200/50 rounded-xl hover:bg-white/60 hover:border-stone-300/50 transition-all duration-300 group"
                    onClick={() => applyRecommendation(rec)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-stone-700 mb-1">
                          {rec.animal} × {rec.landmark}
                        </div>
                        <div className="text-sm text-stone-500 font-light">
                          {rec.description}
                        </div>
                      </div>
                      <div className="text-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                        ✨
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Animal Selection */}
            <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-light text-stone-700 flex items-center gap-3 tracking-wide">
                  <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">🐾</span>
                  </div>
                  选择动物类型
                </h3>
                <Button
                  variant="outline"
                  onClick={generateRandomAnimals}
                  className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-full px-4 py-2 hover:bg-white hover:shadow-sm transition-all duration-500 ease-out text-stone-600 font-light"
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>换一批</span>
                  </div>
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {displayedAnimals.map((animal) => (
                  <button
                    key={animal.id}
                    className={`p-4 border rounded-2xl transition-all duration-300 text-center ${
                      selectedAnimal?.id === animal.id
                        ? "bg-white border-stone-400 shadow-lg"
                        : "bg-white/80 border-stone-200/50 hover:bg-white hover:shadow-sm"
                    }`}
                    onClick={() => handleAnimalSelect(animal)}
                  >
                    <div className="text-2xl mb-2">{animal.emoji}</div>
                    <div className="text-sm font-light text-stone-700">{animal.displayName}</div>
                  </button>
                ))}
              </div>

              {/* 关键词搜索输入框 */}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="或输入自定义动物名称..."
                  value={customAnimalKeyword}
                  onChange={(e) => handleAnimalKeywordChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 border border-stone-200/50 rounded-xl text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-300/50 transition-all duration-300 font-light"
                />
              </div>

              {/* 显示当前选择状态 */}
              {(selectedAnimal || customAnimalKeyword.trim() !== "") && (
                <div className="mt-4 p-4 bg-white/60 rounded-xl border border-stone-200/50">
                  <p className="text-sm font-light text-stone-600">
                    {customAnimalKeyword.trim() !== "" 
                      ? `自定义动物：${customAnimalKeyword}`
                      : `已选择：${selectedAnimal?.emoji} ${selectedAnimal?.displayName}`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Landmark Selection */}
            <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-light text-stone-700 flex items-center gap-3 tracking-wide">
                  <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">🏛️</span>
                  </div>
                  选择地标景点
                </h3>
                <Button
                  variant="outline"
                  onClick={generateRandomLandmarks}
                  className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-full px-4 py-2 hover:bg-white hover:shadow-sm transition-all duration-500 ease-out text-stone-600 font-light"
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>换一批</span>
                  </div>
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {displayedLandmarks.map((landmark) => (
                  <button
                    key={landmark.id}
                    className={`p-4 border rounded-2xl transition-all duration-300 ${
                      selectedLandmark?.id === landmark.id
                        ? "bg-white border-stone-400 shadow-lg"
                        : "bg-white/80 border-stone-200/50 hover:bg-white hover:shadow-sm"
                    }`}
                    onClick={() => handleLandmarkSelect(landmark)}
                  >
                    <div className="text-2xl mb-2">{landmark.emoji}</div>
                    <div className="text-sm font-light text-stone-700 mb-1">{landmark.displayName}</div>
                    <div className="text-xs text-stone-500 font-light">{landmark.location}</div>
                  </button>
                ))}
              </div>

              {/* 关键词搜索输入框 */}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="或输入自定义地标名称..."
                  value={customLandmarkKeyword}
                  onChange={(e) => handleLandmarkKeywordChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/60 border border-stone-200/50 rounded-xl text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-300/50 transition-all duration-300 font-light"
                />
              </div>

              {/* 显示当前选择状态 */}
              {(selectedLandmark || customLandmarkKeyword.trim() !== "") && (
                <div className="mt-4 p-4 bg-white/60 rounded-xl border border-stone-200/50">
                  <p className="text-sm font-light text-stone-600">
                    {customLandmarkKeyword.trim() !== ""
                      ? `自定义地标：${customLandmarkKeyword}`
                      : `已选择：${selectedLandmark?.emoji} ${selectedLandmark?.displayName}`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Generate Controls - 生成控制区 */}
            <div className="text-center space-y-4">
              <div className="flex justify-center gap-4">
                <Button
                  onClick={handleShuffle}
                  disabled={isGenerating}
                  variant="outline"
                  className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-full px-6 py-3 hover:bg-white hover:shadow-sm transition-all duration-500 ease-out text-stone-600 font-light"
                >
                  <div className="flex items-center gap-2">
                    <Shuffle className="w-4 h-4" />
                    <span>随机选择</span>
                  </div>
                </Button>

                <Button
                  onClick={handleGenerate}
                  disabled={
                    (!(selectedAnimal || customAnimalKeyword.trim() !== "")) || 
                    (!(selectedLandmark || customLandmarkKeyword.trim() !== "")) || 
                    isGenerating
                  }
                  className="bg-gradient-to-r from-amber-300 to-orange-300 hover:from-amber-400 hover:to-orange-400 text-stone-700 px-12 py-6 text-lg rounded-full font-light border-0 shadow-lg hover:shadow-xl transition-all duration-700 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <span className="text-xs">📸</span>
                      </div>
                      <span>开始生成</span>
                    </div>
                  )}
                </Button>
              </div>

              {/* Progress and Error Display */}
              {isGenerating && (
                <div className="max-w-xs mx-auto">
                  <div className="bg-stone-200/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-stone-400 to-amber-400 h-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-stone-500 font-light mt-2">
                    {progress < 30 ? "正在理解动物和地标..." : 
                     progress < 60 ? "AI正在构思拍照角度..." : 
                     progress < 90 ? "正在调整光影效果..." : "即将完成拍摄..."}
                  </p>
                </div>
              )}

              {error && (
                <div className="max-w-md mx-auto">
                  <div className="bg-red-50/80 border border-red-200/50 rounded-2xl p-6 space-y-3">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="space-y-2">
                        <p className="text-red-700 font-light">{error}</p>
                        {errorDetails && (
                          <p className="text-sm text-red-600 font-light">{errorDetails}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* 根据错误类型提供不同的操作建议 */}
                    {error.includes('网络') && (
                      <div className="mt-4 p-3 bg-red-100/50 rounded-xl">
                        <p className="text-sm text-red-700 font-light">建议操作：</p>
                        <ul className="text-xs text-red-600 font-light mt-1 space-y-1">
                          <li>• 检查网络连接是否正常</li>
                          <li>• 尝试刷新页面后重试</li>
                          <li>• 如问题持续，请稍后再试</li>
                        </ul>
                      </div>
                    )}
                    
                    {error.includes('服务暂时不可用') && (
                      <div className="mt-4 p-3 bg-red-100/50 rounded-xl">
                        <p className="text-sm text-red-700 font-light">
                          系统配置问题，请联系技术支持
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section - 生成结果展示区 */}
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-light text-stone-700 flex items-center gap-3 tracking-wide">
                  <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">📷</span>
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
                      <span>变一变</span>
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
                            alt={`${selectedAnimal?.displayName}在${selectedLandmark?.displayName}的合照 ${index + 1}`}
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
                        
                        {/* AI趣评 */}
                        <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200/50 rounded-xl">
                          <p className="text-sm text-amber-800 font-light text-center">
                            "三只{selectedAnimal?.displayName}在{selectedLandmark?.displayName}前的完美合照！每只都有不同的表情，太可爱了！"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : isGenerating ? (
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-3xl animate-pulse">📸</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-stone-600 font-light">AI正在为动物们拍照...</p>
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
                          className="aspect-square rounded-xl overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-yellow-300/40 hover:scale-125 hover:z-10 hover:shadow-xl cursor-pointer"
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
                      <p className="text-sm font-light">选择动物和地标后开始生成</p>
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