"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { getRandomTool, type ToolConfig } from "@/lib/tools-config"

export default function SurprisePage() {
  const [currentTool, setCurrentTool] = useState<ToolConfig | null>(null)

  // 初始化时选择随机工具
  useEffect(() => {
    setCurrentTool(getRandomTool())
  }, [])

  // 重新随机选择工具
  const handleSurpriseAgain = () => {
    setCurrentTool(getRandomTool())
  }

  if (!currentTool) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50/30 relative flex items-center justify-center">
        <div className="animate-pulse text-stone-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50/30 relative">
      {/* Subtle decorative elements */}
      <div className="absolute top-20 right-20 w-2 h-2 bg-stone-300 rounded-full opacity-40"></div>
      <div className="absolute top-40 left-16 w-1 h-1 bg-amber-300 rounded-full opacity-30"></div>
      <div className="absolute bottom-32 right-32 w-1.5 h-1.5 bg-stone-400 rounded-full opacity-25"></div>

      {/* Main Content */}
      <main className="container mx-auto px-8 flex flex-col items-center justify-center min-h-screen max-w-2xl">
        <div className="text-center space-y-12">
          {/* Tool Preview Card */}
          <div className="space-y-8">
            <Link href={currentTool.path}>
              <Card className="group max-w-sm mx-auto bg-white/80 backdrop-blur-sm border border-stone-200/50 shadow-lg hover:shadow-xl transition-all duration-700 ease-out cursor-pointer rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={currentTool.exampleImage}
                      alt={`${currentTool.name} 示例`}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <span className="text-2xl">{currentTool.emoji}</span>
                      <h3 className="text-xl font-light text-stone-700 tracking-wide">{currentTool.name}</h3>
                    </div>
                    <p className="text-stone-500 font-light text-sm tracking-wide">{currentTool.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Surprise Again Button */}
          <div className="space-y-6">
            <Button
              onClick={handleSurpriseAgain}
              className="group bg-gradient-to-r from-stone-200 to-amber-200 hover:from-stone-300 hover:to-amber-300 text-stone-700 px-12 py-6 text-lg rounded-full font-light border-0 shadow-lg hover:shadow-xl transition-all duration-700 ease-out"
            >
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-white/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-sm">🎲</span>
                </div>
                <span>不喜欢，再来一次</span>
                <div className="w-6 h-6 bg-white/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-sm">✨</span>
                </div>
              </div>
            </Button>

            <p className="text-stone-500 text-sm font-light">每一次点击都是新的惊喜</p>
          </div>

          {/* Back to Home Link */}
          <div className="pt-8">
            <Link href="/">
              <Button
                variant="ghost"
                className="group bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-full px-8 py-4 hover:bg-white hover:shadow-sm transition-all duration-500 ease-out"
              >
                <div className="flex items-center gap-3 text-stone-600">
                  <span className="font-light">返回首页</span>
                  <div className="w-6 h-6 bg-stone-100 rounded-full flex items-center justify-center group-hover:bg-stone-200 transition-colors duration-300">
                    <span className="text-xs">🏠</span>
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
