import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

export default function HomePage() {
  // 控制Today's Spark模块显示/隐藏的常量
  const SHOW_TODAYS_SPARK = false;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50/30 relative">
      {/* Subtle decorative elements */}
      <div className="absolute top-20 right-20 w-2 h-2 bg-stone-300 rounded-full opacity-40"></div>
      <div className="absolute top-40 left-16 w-1 h-1 bg-amber-300 rounded-full opacity-30"></div>
      <div className="absolute bottom-32 right-32 w-1.5 h-1.5 bg-stone-400 rounded-full opacity-25"></div>

      {/* Top Navigation */}
      <nav className="container mx-auto px-8 py-12">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Wander Button (Top Left) */}
          <Link href="/wander">
            <Button
              variant="ghost"
              className="group bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-full px-8 py-6 hover:bg-white hover:shadow-sm transition-all duration-500 ease-out"
            >
              <div className="flex items-center gap-4 text-stone-600">
                <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center group-hover:bg-stone-200 transition-colors duration-300">
                  <span className="text-sm">🚶‍♂️</span>
                </div>
                <div className="text-left">
                  <div className="font-medium text-base">Wander</div>
                  <div className="text-sm text-stone-500">慢慢探索</div>
                </div>
              </div>
            </Button>
          </Link>

          {/* Logo */}
          <div className="flex flex-col items-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl px-10 py-6 shadow-sm border border-stone-100/50">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-stone-200 to-amber-200 rounded-full flex items-center justify-center">
                  <span className="text-lg">✨</span>
                </div>
                <h1 className="text-3xl font-light text-stone-700 tracking-wide">Artspark</h1>
                <div className="w-10 h-10 bg-gradient-to-br from-amber-200 to-stone-200 rounded-full flex items-center justify-center">
                  <span className="text-lg">🎨</span>
                </div>
              </div>
              <p className="text-stone-500 text-center font-light tracking-wider">Discover, Create, Shine.</p>
            </div>
          </div>

          {/* Search Button (Top Right) */}
          <Link href="/search">
            <Button
              variant="ghost"
              className="group bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-full px-8 py-6 hover:bg-white hover:shadow-sm transition-all duration-500 ease-out"
            >
              <div className="flex items-center gap-4 text-stone-600">
                <div className="text-right">
                  <div className="font-medium text-base">Search</div>
                  <div className="text-sm text-stone-500">寻找灵感</div>
                </div>
                <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center group-hover:bg-stone-200 transition-colors duration-300">
                  <span className="text-sm">🔍</span>
                </div>
              </div>
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-8 flex flex-col items-center justify-center min-h-[60vh] max-w-4xl">
        {/* Main CTA Section */}
        <div className="text-center mb-20 space-y-12">
          {/* Inspirational Message */}
          <div className="space-y-6">
            <div className="inline-block bg-white/60 backdrop-blur-sm rounded-2xl px-8 py-4 border border-stone-100/50">
              <p className="text-stone-600 text-lg font-light tracking-wide">Less Noise. More Art.</p>
            </div>

            {/* Surprise Me Button */}
            <div className="space-y-8">
              <Link href="/surprise">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-stone-300 to-amber-300 hover:from-stone-400 hover:to-amber-400 text-stone-700 px-16 py-8 text-xl font-light rounded-full shadow-lg hover:shadow-xl transition-all duration-700 ease-out border-0 tracking-wide"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-6 h-6 bg-white/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-sm">🎲</span>
                    </div>
                    <span>SURPRISE ME</span>
                    <div className="w-6 h-6 bg-white/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-sm">✨</span>
                    </div>
                  </div>
                </Button>
              </Link>

              <p className="text-stone-500 text-sm font-light">随缘而遇，让灵感自然流淌</p>
            </div>
          </div>

          {/* Today's Spark Preview */}
          {SHOW_TODAYS_SPARK && (
          <div className="space-y-8">
            <div className="inline-block bg-white/60 backdrop-blur-sm rounded-2xl px-6 py-3 border border-stone-100/50">
              <p className="text-stone-600 font-light tracking-wide">Today's spark is...</p>
            </div>

            <Link href="/tools/portrait">
              <Card className="group max-w-xs mx-auto bg-white/80 backdrop-blur-sm border border-stone-200/50 shadow-sm hover:shadow-md transition-all duration-700 ease-out cursor-pointer rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src="/images/portrait-example.png"
                      alt="Portrait art example"
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
          )}
        </div>

        {/* Zen Quote */}
        <div className="text-center space-y-4 mb-16">
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-stone-300 to-transparent mx-auto"></div>
          <p className="text-stone-500 font-light italic tracking-wide max-w-md mx-auto leading-relaxed">
            "Art Spark in Arts Park."
          </p>
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-stone-300 to-transparent mx-auto"></div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-8 py-12 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl px-8 py-4 border border-stone-100/50 inline-block">
            <p className="text-stone-500 font-light tracking-wide">
              © 2024 Artspark - 让AI绘画带来内心的宁静与创作的喜悦
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
