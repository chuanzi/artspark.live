import { TimeMachineOptions, TimeMachineResponse } from './timemachine-types'

// 客户端超时配置
const CLIENT_TIMEOUT = 300000 // 5分钟
const MAX_RETRIES = 2

export async function generateTimeMachine(options: TimeMachineOptions): Promise<void> {
  const { image, targetAge, onProgress, onSuccess, onError } = options
  
  let retryCount = 0
  
  const attemptGeneration = async (): Promise<void> => {
    try {
      console.log(`开始时光机生成请求 (尝试 ${retryCount + 1}/${MAX_RETRIES + 1})`)
      
      // 转换图片为base64格式（如果是File对象）
      let imageData: string
      if (image instanceof File) {
        imageData = await fileToBase64(image)
      } else {
        imageData = image
      }
      
      // 创建超时控制器
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.warn('客户端请求超时')
      }, CLIENT_TIMEOUT)
      
      // 发起请求到我们的API路由
      const response = await fetch('/api/generate-timemachine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: imageData,
          targetAge: targetAge
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
      const staleConnectionTimeout = 120000 // 2分钟无数据视为连接断开

      // 连接健康监控
      const healthCheckInterval = setInterval(() => {
        const timeSinceLastUpdate = Date.now() - lastUpdateTime
        if (timeSinceLastUpdate > staleConnectionTimeout) {
          console.warn('连接可能已断开，尝试重新连接...')
          clearInterval(healthCheckInterval)
          reader.cancel()
          
          if (retryCount < MAX_RETRIES) {
            retryCount++
            setTimeout(() => attemptGeneration(), 3000)
          } else {
            onError?.('连接超时，请检查网络后重试')
          }
        }
      }, 10000)

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break
          
          lastUpdateTime = Date.now()
          buffer += decoder.decode(value, { stream: true })
          
          // 处理可能的多个JSON对象
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // 保留最后一个不完整的行
          
          for (const line of lines) {
            if (line.trim()) {
              try {
                const data: TimeMachineResponse = JSON.parse(line.trim())
                
                // 更新进度
                if (onProgress && typeof data.progress === 'number') {
                  onProgress(data.progress)
                }
                
                // 检查状态
                if (data.status === 'succeeded') {
                  clearInterval(healthCheckInterval)
                  const imageUrl = data.output || data.url
                  if (imageUrl) {
                    onSuccess?.(imageUrl)
                  } else {
                    onError?.('未生成输出结果')
                  }
                  return
                } else if (data.status === 'failed') {
                  clearInterval(healthCheckInterval)
                  const errorMsg = data.error || '生成失败'
                  onError?.(errorMsg)
                  return
                }
              } catch (parseError) {
                console.warn('客户端解析响应数据失败:', parseError, line)
              }
            }
          }
        }
        
        clearInterval(healthCheckInterval)
        
      } catch (readerError) {
        clearInterval(healthCheckInterval)
        
        if (readerError instanceof Error) {
          if (readerError.name === 'AbortError') {
            console.warn('请求被中止')
            if (retryCount < MAX_RETRIES) {
              retryCount++
              setTimeout(() => attemptGeneration(), 3000)
              return
            }
          }
        }
        
        throw readerError
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      
      // 如果是网络错误且还有重试机会，则重试
      if (errorMessage.includes('网络') && retryCount < MAX_RETRIES) {
        retryCount++
        console.log(`网络错误，等待 ${retryCount * 3} 秒后重试...`)
        setTimeout(() => attemptGeneration(), retryCount * 3000)
        return
      }
      
      onError?.(errorMessage)
    }
  }
  
  await attemptGeneration()
}

// 将File对象转换为base64字符串
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('文件读取失败'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsDataURL(file)
  })
}

// 图片压缩工具函数
export function compressImage(file: File, maxWidth: number = 1024, maxHeight: number = 1024, quality: number = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    if (!ctx) {
      reject(new Error('无法创建canvas上下文'))
      return
    }
    
    img.onload = () => {
      // 计算新的尺寸
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }
      
      // 设置canvas尺寸
      canvas.width = width
      canvas.height = height
      
      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height)
      
      // 转换为base64
      const base64 = canvas.toDataURL('image/jpeg', quality)
      resolve(base64)
      
      // 清理对象URL
      URL.revokeObjectURL(img.src)
    }
    
    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }
    
    // 创建对象URL并加载图片
    const url = URL.createObjectURL(file)
    img.src = url
  })
} 