import promptmaker from 'promptmaker'

// 类型定义
export interface PortraitPrompt {
  text: string
  isEnglish: boolean
}

export interface AnimalLandmarkCombination {
  animal: string
  landmark: string
  description: string
  isGenerated: boolean
}

// 扩展的中文人物描述词库
const chinesePortraitPrompts = [
  "神秘的蒙面侠客",
  "优雅的古典舞者", 
  "睿智的老学者",
  "勇敢的女战士",
  "温柔的母亲",
  "叛逆的摇滚歌手",
  "沉思的哲学家",
  "快乐的小丑",
  "高贵的贵族",
  "朴实的农夫",
  "现代都市白领",
  "古风美人",
  "科幻战士",
  "温暖的老奶奶",
  "阳光少年",
  "冷酷的杀手",
  "慈祥的爷爷",
  "活泼的学生",
  "神秘的魔法师",
  "帅气的飞行员"
]

// 中文艺术风格词库（基于promptmaker数据）
const chineseArtStyles = [
  "水彩画风格", "油画质感", "素描效果", "国画意境", "插画风格",
  "写实主义", "印象派", "抽象派", "超现实主义", "古典主义",
  "现代艺术", "街头艺术", "波普艺术", "极简主义", "表现主义"
]

const chinesePersonTypes = [
  "商务人士", "艺术家", "学者", "运动员", "音乐家", 
  "舞蹈家", "作家", "科学家", "医生", "教师",
  "工程师", "设计师", "厨师", "摄影师", "画家"
]

const chinesePersonTraits = [
  "温和的", "坚毅的", "优雅的", "神秘的", "智慧的",
  "勇敢的", "温暖的", "冷静的", "活泼的", "沉稳的",
  "自信的", "谦逊的", "幽默的", "严肃的", "亲切的"
]

// 扩展的中文动物地标组合
const chineseAnimalLandmarkCombinations = [
  { animal: "熊猫", landmark: "万里长城", description: "憨态可掬的熊猫在万里长城前的皇家范儿" },
  { animal: "企鹅", landmark: "自由女神像", description: "优雅的企鹅与自由女神的经典邂逅" },
  { animal: "狮子", landmark: "悉尼歌剧院", description: "威严狮王在悉尼歌剧院前的霸气pose" },
  { animal: "大象", landmark: "泰姬陵", description: "温柔大象与印度古迹的神秘邂逅" },
  { animal: "老虎", landmark: "巴黎铁塔", description: "威猛老虎在浪漫铁塔下的优雅瞬间" },
  { animal: "长颈鹿", landmark: "比萨斜塔", description: "高挑长颈鹿与斜塔的创意对比" },
  { animal: "考拉", landmark: "金门大桥", description: "慵懒考拉在雄伟大桥前的悠闲时光" },
  { animal: "袋鼠", landmark: "故宫", description: "活泼袋鼠在古典宫殿前的奇妙穿越" }
]

// 中文动物类型
const chineseAnimals = [
  "小猫", "小狗", "狮子", "老虎", "大象", "长颈鹿",
  "熊猫", "棕熊", "狼", "狐狸", "兔子", "梅花鹿",
  "老鹰", "猫头鹰", "企鹅", "海豚", "鲸鱼", "鲨鱼",
  "猴子", "大猩猩", "斑马", "马", "奶牛", "绵羊",
  "孔雀", "鹦鹉", "海龟", "北极熊", "考拉", "袋鼠"
]

// 中文地标
const chineseLandmarks = [
  "埃菲尔铁塔", "大本钟", "自由女神像", "万里长城",
  "泰姬陵", "悉尼歌剧院", "古罗马斗兽场", "金字塔",
  "富士山", "金门大桥", "伦敦塔桥", "巨石阵",
  "马丘比丘", "救世基督像", "迪拜塔", "圣家大教堂",
  "故宫", "天坛", "颐和园", "桂林山水"
]

/**
 * 为 Portrait Tool 生成纯中文的灵感提示
 * 结合固定词库和动态生成，确保多样性
 */
