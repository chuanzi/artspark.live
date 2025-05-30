import { NextRequest, NextResponse } from 'next/server'

const PROMPT_TEMPLATE = `Create a high-resolution black-and-white portrait artwork in an editorial and artistic photography style. 

The background features a soft gradient, transitioning from medium gray to nearly pure white, evoking a sense of depth and serene atmosphere. Delicate film grain texture adds a tactile, analog-like softness to the image, reminiscent of classic monochrome photography.  
On the right side of the frame, a blurred yet striking visage of 

{CHARACTER_DESCRIPTION} 

emerges subtly from the shadows—not posed traditionally, but as if captured in a fleeting moment of thought or breath. Only fragments of his face are revealed: perhaps an eye, a cheekbone, and the curve of his lips, evoking mystery, intimacy, and elegance. His features are refined and profound, radiating a melancholic, poetic beauty without artifice.  

A gentle directional light, softly diffused, grazes the contours of his cheek or catches a glint in his eye—this is the emotional core of the image. The rest of the composition is dominated by generous negative space, intentionally minimal to allow the image to breathe. There are no words, no logos—only the interplay of light, shadow, and emotion.  

The overall mood is abstract yet deeply human, like a fleeting glance or a half-remembered dream: intimate, timeless, and hauntingly beautiful.`

export async function POST(request: NextRequest) {
  try {
    const { characterDescription } = await request.json()
    
    if (!characterDescription || typeof characterDescription !== 'string') {
      return NextResponse.json(
        { error: '请提供有效的人物描述' },
        { status: 400 }
      )
    }

    // 构建完整的提示词
    const prompt = PROMPT_TEMPLATE.replace('{CHARACTER_DESCRIPTION}', characterDescription.trim())
    
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