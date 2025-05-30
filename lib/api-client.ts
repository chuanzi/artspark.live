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
  aspectRatio?: string
  referenceImage?: string | null
  onProgress?: (progress: number) => void
  onSuccess?: (response: GRSAIResponse) => void
  onError?: (error: string) => void
}

export async function generatePortrait(options: GenerateImageOptions): Promise<void> {
  const { characterDescription, aspectRatio, referenceImage, onProgress, onSuccess, onError } = options
  
  try {
    // 发起请求到我们的API路由
    const response = await fetch('/api/generate-portrait', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        characterDescription,
        aspectRatio,
        referenceImage
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `请求失败: ${response.status}`)
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
            // 服务器已经处理了SSE格式，这里直接解析JSON
            const data: GRSAIResponse = JSON.parse(line.trim())
            
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
            console.warn('客户端解析响应数据失败:', parseError, line)
          }
        }
      }
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    onError?.(errorMessage)
  }
} 