import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toolsConfig } from "@/lib/tools-config"

const getBgColor = (color: string) => {
  const colors: Record<string, string> = {
    stone: "bg-stone-50/80",
    amber: "bg-amber-50/80",
    orange: "bg-orange-50/80",
    slate: "bg-slate-50/80",
    neutral: "bg-neutral-50/80",
    zinc: "bg-zinc-50/80",
  }
  return colors[color] || "bg-stone-50/80"
}

export default function WanderPage() {
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

      {/* Page Title */}
      <div className="container mx-auto px-8 py-8 max-w-4xl">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-block bg-white/60 backdrop-blur-sm rounded-2xl px-8 py-4 border border-stone-100/50">
            <h2 className="text-2xl font-light text-stone-700 tracking-wide">探索创作工具</h2>
          </div>
          <p className="text-stone-500 font-light tracking-wide max-w-md mx-auto leading-relaxed">
            慢慢浏览，找到与你心灵共鸣的创作方式
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {toolsConfig.map((tool) => (
            <Link key={tool.id} href={tool.path}>
              <div className="group">
                <div
                  className={`relative ${getBgColor(tool.color)} backdrop-blur-sm border border-stone-200/50 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-700 ease-out hover:scale-[1.02]`}
                >
                  {tool.comingSoon && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-stone-200/80 backdrop-blur-sm rounded-full px-3 py-1 border border-stone-300/50">
                        <span className="text-xs font-light text-stone-600">即将推出</span>
                      </div>
                    </div>
                  )}

                  {tool.popularity > 0 && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-amber-100/80 backdrop-blur-sm rounded-full px-3 py-1 border border-amber-200/50 flex items-center gap-1">
                        <span className="text-amber-600 text-xs">⭐</span>
                        <span className="text-xs font-light text-amber-700">{tool.popularity}</span>
                      </div>
                    </div>
                  )}

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
                          className="px-3 py-1 bg-white/60 text-stone-600 rounded-full text-xs font-light border border-stone-200/50"
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
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* More Coming Soon */}
        <div className="text-center space-y-8">
          <div className="inline-block bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-3 border border-stone-100/50">
            <h3 className="text-lg font-light text-stone-700 tracking-wide">更多工具正在路上</h3>
          </div>
          <p className="text-stone-500 font-light leading-relaxed max-w-md mx-auto">
            我们正在用心开发更多治愈系的AI创作工具
          </p>
          <Link href="/search">
            <Button
              variant="outline"
              className="bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-full px-8 py-4 hover:bg-white hover:shadow-sm transition-all duration-500 ease-out text-stone-600 font-light"
            >
              搜索现有工具
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
