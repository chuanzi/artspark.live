export interface GRSAIResponse {
  id: string
  task_id: string
  url: string
  width: number
  height: number
  progress: number
  results: Array<{
    url: string
    width: number
    height: number
  }>
  status: 'running' | 'succeeded' | 'failed'
  failure_reason: string
  error: string
}

export interface GenerateImageOptions {
  characterDescription: string
  onProgress?: (progress: number) => void
  onSuccess?: (response: GRSAIResponse) => void
  onError?: (error: string) => void
}

const PROMPT_TEMPLATE = `Create a high-resolution black-and-white portrait artwork in an editorial and artistic photography style. 

The background features a soft gradient, transitioning from medium gray to nearly pure white, evoking a sense of depth and serene atmosphere. Delicate film grain texture adds a tactile, analog-like softness to the image, reminiscent of classic monochrome photography.  
On the right side of the frame, a blurred yet striking visage of 

{CHARACTER_DESCRIPTION} 

emerges subtly from the shadows—not posed traditionally, but as if captured in a fleeting moment of thought or breath. Only fragments of his face are revealed: perhaps an eye, a cheekbone, and the curve of his lips, evoking mystery, intimacy, and elegance. His features are refined and profound, radiating a melancholic, poetic beauty without artifice.  

A gentle directional light, softly diffused, grazes the contours of his cheek or catches a glint in his eye—this is the emotional core of the image. The rest of the composition is dominated by generous negative space, intentionally minimal to allow the image to breathe. There are no words, no logos—only the interplay of light, shadow, and emotion.  

The overall mood is abstract yet deeply human, like a fleeting glance or a half-remembered dream: intimate, timeless, and hauntingly beautiful.`

export async function generatePortrait(options: GenerateImageOptions): Promise<void> {
  const { characterDescription, onProgress, onSuccess, onError } = options
  
  try {
    // 构建完整的提示词
    const prompt = PROMPT_TEMPLATE.replace('{CHARACTER_DESCRIPTION}', characterDescription)
    
    // 构建请求体
    const requestBody = {
      model: "sora-image",
      prompt: prompt,
      size: "1:1",
      variants: 1,
      shutProgress: false
    }

    // 获取环境变量
    const apiKey = process.env.GRSAI_API_KEY
    const apiUrl = process.env.GRSAI_API_URL
    
    if (!apiKey || !apiUrl) {
      throw new Error('API配置未找到，请检查环境变量设置')
    }

    // 发起请求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
    }

    // 处理流式响应
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应流')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) break
      
      buffer += decoder.decode(value, { stream: true })
      
      // 处理可能的多个JSON对象
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // 保留最后一个不完整的行
      
      for (const line of lines) {
        if (line.trim()) {
          try {
            const data: GRSAIResponse = JSON.parse(line)
            
            // 更新进度
            if (onProgress && typeof data.progress === 'number') {
              onProgress(data.progress)
            }
            
            // 检查状态
            if (data.status === 'succeeded') {
              onSuccess?.(data)
              return
            } else if (data.status === 'failed') {
              const errorMsg = data.failure_reason || data.error || '生成失败'
              onError?.(errorMsg)
              return
            }
          } catch (parseError) {
            console.warn('解析响应数据失败:', parseError, line)
          }
        }
      }
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    onError?.(errorMessage)
  }
} 