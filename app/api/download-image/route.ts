import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, fileName } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: '缺少图片URL' }, { status: 400 })
    }

    console.log('开始代理下载图片:', imageUrl)

    // 从外部URL获取图片
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      console.error('获取图片失败:', response.status, response.statusText)
      return NextResponse.json({ error: '获取图片失败' }, { status: 500 })
    }

    const imageBuffer = await response.arrayBuffer()
    console.log('图片获取成功，大小:', imageBuffer.byteLength, '字节')

    // 返回图片文件，设置下载headers
    const finalFileName = fileName || `portrait-${Date.now()}.jpg`
    
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${finalFileName}"`,
        'Content-Length': imageBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error) {
    console.error('下载代理API错误:', error)
    return NextResponse.json({ error: '下载失败' }, { status: 500 })
  }
} 