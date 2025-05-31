import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'

// SAM模型ID
const SAM_MODEL_ID = "yuval-alaluf/sam:9222a21c181b707209ef12b5e0d7e94c994b58f01c7b2fec075d2e892362f13c"

// 超时配置
const REQUEST_TIMEOUT = 300000 // 5分钟，因为Replicate处理时间较长
const POLL_INTERVAL = 2000 // 2秒轮询间隔

// 创建带超时的轮询函数
async function pollPrediction(replicate: Replicate, predictionId: string): Promise<any> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < REQUEST_TIMEOUT) {
    try {
      const prediction = await replicate.predictions.get(predictionId)
      
      if (prediction.status === 'succeeded') {
        return prediction
      } else if (prediction.status === 'failed') {
        throw new Error(prediction.error || '图像处理失败')
      } else if (prediction.status === 'canceled') {
        throw new Error('处理被取消')
      }
      
      // 等待后继续轮询
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
    } catch (error) {
      if (error instanceof Error && error.message.includes('图像处理失败')) {
        throw error
      }
      console.warn('轮询过程中出现错误:', error)
      await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL))
    }
  }
  
  throw new Error('处理超时，请重试')
}

// 验证图片格式和大小
function validateImage(imageData: string): void {
  // 检查是否为base64格式
  if (!imageData.startsWith('data:image/')) {
    throw new Error('请上传JPG、PNG或WebP格式的图片文件')
  }
  
  // 检查文件大小 (base64编码后约为原文件1.33倍)
  const sizeInBytes = (imageData.length * 3) / 4
  const maxSizeInMB = 10
  if (sizeInBytes > maxSizeInMB * 1024 * 1024) {
    throw new Error('图片文件过大，请选择小于10MB的图片')
  }
  
  // 检查支持的格式
  const supportedFormats = ['jpeg', 'jpg', 'png', 'webp']
  const format = imageData.split(';')[0].split('/')[1]
  if (!supportedFormats.includes(format)) {
    throw new Error('请上传JPG、PNG或WebP格式的图片文件')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { image, targetAge } = await request.json()
    
    // 参数验证
    if (!image) {
      return NextResponse.json(
        { error: '请上传图片文件' },
        { status: 400 }
      )
    }
    
    if (!targetAge) {
      return NextResponse.json(
        { error: '请选择目标年龄' },
        { status: 400 }
      )
    }
    
    // 验证图片
    try {
      validateImage(image)
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : '图片格式不正确' },
        { status: 400 }
      )
    }

    // 获取Replicate API密钥
    const replicateToken = process.env.REPLICATE_API_TOKEN
    
    if (!replicateToken) {
      console.error('Replicate API密钥未配置')
      return NextResponse.json(
        { error: 'API密钥未配置，请联系管理员设置服务器环境变量 REPLICATE_API_TOKEN' },
        { status: 500 }
      )
    }

    // 初始化Replicate客户端
    const replicate = new Replicate({
      auth: replicateToken
    })

    console.log('开始创建Replicate预测任务...')
    
    // 创建预测任务
    const prediction = await replicate.predictions.create({
      version: SAM_MODEL_ID,
      input: {
        image: image,
        target_age: targetAge === 'default' ? 'default' : targetAge
      }
    })

    console.log('预测任务已创建，ID:', prediction.id)

    // 创建流式响应
    const readable = new ReadableStream({
      async start(controller) {
        let isControllerClosed = false
        
        // 安全的Controller操作函数
        const safeEnqueue = (data: string) => {
          if (!isControllerClosed) {
            try {
              controller.enqueue(new TextEncoder().encode(data + '\n'))
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

        try {
          // 发送初始状态
          safeEnqueue(JSON.stringify({
            id: prediction.id,
            status: 'starting',
            progress: 10
          }))

          // 轮询预测结果
          let progress = 20
          const finalPrediction = await pollPrediction(replicate, prediction.id)
          
          // 模拟进度更新
          const progressInterval = setInterval(() => {
            if (isControllerClosed) {
              clearInterval(progressInterval)
              return
            }
            
            if (progress < 90) {
              progress += 10
              safeEnqueue(JSON.stringify({
                id: prediction.id,
                status: 'processing',
                progress: progress
              }))
            }
          }, 1000)

          // 等待预测完成后清理定时器
          clearInterval(progressInterval)
          
          // 发送最终结果
          if (finalPrediction.output) {
            safeEnqueue(JSON.stringify({
              id: finalPrediction.id,
              status: 'succeeded',
              progress: 100,
              output: finalPrediction.output,
              url: finalPrediction.output // 兼容现有接口
            }))
          } else {
            throw new Error('未生成输出结果')
          }
          
          safeClose()
          
        } catch (error) {
          console.error('时光机处理错误:', error)
          
          // 处理不同类型的错误
          let errorMessage = '处理失败，请重试'
          let errorType = 'unknown_error'
          
          if (error instanceof Error) {
            if (error.message.includes('图像处理失败')) {
              errorMessage = '未检测到清晰的人脸，请上传包含人脸的图片'
              errorType = 'face_detection_failed'
            } else if (error.message.includes('处理超时')) {
              errorMessage = '处理超时，请稍后重试'
              errorType = 'processing_timeout'
            } else if (error.message.includes('quota') || error.message.includes('limit')) {
              errorMessage = '处理请求过多，请稍后重试'
              errorType = 'api_quota_exceeded'
            } else {
              errorMessage = error.message
            }
          }
          
          safeEnqueue(JSON.stringify({
            id: prediction.id || 'unknown',
            status: 'failed',
            progress: 0,
            error: errorMessage,
            error_type: errorType
          }))
          
          safeClose()
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
    
    // 处理特殊错误
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: '请求数据格式错误' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    )
  }
} 