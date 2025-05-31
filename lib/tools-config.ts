export interface ToolConfig {
  id: string
  name: string
  description: string
  exampleImage: string
  path: string
  emoji: string
  tags: string[]
  keywords: string[]
  difficulty: string
  time: string
  popularity: number
  color: string
  comingSoon?: boolean
}

export const toolsConfig: ToolConfig[] = [
  {
    id: "portrait",
    name: "黑白肖像艺术",
    description: "生成电影风格的黑白艺术肖像",
    exampleImage: "/images/tools/portrait-example-1.png",
    path: "/tools/portrait",
    emoji: "🎭",
    tags: ["人物", "黑白", "艺术"],
    keywords: ["人物", "黑白", "艺术", "肖像", "电影", "风格"],
    difficulty: "简单",
    time: "30秒",
    popularity: 4.8,
    color: "stone"
  },
  {
    id: "animal-landmark",
    name: "动物地标融合",
    description: "将动物与著名地标巧妙融合",
    exampleImage: "/images/tools/animal-landmark-example-1.png", 
    path: "/tools/animal-landmark",
    emoji: "🦁",
    tags: ["动物", "地标", "有趣"],
    keywords: ["动物", "地标", "有趣", "融合", "创意", "拟人"],
    difficulty: "简单",
    time: "45秒",
    popularity: 4.9,
    color: "amber"
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

// 获取下一个工具（循环）
export function getNextTool(currentToolId: string): ToolConfig {
  if (currentToolId === "portrait") {
    return toolsConfig.find(tool => tool.id === "animal-landmark")!
  }
  if (currentToolId === "animal-landmark") {
    return toolsConfig.find(tool => tool.id === "portrait")!
  }
  
  // 默认返回第一个工具
  return toolsConfig[0]
} 