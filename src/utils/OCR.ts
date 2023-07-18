import { unlink } from 'node:fs/promises'
import { Buffer } from 'node:buffer'
import tesseract from 'tesseract.js'
import Jimp from 'jimp'

// 扫描验证码，识别文字
export async function OCR(src: string): Promise<string> {
  try {
    const {
      data: { text },
    } = await tesseract.recognize(src)
    return text.replace(/\s+/g, '')
  }
  catch (e: any) {
    console.log(e)
    return ''
  }
}

// 获取验证码中的文字
export async function getText(base64Data: string): Promise<string> {
  const imageData = base64Data.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(imageData, 'base64')
  // 加载验证码图像
  const image = await Jimp.read(buffer)
  // 将验证码图像转换为灰度图像
  image.greyscale()
  // 对验证码图像进行预处理
  image.contrast(1)
  image.brightness(0)
  // 将预处理后的验证码图像保存到文件
  await image.writeAsync('preprocessed.png')
  // OCR 识别验证码
  const text = await OCR('preprocessed.png')
  await unlink('preprocessed.png')
  return text
}
