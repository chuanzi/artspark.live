export interface AnimalLandmarkOptions {
  animalType: string
  landmark: string
  onProgress?: (progress: number) => void
  onSuccess?: (response: any) => void
  onError?: (error: string) => void
}

const PROMPT_TEMPLATE = `Three {ANIMAL_TYPE} taking a close-up selfie in front of the iconic {LANDMARK}, each with different expressions, captured during golden hour with cinematic lighting. The animals are close to the camera, heads touching, mimicking a selfie pose, displaying expressions of joy, surprise, and calm. The background showcases the complete architectural details of the {LANDMARK}, with soft lighting and a warm atmosphere. Shot in a photographic, realistic-cartoon style, highly detailed, with a 1:1 aspect ratio.`

// 客户端配置
const CLIENT_TIMEOUT = 120000 // 2分钟客户端超时
const MAX_RETRIES = 2 // 最大重试次数

export async function generateAnimalLandmarkPhoto(options: AnimalLandmarkOptions): Promise<void> {
  const { animalType, landmark, onProgress, onSuccess, onError } = options
  
  let retryCount = 0
  
  const attemptGeneration = async (): Promise<void> => {
    try {
      console.log(`开始生成请求 (尝试 ${retryCount + 1}/${MAX_RETRIES + 1})`)
      
      // 创建超时控制器
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.warn('客户端请求超时')
      }, CLIENT_TIMEOUT)
      
      // 发起请求到我们的API路由
      const response = await fetch('/api/generate-animal-landmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          animalType: animalType.trim(),
          landmark: landmark.trim()
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: `请求失败 (HTTP ${response.status})` }
        }
        
        // 判断是否需要重试
        const shouldRetry = response.status >= 500 && retryCount < MAX_RETRIES
        
        if (shouldRetry) {
          retryCount++
          console.log(`服务器错误 (${response.status})，等待 ${retryCount * 3} 秒后重试...`)
          await new Promise(resolve => setTimeout(resolve, retryCount * 3000))
          return attemptGeneration()
        }
        
        throw new Error(errorData.error || `请求失败: ${response.status}`)
      }

      // 处理流式响应
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let lastUpdateTime = Date.now()
      const staleConnectionTimeout = 60000 // 60秒无数据视为连接断开

      // 连接健康监控
      const healthMonitor = setInterval(() => {
        const timeSinceLastUpdate = Date.now() - lastUpdateTime
        if (timeSinceLastUpdate > staleConnectionTimeout) {
          console.warn('连接似乎已断开，准备重试')
          clearInterval(healthMonitor)
          reader.releaseLock()
          
          if (retryCount < MAX_RETRIES) {
            retryCount++
            console.log(`连接断开，等待 ${retryCount * 2} 秒后重试...`)
            setTimeout(() => attemptGeneration(), retryCount * 2000)
          } else {
            onError?.('连接多次中断，请检查网络后重试')
          }
        }
      }, 10000)

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            console.log('数据流读取完成')
            break
          }
          
          // 更新最后更新时间
          lastUpdateTime = Date.now()
          
          buffer += decoder.decode(value, { stream: true })
          
          // 处理可能的多个JSON对象
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // 保留最后一个不完整的行
          
          for (const line of lines) {
            if (line.trim()) {
              try {
                // 服务器已经处理了SSE格式，这里直接解析JSON
                const data = JSON.parse(line.trim())
                
                // 更新进度
                if (onProgress && typeof data.progress === 'number') {
                  onProgress(data.progress)
                }
                
                // 检查状态
                if (data.status === 'succeeded') {
                  clearInterval(healthMonitor)
                  onSuccess?.(data)
                  return
                } else if (data.status === 'failed') {
                  clearInterval(healthMonitor)
                  const errorMsg = data.failure_reason || data.error || '生成失败'
                  
                  // 检查是否为临时错误，可以重试
                  const isTemporaryError = errorMsg.includes('timeout') || 
                                          errorMsg.includes('网络') || 
                                          errorMsg.includes('连接')
                  
                  if (isTemporaryError && retryCount < MAX_RETRIES) {
                    retryCount++
                    console.log(`临时错误：${errorMsg}，等待 ${retryCount * 4} 秒后重试...`)
                    await new Promise(resolve => setTimeout(resolve, retryCount * 4000))
                    return attemptGeneration()
                  }
                  
                  onError?.(errorMsg)
                  return
                }
              } catch (parseError) {
                console.warn('客户端解析响应数据失败:', parseError, 'line:', line)
                // 解析错误不中断流程，继续处理
              }
            }
          }
        }
        
        clearInterval(healthMonitor)
        
      } catch (readerError) {
        clearInterval(healthMonitor)
        console.error('读取响应流时出错:', readerError)
        
        // 检查是否为网络错误且可以重试
        if (readerError instanceof Error) {
          const errorMessage = readerError.message.toLowerCase()
          const isNetworkError = errorMessage.includes('network') || 
                                errorMessage.includes('aborted') ||
                                errorMessage.includes('fetch')
          
          if (isNetworkError && retryCount < MAX_RETRIES) {
            retryCount++
            console.log(`网络错误：${readerError.message}，等待 ${retryCount * 5} 秒后重试...`)
            await new Promise(resolve => setTimeout(resolve, retryCount * 5000))
            return attemptGeneration()
          }
        }
        
        throw readerError
      }
      
    } catch (error) {
      console.error('生成请求失败:', error)
      
      // 检查是否为可重试的错误
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()
        const isRetryableError = errorMessage.includes('aborted') ||
                               errorMessage.includes('timeout') ||
                               errorMessage.includes('network') ||
                               errorMessage.includes('fetch')
        
        if (isRetryableError && retryCount < MAX_RETRIES) {
          retryCount++
          console.log(`可重试错误：${error.message}，等待 ${retryCount * 3} 秒后重试...`)
          await new Promise(resolve => setTimeout(resolve, retryCount * 3000))
          return attemptGeneration()
        }
      }
      
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      onError?.(errorMessage)
    }
  }
  
  // 开始首次尝试
  await attemptGeneration()
} 