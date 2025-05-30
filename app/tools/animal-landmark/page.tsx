"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, AlertCircle, Shuffle } from "lucide-react"
import Image from "next/image"
import { generateAnimalLandmarkPhoto } from "@/lib/animal-landmark-api"
import { animalTypes, landmarks, getBgColorClass, getSelectedColorClass, type AnimalType, type LandmarkType } from "@/lib/animal-landmark-data"

export default function AnimalLandmarkPage() {
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType | null>(null)
  const [selectedLandmark, setSelectedLandmark] = useState<LandmarkType | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [error, setError] = useState<string>("")

  const handleGenerate = async () => {
    if (!selectedAnimal || !selectedLandmark) {
      setError("请先选择动物和地标")
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setGeneratedImages([])
    setError("")

    await generateAnimalLandmarkPhoto({
      animalType: selectedAnimal.name,
      landmark: selectedLandmark.name,
      onProgress: (progressValue) => {
        setProgress(progressValue)
      },
      onSuccess: (response) => {
        if (response.results && response.results.length > 0) {
          setGeneratedImages(response.results.map((result: any) => result.url))
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

  const handleShuffle = () => {
    // 随机选择动物和地标
    const randomAnimal = animalTypes[Math.floor(Math.random() * animalTypes.length)]
    const randomLandmark = landmarks[Math.floor(Math.random() * landmarks.length)]
    setSelectedAnimal(randomAnimal)
    setSelectedLandmark(randomLandmark)
    setError("")
  }

  const handleAnimalSelect = (animal: AnimalType) => {
    setSelectedAnimal(animal)
    setError("")
  }

  const handleLandmarkSelect = (landmark: LandmarkType) => {
    setSelectedLandmark(landmark)
    setError("")
  }

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

          <div className="w-32"></div>
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
            {/* Animal Selection */}
            <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-light text-stone-700 mb-6 flex items-center gap-3 tracking-wide">
                <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">🐾</span>
                </div>
                选择动物类型
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                {animalTypes.map((animal) => (
                  <button
                    key={animal.id}
                    className={`p-4 border rounded-2xl transition-all duration-300 text-center ${
                      selectedAnimal?.id === animal.id
                        ? getSelectedColorClass(animal.color) + " shadow-lg"
                        : getBgColorClass(animal.color)
                    }`}
                    onClick={() => handleAnimalSelect(animal)}
                  >
                    <div className="text-2xl mb-2">{animal.emoji}</div>
                    <div className="text-sm font-light text-stone-700">{animal.displayName}</div>
                  </button>
                ))}
              </div>

              {selectedAnimal && (
                <div className="mt-4 p-4 bg-white/60 rounded-xl border border-stone-200/50">
                  <p className="text-sm font-light text-stone-600">
                    已选择：{selectedAnimal.emoji} {selectedAnimal.displayName}
                  </p>
                </div>
              )}
            </div>

            {/* Landmark Selection */}
            <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-light text-stone-700 mb-6 flex items-center gap-3 tracking-wide">
                <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">🏛️</span>
                </div>
                选择地标景点
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {landmarks.map((landmark) => (
                  <button
                    key={landmark.id}
                    className={`p-4 border rounded-2xl transition-all duration-300 ${
                      selectedLandmark?.id === landmark.id
                        ? getSelectedColorClass(landmark.color) + " shadow-lg"
                        : getBgColorClass(landmark.color)
                    }`}
                    onClick={() => handleLandmarkSelect(landmark)}
                  >
                    <div className="text-2xl mb-2">{landmark.emoji}</div>
                    <div className="text-sm font-light text-stone-700 mb-1">{landmark.displayName}</div>
                    <div className="text-xs text-stone-500 font-light">{landmark.location}</div>
                  </button>
                ))}
              </div>

              {selectedLandmark && (
                <div className="mt-4 p-4 bg-white/60 rounded-xl border border-stone-200/50">
                  <p className="text-sm font-light text-stone-600">
                    已选择：{selectedLandmark.emoji} {selectedLandmark.displayName}
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
                  disabled={!selectedAnimal || !selectedLandmark || isGenerating}
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

              {/* Progress Bar */}
              {isGenerating && (
                <div className="max-w-xs mx-auto">
                  <div className="bg-stone-200/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-orange-400 h-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-stone-500 font-light mt-2">
                    {progress < 30 ? "动物们在准备pose..." : 
                     progress < 60 ? "找到最佳拍摄角度..." : 
                     progress < 90 ? "调整光线和表情..." : "马上就要拍好啦..."}
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
                  <div className="text-center space-y-6 text-stone-500">
                    <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl">📸</span>
                    </div>
                    <div className="space-y-2">
                      <p className="font-light">还没有生成结果</p>
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