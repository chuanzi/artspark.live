import { NextRequest, NextResponse } from 'next/server'

const PROMPT_TEMPLATE = `Three {ANIMAL_TYPE} taking a close-up selfie in front of the iconic {LANDMARK}, each with different expressions, captured during golden hour with cinematic lighting. The animals are close to the camera, heads touching, mimicking a selfie pose, displaying expressions of joy, surprise, and calm. The background showcases the complete architectural details of the {LANDMARK}, with soft lighting and a warm atmosphere. Shot in a photographic, realistic-cartoon style, highly detailed, with a 1:1 aspect ratio.`

// API地址配置 - 国内直连优先，海外备用
const API_ENDPOINTS = [
  'http://grsai.dakka.com.cn/v1/draw/completions',  // 国内直连
  'https://api.grsai.com/v1/draw/completions'       // 海外地址
]

// 统一超时配置
const REQUEST_TIMEOUT = 90000 // 90秒请求超时
const CONNECTION_TIMEOUT = 120000 // 120秒连接监控超时

// 创建带超时的fetch函数
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number = REQUEST_TIMEOUT): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// 尝试多个API地址的请求函数 - 增强重试逻辑
async function tryApiEndpoints(requestBody: any, apiKey: string): Promise<Response> {
  let lastError: Error | null = null
  const maxRetries = 2 // 每个端点最多重试2次
  
  for (let i = 0; i < API_ENDPOINTS.length; i++) {
    const apiUrl = API_ENDPOINTS[i]
    
    for (let retry = 0; retry <= maxRetries; retry++) {
      console.log(`尝试API地址 ${i + 1}/${API_ENDPOINTS.length}: ${apiUrl} (第${retry + 1}次尝试)`)
      
      try {
        const response = await fetchWithTimeout(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(requestBody)
        }, REQUEST_TIMEOUT)
        
        if (response.ok) {
          console.log(`API地址 ${apiUrl} 连接成功`)
          return response
        } else {
          const errorText = await response.text()
          console.warn(`API地址 ${apiUrl} 返回错误:`, response.status, errorText)
          lastError = new Error(`API ${apiUrl} 错误: ${response.status} ${errorText}`)
          
          // 如果是5xx错误且不是最后一次重试，等待后重试
          if (response.status >= 500 && retry < maxRetries) {
            console.log(`服务器错误，等待${(retry + 1) * 2}秒后重试...`)
            await new Promise(resolve => setTimeout(resolve, (retry + 1) * 2000))
            continue
          }
        }
      } catch (error) {
        console.warn(`API地址 ${apiUrl} 连接失败:`, error)
        lastError = error as Error
        
        // 如果是网络错误且不是最后一次重试，等待后重试
        if (retry < maxRetries) {
          console.log(`网络错误，等待${(retry + 1) * 3}秒后重试...`)
          await new Promise(resolve => setTimeout(resolve, (retry + 1) * 3000))
          continue
        }
      }
      
      break // 如果成功或不需要重试，跳出重试循环
    }
    
    // 如果不是最后一个地址，等待后尝试下一个
    if (i < API_ENDPOINTS.length - 1) {
      console.log('等待2秒后尝试下一个地址...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  throw lastError || new Error('所有API地址都无法连接')
}

export async function POST(request: NextRequest) {
  try {
    const { animalType, landmark } = await request.json()
    
    if (!animalType || typeof animalType !== 'string' || !landmark || typeof landmark !== 'string') {
      return NextResponse.json(
        { error: '请选择动物类型和地标' },
        { status: 400 }
      )
    }

    // 构建完整的提示词
    const prompt = PROMPT_TEMPLATE
      .replace(/{ANIMAL_TYPE}/g, animalType.trim())
      .replace(/{LANDMARK}/g, landmark.trim())
    
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
    
    if (!apiKey) {
      console.error('API密钥未配置')
      return NextResponse.json(
        { error: 'API密钥未配置，请联系管理员设置服务器环境变量 GRSAI_API_KEY' },
        { status: 500 }
      )
    }

    console.log('开始尝试连接API服务器...')
    
    // 尝试连接多个API地址
    let response: Response
    try {
      response = await tryApiEndpoints(requestBody, apiKey)
    } catch (error) {
      console.error('所有API地址连接失败:', error)
      return NextResponse.json(
        { error: `API连接失败，请稍后重试。详细错误: ${error instanceof Error ? error.message : '未知错误'}` },
        { status: 503 }
      )
    }

    // 创建流式响应
    const readable = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.error(new Error('无法读取响应流'))
          return
        }

        let isControllerClosed = false
        let lastDataTime = Date.now()
        
        // 安全的Controller操作函数
        const safeEnqueue = (data: Uint8Array) => {
          if (!isControllerClosed) {
            try {
              controller.enqueue(data)
              lastDataTime = Date.now() // 更新最后数据时间
            } catch (error) {
              console.warn('Controller写入失败:', error)
              isControllerClosed = true
            }
          }
        }
        
        const safeClose = () => {
          if (!isControllerClosed) {
            try {
              controller.close()
              isControllerClosed = true
            } catch (error) {
              console.warn('Controller关闭失败:', error)
              isControllerClosed = true
            }
          }
        }
        
        const safeError = (error: any) => {
          if (!isControllerClosed) {
            try {
              controller.error(error)
              isControllerClosed = true
            } catch (controllerError) {
              console.warn('Controller错误处理失败:', controllerError)
              isControllerClosed = true
            }
          }
        }

        // 优化的连接监控定时器
        const connectionMonitor = setInterval(() => {
          if (isControllerClosed) {
            clearInterval(connectionMonitor)
            return
          }
          
          const timeSinceLastData = Date.now() - lastDataTime
          if (timeSinceLastData > CONNECTION_TIMEOUT) {
            console.warn(`连接超时：${timeSinceLastData}ms无数据，关闭连接`)
            safeError(new Error('连接超时：长时间无响应，请重试'))
            clearInterval(connectionMonitor)
          }
        }, 10000) // 每10秒检查一次，减少检查频率

        try {
          const decoder = new TextDecoder()
          let buffer = ''
          let heartbeatCount = 0
          let reconnectAttempts = 0
          const maxReconnectAttempts = 3

          while (true) {
            // 检查Controller状态
            if (isControllerClosed) {
              console.log('Controller已关闭，停止读取')
              break
            }
            
            let readResult
            try {
              readResult = await reader.read()
            } catch (readError) {
              // 增强的网络错误处理
              if (readError instanceof Error) {
                const errorMessage = readError.message.toLowerCase()
                
                if (errorMessage.includes('terminated') || 
                    errorMessage.includes('closed') ||
                    errorMessage.includes('aborted') ||
                    errorMessage.includes('disconnected')) {
                  
                  console.warn('连接被远程服务器关闭:', readError.message)
                  
                  // 尝试重连机制
                  if (reconnectAttempts < maxReconnectAttempts) {
                    reconnectAttempts++
                    console.log(`尝试重连 (${reconnectAttempts}/${maxReconnectAttempts})...`)
                    
                    // 等待后继续，而不是立即失败
                    await new Promise(resolve => setTimeout(resolve, 2000 * reconnectAttempts))
                    continue
                  } else {
                    safeError(new Error('网络连接多次中断，请检查网络后重试'))
                    break
                  }
                } else if (errorMessage.includes('timeout')) {
                  safeError(new Error('请求超时，请重试'))
                  break
                } else {
                  safeError(new Error(`网络错误: ${readError.message}`))
                  break
                }
              }
              throw readError
            }
            
            const { done, value } = readResult
            
            if (done) {
              console.log('数据流读取完成')
              break
            }
            
            // 重置重连计数器和更新最后数据时间
            reconnectAttempts = 0
            lastDataTime = Date.now()
            
            buffer += decoder.decode(value, { stream: true })
            
            // 处理可能的多个JSON对象
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // 保留最后一个不完整的行
            
            for (const line of lines) {
              // 再次检查Controller状态
              if (isControllerClosed) {
                console.log('Controller已关闭，停止处理数据')
                break
              }
              
              if (line.trim()) {
                try {
                  // 处理SSE格式：检查是否以 "data: " 开头
                  let jsonString = line.trim()
                  if (jsonString.startsWith('data: ')) {
                    jsonString = jsonString.substring(6) // 去掉 "data: " 前缀
                  }
                  
                  // 跳过空的JSON字符串
                  if (!jsonString) continue
                  
                  // 验证并解析JSON格式
                  const jsonData = JSON.parse(jsonString)
                  
                  // 发送心跳计数（每10个数据包记录一次）
                  heartbeatCount++
                  if (heartbeatCount % 10 === 0) {
                    console.log(`已处理 ${heartbeatCount} 个数据包，连接正常`)
                  }
                  
                  // 安全地发送数据
                  safeEnqueue(new TextEncoder().encode(jsonString + '\n'))
                  
                } catch (parseError) {
                  console.warn('解析响应数据失败:', parseError, 'line:', line)
                  // 解析错误不应该中断整个流程，继续处理下一行
                }
              }
            }
          }
          
          // 清理连接监控
          clearInterval(connectionMonitor)
          
          // 安全关闭Controller
          safeClose()
          
        } catch (error) {
          clearInterval(connectionMonitor)
          
          // 增强错误处理：识别不同类型的网络错误
          let errorMessage = '网络连接错误'
          if (error instanceof Error) {
            if (error.message.includes('terminated') || error.message.includes('closed')) {
              errorMessage = '连接被意外中断，请重试'
            } else if (error.message.includes('timeout')) {
              errorMessage = '连接超时，请检查网络后重试'
            } else if (error.message.includes('aborted')) {
              errorMessage = '请求被取消'
            } else {
              errorMessage = `连接错误: ${error.message}`
            }
          }
          
          console.error('流式响应处理错误:', error)
          safeError(new Error(errorMessage))
        } finally {
          // 确保所有资源被正确清理
          clearInterval(connectionMonitor)
          try {
            reader.releaseLock()
          } catch (readerError) {
            console.warn('Reader释放失败:', readerError)
          }
        }
      }
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('API路由错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    )
  }
} 