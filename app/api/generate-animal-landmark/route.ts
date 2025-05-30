import { NextRequest, NextResponse } from 'next/server'

const PROMPT_TEMPLATE = `Three {ANIMAL_TYPE} taking a close-up selfie in front of the iconic {LANDMARK}, each with different expressions, captured during golden hour with cinematic lighting. The animals are close to the camera, heads touching, mimicking a selfie pose, displaying expressions of joy, surprise, and calm. The background showcases the complete architectural details of the {LANDMARK}, with soft lighting and a warm atmosphere. Shot in a photographic, realistic-cartoon style, highly detailed, with a 1:1 aspect ratio.`

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
      .replace('{ANIMAL_TYPE}', animalType.trim())
      .replace('{LANDMARK}', landmark.trim())
    
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
      return NextResponse.json(
        { error: 'API配置未找到，请检查服务器设置' },
        { status: 500 }
      )
    }

    // 发起请求到GRSAI API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('GRSAI API错误:', response.status, errorText)
      return NextResponse.json(
        { error: `API请求失败: ${response.status}` },
        { status: response.status }
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

        try {
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
                  // 处理SSE格式：检查是否以 "data: " 开头
                  let jsonString = line.trim()
                  if (jsonString.startsWith('data: ')) {
                    jsonString = jsonString.substring(6) // 去掉 "data: " 前缀
                  }
                  
                  // 跳过空的JSON字符串
                  if (!jsonString) continue
                  
                  // 验证JSON格式
                  JSON.parse(jsonString)
                  // 将处理后的JSON数据发送给客户端
                  controller.enqueue(new TextEncoder().encode(jsonString + '\n'))
                } catch (parseError) {
                  console.warn('解析响应数据失败:', parseError, line)
                }
              }
            }
          }
          
          controller.close()
        } catch (error) {
          console.error('流式响应处理错误:', error)
          controller.error(error)
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
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 