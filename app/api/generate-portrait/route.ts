import { NextRequest, NextResponse } from 'next/server'

// 备份原有模板（注释保留）
/* 原有英文模板备份：
const OLD_PROMPT_TEMPLATE = `Create a high-resolution black-and-white portrait artwork in an editorial and artistic photography style. 

The background features a soft gradient, transitioning from medium gray to nearly pure white, evoking a sense of depth and serene atmosphere. Delicate film grain texture adds a tactile, analog-like softness to the image, reminiscent of classic monochrome photography.  
On the right side of the frame, a blurred yet striking visage of 

{CHARACTER_DESCRIPTION} 

emerges subtly from the shadows—not posed traditionally, but as if captured in a fleeting moment of thought or breath. Only fragments of his face are revealed: perhaps an eye, a cheekbone, and the curve of his lips, evoking mystery, intimacy, and elegance. His features are refined and profound, radiating a melancholic, poetic beauty without artifice.  

A gentle directional light, softly diffused, grazes the contours of his cheek or catches a glint in his eye—this is the emotional core of the image. The rest of the composition is dominated by generous negative space, intentionally minimal to allow the image to breathe. There are no words, no logos—only the interplay of light, shadow, and emotion.  

The overall mood is abstract yet deeply human, like a fleeting glance or a half-remembered dream: intimate, timeless, and hauntingly beautiful.`
*/

// 新的中英文混合提示词模板
const PROMPT_TEMPLATE = `Create a high-resolution black-and-white portrait artwork in an editorial and artistic photography style. 

The background features a soft gradient, transitioning from medium gray to nearly pure white, evoking a sense of depth and serene atmosphere. Delicate film grain texture adds a tactile, analog-like softness to the image, reminiscent of classic monochrome photography.  
On the right side of the frame, a blurred yet striking visage of 

{CHARACTER_DESCRIPTION} 

emerges subtly from the shadows—not posed traditionally, but as if captured in a fleeting moment of thought or breath. Only fragments of the face are revealed: perhaps an eye, a cheekbone, and the curve of lips, evoking mystery, intimacy, and elegance. His/Her/Its features are refined and profound, radiating a melancholic, poetic beauty without artifice.  

A gentle directional light, softly diffused, grazes the contours of the cheek or catches a glint in the eye—this is the emotional core of the image. The rest of the composition is dominated by generous negative space, intentionally minimal to allow the image to breathe. There are no words, no logos—only the interplay of light, shadow, and emotion.  

The overall mood is abstract yet deeply human, like a fleeting glance or a half-remembered dream: intimate, timeless, and hauntingly beautiful.

如果有参考图，请使用参考图的人物形象作为照片的人物形象。这时，照片中人物数量根据情况而定。
1、如果，没有具体人物描述，只有参考图，最后输出的照片，是参考图的人物形象的照片。
2、如果，有具体人物描述，且有参考图，最后输出的就是包含两个人物的照片。`

// API地址配置 - 海外优先，国内备用
const API_ENDPOINTS = [
  'https://api.grsai.com/v1/draw/completions',       // 海外地址
  'https://grsai.dakka.com.cn/v1/draw/completions'   // 国内备用
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
    const { characterDescription, referenceImage } = await request.json()
    
    // 修复参数验证：允许在有参考图时描述为空
    if ((!characterDescription || typeof characterDescription !== 'string') && !referenceImage) {
      return NextResponse.json(
        { error: '请提供人物描述或上传参考图' },
        { status: 400 }
      )
    }

    // 智能提示词构建逻辑
    const buildSmartPrompt = (description: string, hasReferenceImage: boolean): string => {
      const trimmedDescription = description ? description.trim() : ''
      
      // 场景1：{}中没有具体人物描述，只有参考图，照片中只有一个人物（参考图的人物形象）
      if (!trimmedDescription && hasReferenceImage) {
        return PROMPT_TEMPLATE.replace('{CHARACTER_DESCRIPTION}', 'the person from the reference image')
      }
      
      // 场景2：{}中有具体人物描述，且有参考图，输出包含两个人物的照片
      if (trimmedDescription && hasReferenceImage) {
        return PROMPT_TEMPLATE.replace('{CHARACTER_DESCRIPTION}', `${trimmedDescription} and the person from the reference image, creating a composition with two figures`)
      }
      
      // 场景3：标准单人物场景（有描述，无参考图或只有描述）
      return PROMPT_TEMPLATE.replace('{CHARACTER_DESCRIPTION}', trimmedDescription)
    }

    // 构建完整的提示词
    const prompt = buildSmartPrompt(characterDescription || '', !!referenceImage)
    
    // 构建请求体，如果有参考图则添加到请求中
    const requestBody: any = {
      model: "sora-image",
      prompt: prompt,
      size: "1:1",
      variants: 1,
      shutProgress: false
    }

    // 如果有参考图，添加到请求体中
    if (referenceImage) {
      requestBody.image = referenceImage
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