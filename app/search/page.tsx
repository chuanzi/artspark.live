"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search } from "lucide-react"

const allTools = [
  {
    id: "portrait",
    name: "黑白肖像艺术",
    description: "一键生成电影风格的黑白人物画",
    image: "/placeholder.svg?height=300&width=400",
    tags: ["人物", "黑白", "艺术", "电影", "肖像"],
    keywords: ["人物", "肖像", "黑白", "电影", "艺术", "经典"],
    difficulty: "简单",
    time: "30秒",
    popularity: 4.8,
    href: "/tools/portrait",
    emoji: "🎭",
    color: "stone",
  },
  {
    id: "animal-landmark",
    name: "动物地标自拍",
    description: "拟人动物在世界各地地标自拍照",
    image: "/placeholder.svg?height=300&width=400",
    tags: ["动物", "地标", "有趣", "自拍"],
    keywords: ["动物", "地标", "自拍", "旅行", "有趣", "可爱"],
    difficulty: "简单",
    time: "45秒",
    popularity: 4.9,
    href: "/tools/animal-landmark",
    emoji: "🦊",
    color: "amber",
  },
  {
    id: "treasure-map",
    name: "古代藏宝图",
    description: "上传地图图像 → 风格化成秘宝地图",
    image: "/placeholder.svg?height=300&width=400",
    tags: ["地图", "古代", "冒险", "上传"],
    keywords: ["地图", "古代", "冒险", "宝藏", "探险", "神秘"],
    difficulty: "中等",
    time: "60秒",
    popularity: 4.6,
    href: "/tools/treasure-map",
    emoji: "🗺️",
    color: "orange",
  },
  {
    id: "half-illustration",
    name: "Half Illustration",
    description: "半风格化插画",
    image: "/placeholder.svg?height=300&width=400",
    tags: ["插画", "现代", "创意", "风格化"],
    keywords: ["插画", "现代", "创意", "艺术", "风格", "设计"],
    difficulty: "中等",
    time: "50秒",
    popularity: 4.7,
    href: "/tools/half-illustration",
    emoji: "🖌️",
    color: "slate",
  },
  {
    id: "neo-impressionism",
    name: "Neo-Impressionism",
    description: "新印象派画风",
    image: "/placeholder.svg?height=300&width=400",
    tags: ["印象派", "经典", "艺术", "绘画"],
    keywords: ["印象派", "经典", "艺术", "绘画", "色彩", "笔触"],
    difficulty: "简单",
    time: "40秒",
    popularity: 4.5,
    href: "/tools/neo-impressionism",
    emoji: "🎨",
    color: "neutral",
  },
]

const popularKeywords = [
  "人物",
  "动物",
  "风景",
  "艺术",
  "黑白",
  "彩色",
  "现代",
  "古代",
  "可爱",
  "神秘",
  "浪漫",
  "科幻",
  "梦幻",
  "简单",
  "复杂",
]

