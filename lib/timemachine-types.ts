// 时光机功能的TypeScript类型定义

export interface TimeMachineRequest {
  image: string | File
  target_age: string | number
}

export interface TimeMachineResponse {
  id: string
  status: 'starting' | 'processing' | 'succeeded' | 'failed'
  progress?: number
  output?: string
  url?: string
  error?: string
  logs?: string[]
  urls?: string[]
}

export interface TimeMachineOptions {
  image: string | File
  targetAge: string
  onProgress?: (progress: number) => void
  onSuccess?: (imageUrl: string) => void
  onError?: (error: string) => void
}

// 年龄预设选项
export interface AgePreset {
  label: string
  value: string
  description: string
  ageRange: number
}

// 年龄预设数据
export const AGE_PRESETS: AgePreset[] = [
  {
    label: "童年",
    value: "18",
    description: "青春活力",
    ageRange: 18
  },
  {
    label: "青年",
    value: "25", 
    description: "朝气蓬勃",
    ageRange: 25
  },
  {
    label: "中年",
    value: "45",
    description: "成熟稳重", 
    ageRange: 45
  },
  {
    label: "老年",
    value: "70",
    description: "智慧沉淀",
    ageRange: 70
  }
]

// 错误类型定义
export type TimeMachineErrorType = 
  | 'network_error'
  | 'invalid_image_format'
  | 'image_too_large'
  | 'api_quota_exceeded'
  | 'face_detection_failed'
  | 'processing_timeout'
  | 'unknown_error'

export interface TimeMachineError {
  type: TimeMachineErrorType
  message: string
  details?: string
} 