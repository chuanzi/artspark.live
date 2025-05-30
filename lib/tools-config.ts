export interface ToolConfig {
  id: string
  name: string
  description: string
  exampleImage: string
  path: string
  emoji: string
}

export const toolsConfig: ToolConfig[] = [
  {
    id: "portrait",
    name: "黑白肖像艺术",
    description: "生成电影风格的黑白艺术肖像",
    exampleImage: "/images/tools/portrait-example-1.png",
    path: "/tools/portrait",
    emoji: "🎭"
  },
  {
    id: "animal-landmark",
    name: "动物地标融合",
    description: "将动物与著名地标巧妙融合",
    exampleImage: "/images/tools/animal-landmark-example-1.png", 
    path: "/tools/animal-landmark",
    emoji: "🦁"
  },
  {
    id: "treasure-map",
    name: "宝藏地图生成",
    description: "创造神秘的古代宝藏地图",
    exampleImage: "/images/tools/treasure-map-example.jpg",
    path: "/tools/treasure-map", 
    emoji: "🗺️"
  },
  {
    id: "half-illustration",
    name: "半插画风格",
    description: "现实与插画的完美结合",
    exampleImage: "/images/tools/half-illustration-example.jpg",
    path: "/tools/half-illustration",
    emoji: "🎨"
  },
  {
    id: "neo-impressionism",
    name: "新印象派艺术",
    description: "点彩技法的现代诠释",
    exampleImage: "/images/tools/neo-impressionism-example.jpg",
    path: "/tools/neo-impressionism",
    emoji: "🌈"
  }
]

// 获取随机工具
export function getRandomTool(): ToolConfig {
  const randomIndex = Math.floor(Math.random() * toolsConfig.length)
  return toolsConfig[randomIndex]
}

// 根据ID获取工具
export function getToolById(id: string): ToolConfig | undefined {
  return toolsConfig.find(tool => tool.id === id)
}

// 获取下一个工具（循环逻辑）
export function getNextTool(currentToolId: string): ToolConfig {
  const currentIndex = toolsConfig.findIndex(tool => tool.id === currentToolId)
  const nextIndex = (currentIndex + 1) % toolsConfig.length
  return toolsConfig[nextIndex]
} 