const getBgColor = (color: string) => {
  const colors: Record<string, string> = {
    stone: "bg-stone-50/80",
    amber: "bg-amber-50/80",
    orange: "bg-orange-50/80",
    slate: "bg-slate-50/80",
    neutral: "bg-neutral-50/80",
  }
  return colors[color] || "bg-stone-50/80"
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTools, setFilteredTools] = useState(allTools)

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setFilteredTools(allTools)
      return
    }

    const filtered = allTools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase()) ||
        tool.keywords.some((keyword) => keyword.toLowerCase().includes(query.toLowerCase())),
    )

    setFilteredTools(filtered)
  }

  const handleKeywordClick = (keyword: string) => {
    handleSearch(keyword)
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
          <Link href="/">
            <Button
              variant="ghost"
              className="group bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-full px-6 py-4 hover:bg-white hover:shadow-sm transition-all duration-500 ease-out"
            >
              <div className="flex items-center gap-3 text-stone-600">
                <ArrowLeft className="w-4 h-4" />
                <span className="font-light">返回首页</span>
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

      <div className="container mx-auto px-8 py-8 max-w-4xl">
        {/* Page Title */}
        <div className="text-center mb-16 space-y-6">
          <div className="inline-block bg-white/60 backdrop-blur-sm rounded-2xl px-8 py-4 border border-stone-100/50">
            <h2 className="text-2xl font-light text-stone-700 tracking-wide">搜索创作工具</h2>
          </div>
          <p className="text-stone-500 font-light tracking-wide max-w-md mx-auto leading-relaxed">
            通过关键词寻找与你心境相符的创作方式
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <div className="bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-full p-1 shadow-sm">
              <div className="flex items-center">
                <Search className="absolute left-6 text-stone-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="搜索工具、风格、关键词..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-14 pr-6 py-4 text-base border-0 focus:ring-0 rounded-full bg-transparent font-light tracking-wide placeholder:text-stone-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Popular Keywords */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-8">
            <div className="inline-block bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-3 border border-stone-100/50">
              <h3 className="text-lg font-light text-stone-700 tracking-wide">热门关键词</h3>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {popularKeywords.map((keyword, index) => (
              <button
                key={keyword}
                onClick={() => handleKeywordClick(keyword)}
                className="px-4 py-2 bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-full text-stone-600 font-light text-sm hover:bg-white hover:shadow-sm transition-all duration-500 ease-out"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div className="max-w-5xl mx-auto">
          {searchQuery && (
            <div className="mb-8 text-center">
              <div className="inline-block bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-3 border border-stone-100/50">
                <p className="text-stone-600 font-light tracking-wide">
                  搜索 "<span className="text-amber-700">{searchQuery}</span>" 找到{" "}
                  <span className="text-amber-700">{filteredTools.length}</span> 个结果
                </p>
              </div>
            </div>
          )}

          {filteredTools.length === 0 ? (
            <div className="text-center space-y-8">
              <div className="bg-white/60 backdrop-blur-sm border border-stone-200/50 rounded-3xl p-16 shadow-sm">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-xl font-light text-stone-700 mb-4 tracking-wide">没有找到相关工具</h3>
                <p className="text-stone-500 font-light mb-8 leading-relaxed">试试其他关键词，或者浏览所有工具</p>
                <Link href="/wander">
                  <Button className="bg-gradient-to-r from-stone-300 to-amber-300 hover:from-stone-400 hover:to-amber-400 text-stone-700 px-8 py-3 rounded-full font-light border-0 shadow-sm hover:shadow-md transition-all duration-500">
                    浏览所有工具
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTools.map((tool) => (
                <Link key={tool.id} href={tool.href}>
                  <div className="group">
                    <div
                      className={`relative ${getBgColor(tool.color)} backdrop-blur-sm border border-stone-200/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-700 ease-out hover:scale-[1.02]`}
                    >
                      <div className="absolute top-4 right-4">
                        <div className="bg-amber-100/80 backdrop-blur-sm rounded-full px-3 py-1 border border-amber-200/50 flex items-center gap-1">
                          <span className="text-amber-600 text-xs">⭐</span>
                          <span className="text-xs font-light text-amber-700">{tool.popularity}</span>
                        </div>
                      </div>

                      <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                          <span className="text-2xl">{tool.emoji}</span>
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-lg font-light text-stone-700 tracking-wide">{tool.name}</h3>
                          <p className="text-stone-500 font-light text-sm leading-relaxed">{tool.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center">
                          {tool.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-white/60 text-stone-600 rounded-full text-xs font-light border border-stone-200/50 cursor-pointer hover:bg-white transition-colors duration-300"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleKeywordClick(tag)
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-center gap-6 text-xs text-stone-500 font-light">
                          <div className="flex items-center gap-1">
                            <span>👤</span>
                            <span>{tool.difficulty}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>⏱️</span>
                            <span>{tool.time}</span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Button className="bg-gradient-to-r from-stone-300 to-amber-300 hover:from-stone-400 hover:to-amber-400 text-stone-700 px-6 py-2 rounded-full font-light border-0 shadow-sm hover:shadow-md transition-all duration-500">
                            开始创作
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