export function generatePortraitInspiration(count: number = 6): PortraitPrompt[] {
  const results: PortraitPrompt[] = []
  
  try {
    // 生成一部分固定的中文提示
    const fixedCount = Math.floor(count / 3)
    const shuffledFixed = [...chinesePortraitPrompts].sort(() => 0.5 - Math.random())
    
    for (let i = 0; i < fixedCount && i < shuffledFixed.length; i++) {
      results.push({
        text: shuffledFixed[i],
        isEnglish: false
      })
    }
    
    // 生成动态组合的中文提示
    const dynamicCount = count - fixedCount
    for (let i = 0; i < dynamicCount; i++) {
      try {
        // 随机组合中文描述
        const trait = chinesePersonTraits[Math.floor(Math.random() * chinesePersonTraits.length)]
        const person = chinesePersonTypes[Math.floor(Math.random() * chinesePersonTypes.length)]
        const style = Math.random() > 0.6 ? `，${chineseArtStyles[Math.floor(Math.random() * chineseArtStyles.length)]}` : ""
        
        const dynamicPrompt = `${trait}${person}${style}`
        
        results.push({
          text: dynamicPrompt,
          isEnglish: false
        })
      } catch (error) {
        console.warn('生成动态中文提示失败，使用备用提示:', error)
        // 如果生成失败，使用备用中文提示
        const fallbackIndex = (i + fixedCount) % chinesePortraitPrompts.length
        results.push({
          text: chinesePortraitPrompts[fallbackIndex],
          isEnglish: false
        })
      }
    }
    
    // 确保不重复，如果有重复则替换
    const uniqueResults: PortraitPrompt[] = []
    const usedTexts = new Set<string>()
    
    for (const result of results) {
      if (!usedTexts.has(result.text)) {
        uniqueResults.push(result)
        usedTexts.add(result.text)
      } else {
        // 替换重复项
        let newText: string
        let attempts = 0
        do {
          const trait = chinesePersonTraits[Math.floor(Math.random() * chinesePersonTraits.length)]
          const person = chinesePersonTypes[Math.floor(Math.random() * chinesePersonTypes.length)]
          newText = `${trait}${person}`
          attempts++
        } while (usedTexts.has(newText) && attempts < 10)
        
        if (!usedTexts.has(newText)) {
          uniqueResults.push({
            text: newText,
            isEnglish: false
          })
          usedTexts.add(newText)
        }
      }
    }
    
    // 随机打乱结果
    return uniqueResults.sort(() => 0.5 - Math.random())
    
  } catch (error) {
    console.error('生成肖像提示失败，使用备用方案:', error)
    // 完全失败时，返回中文提示
    return chinesePortraitPrompts.slice(0, count).map(text => ({
      text,
      isEnglish: false
    }))
  }
}

/**
 * 为 Animal Landmark Tool 生成纯中文的推荐组合
 * 结合固定组合和动态生成，确保多样性
 */
export function generateAnimalLandmarkCombinations(count: number = 4): AnimalLandmarkCombination[] {
  const results: AnimalLandmarkCombination[] = []
  
  try {
    // 生成一部分固定的中文组合
    const fixedCount = Math.floor(count / 2)
    const shuffledFixed = [...chineseAnimalLandmarkCombinations].sort(() => 0.5 - Math.random())
    
    for (let i = 0; i < fixedCount && i < shuffledFixed.length; i++) {
      results.push({
        ...shuffledFixed[i],
        isGenerated: false
      })
    }
    
    // 生成动态的中文组合
    const dynamicCount = count - fixedCount
    for (let i = 0; i < dynamicCount; i++) {
      try {
        const animal = chineseAnimals[Math.floor(Math.random() * chineseAnimals.length)]
        const landmark = chineseLandmarks[Math.floor(Math.random() * chineseLandmarks.length)]
        
        // 生成中文风格的描述
        const descriptions = [
          `${animal}在${landmark}前的温馨合影`,
          `${animal}与${landmark}的完美邂逅`,
          `${animal}在${landmark}下的优雅身姿`,
          `${animal}与${landmark}的浪漫时光`,
          `${animal}在${landmark}前的可爱瞬间`,
          `${animal}与${landmark}的奇妙组合`
        ]
        
        const description = descriptions[Math.floor(Math.random() * descriptions.length)]
        
        results.push({
          animal: animal,
          landmark: landmark,
          description: description,
          isGenerated: true
        })
      } catch (error) {
        console.warn('生成动态中文组合失败，使用备用组合:', error)
        // 如果生成失败，使用备用中文组合
        const fallbackIndex = (i + fixedCount) % chineseAnimalLandmarkCombinations.length
        results.push({
          ...chineseAnimalLandmarkCombinations[fallbackIndex],
          isGenerated: false
        })
      }
    }
    
    // 确保动物和地标组合不重复
    const uniqueResults: AnimalLandmarkCombination[] = []
    const usedCombinations = new Set<string>()
    
    for (const result of results) {
      const combinationKey = `${result.animal}-${result.landmark}`
      if (!usedCombinations.has(combinationKey)) {
        uniqueResults.push(result)
        usedCombinations.add(combinationKey)
      } else {
        // 替换重复项
        let newAnimal: string, newLandmark: string, newKey: string
        let attempts = 0
        do {
          newAnimal = chineseAnimals[Math.floor(Math.random() * chineseAnimals.length)]
          newLandmark = chineseLandmarks[Math.floor(Math.random() * chineseLandmarks.length)]
          newKey = `${newAnimal}-${newLandmark}`
          attempts++
        } while (usedCombinations.has(newKey) && attempts < 10)
        
        if (!usedCombinations.has(newKey)) {
          const descriptions = [
            `${newAnimal}在${newLandmark}前的温馨合影`,
            `${newAnimal}与${newLandmark}的完美邂逅`,
            `${newAnimal}在${newLandmark}下的优雅身姿`
          ]
          
          uniqueResults.push({
            animal: newAnimal,
            landmark: newLandmark,
            description: descriptions[Math.floor(Math.random() * descriptions.length)],
            isGenerated: true
          })
          usedCombinations.add(newKey)
        }
      }
    }
    
    // 随机打乱结果
    return uniqueResults.sort(() => 0.5 - Math.random())
    
  } catch (error) {
    console.error('生成动物地标组合失败，使用备用方案:', error)
    // 完全失败时，返回中文组合
    return chineseAnimalLandmarkCombinations.slice(0, count).map(combo => ({
      ...combo,
      isGenerated: false
    }))
  }
} 