export interface AnimalType {
  id: string
  name: string
  displayName: string
  emoji: string
  color: string
}

export interface LandmarkType {
  id: string
  name: string
  displayName: string
  emoji: string
  location: string
  color: string
}

export const animalTypes: AnimalType[] = [
  {
    id: "cats",
    name: "cats",
    displayName: "猫咪",
    emoji: "🐱",
    color: "pink"
  },
  {
    id: "dogs", 
    name: "dogs",
    displayName: "狗狗",
    emoji: "🐶",
    color: "blue"
  },
  {
    id: "pandas",
    name: "pandas", 
    displayName: "熊猫",
    emoji: "🐼",
    color: "slate"
  },
  {
    id: "foxes",
    name: "foxes",
    displayName: "狐狸", 
    emoji: "🦊",
    color: "orange"
  },
  {
    id: "rabbits",
    name: "rabbits",
    displayName: "兔子",
    emoji: "🐰",
    color: "purple"
  },
  {
    id: "bears",
    name: "bears",
    displayName: "小熊",
    emoji: "🐻",
    color: "amber"
  },
  {
    id: "penguins",
    name: "penguins",
    displayName: "企鹅",
    emoji: "🐧",
    color: "cyan"
  },
  {
    id: "elephants",
    name: "elephants",
    displayName: "大象",
    emoji: "🐘",
    color: "gray"
  },
  {
    id: "lions",
    name: "lions",
    displayName: "狮子",
    emoji: "🦁",
    color: "yellow"
  }
]

export const landmarks: LandmarkType[] = [
  {
    id: "eiffel-tower",
    name: "Eiffel Tower",
    displayName: "埃菲尔铁塔",
    emoji: "🗼",
    location: "巴黎",
    color: "rose"
  },
  {
    id: "great-wall",
    name: "Great Wall of China",
    displayName: "万里长城", 
    emoji: "🏰",
    location: "中国",
    color: "emerald"
  },
  {
    id: "statue-liberty",
    name: "Statue of Liberty",
    displayName: "自由女神像",
    emoji: "🗽",
    location: "纽约",
    color: "green"
  },
  {
    id: "mount-fuji",
    name: "Mount Fuji",
    displayName: "富士山",
    emoji: "🗻",
    location: "日本",
    color: "blue"
  },
  {
    id: "tower-bridge",
    name: "Tower Bridge",
    displayName: "伦敦塔桥",
    emoji: "🌉",
    location: "伦敦",
    color: "indigo"
  },
  {
    id: "sydney-opera",
    name: "Sydney Opera House",
    displayName: "悉尼歌剧院",
    emoji: "🎭",
    location: "悉尼",
    color: "teal"
  },
  {
    id: "taj-mahal",
    name: "Taj Mahal",
    displayName: "泰姬陵",
    emoji: "🕌",
    location: "印度",
    color: "pink"
  },
  {
    id: "big-ben",
    name: "Big Ben",
    displayName: "大本钟",
    emoji: "🕰️",
    location: "伦敦", 
    color: "amber"
  },
  {
    id: "christ-redeemer",
    name: "Christ the Redeemer",
    displayName: "基督像",
    emoji: "⛪",
    location: "里约",
    color: "sky"
  }
]

export const getBgColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    pink: "bg-pink-50/80 border-pink-200/50 hover:bg-pink-100/80",
    blue: "bg-blue-50/80 border-blue-200/50 hover:bg-blue-100/80", 
    slate: "bg-slate-50/80 border-slate-200/50 hover:bg-slate-100/80",
    orange: "bg-orange-50/80 border-orange-200/50 hover:bg-orange-100/80",
    purple: "bg-purple-50/80 border-purple-200/50 hover:bg-purple-100/80",
    amber: "bg-amber-50/80 border-amber-200/50 hover:bg-amber-100/80",
    cyan: "bg-cyan-50/80 border-cyan-200/50 hover:bg-cyan-100/80",
    gray: "bg-gray-50/80 border-gray-200/50 hover:bg-gray-100/80",
    yellow: "bg-yellow-50/80 border-yellow-200/50 hover:bg-yellow-100/80",
    rose: "bg-rose-50/80 border-rose-200/50 hover:bg-rose-100/80",
    emerald: "bg-emerald-50/80 border-emerald-200/50 hover:bg-emerald-100/80",
    green: "bg-green-50/80 border-green-200/50 hover:bg-green-100/80",
    indigo: "bg-indigo-50/80 border-indigo-200/50 hover:bg-indigo-100/80",
    teal: "bg-teal-50/80 border-teal-200/50 hover:bg-teal-100/80",
    sky: "bg-sky-50/80 border-sky-200/50 hover:bg-sky-100/80"
  }
  return colorMap[color] || "bg-stone-50/80 border-stone-200/50 hover:bg-stone-100/80"
}

export const getSelectedColorClass = (color: string): string => {
  const colorMap: Record<string, string> = {
    pink: "bg-pink-100 border-pink-300 shadow-pink-200/50",
    blue: "bg-blue-100 border-blue-300 shadow-blue-200/50",
    slate: "bg-slate-100 border-slate-300 shadow-slate-200/50", 
    orange: "bg-orange-100 border-orange-300 shadow-orange-200/50",
    purple: "bg-purple-100 border-purple-300 shadow-purple-200/50",
    amber: "bg-amber-100 border-amber-300 shadow-amber-200/50",
    cyan: "bg-cyan-100 border-cyan-300 shadow-cyan-200/50",
    gray: "bg-gray-100 border-gray-300 shadow-gray-200/50",
    yellow: "bg-yellow-100 border-yellow-300 shadow-yellow-200/50",
    rose: "bg-rose-100 border-rose-300 shadow-rose-200/50",
    emerald: "bg-emerald-100 border-emerald-300 shadow-emerald-200/50",
    green: "bg-green-100 border-green-300 shadow-green-200/50",
    indigo: "bg-indigo-100 border-indigo-300 shadow-indigo-200/50",
    teal: "bg-teal-100 border-teal-300 shadow-teal-200/50",
    sky: "bg-sky-100 border-sky-300 shadow-sky-200/50"
  }
  return colorMap[color] || "bg-stone-100 border-stone-300 shadow-stone-200/50"
} 