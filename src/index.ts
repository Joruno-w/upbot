import puppeteer from 'puppeteer'
import tesseract from 'tesseract.js'
import { createCanvas, loadImage } from 'canvas'

interface LoginOptions {
  name: string
  pwd: string
}

// 扫描验证码，识别文字
async function OCR(src: string) {
  try {
    const {
      data: { text },
    } = await tesseract.recognize(src)
    return text
  }
  catch (error: any) {
    return ''
  }
}

// 延时函数
function delay(duration?: number) {
  return new Promise(resolve => setTimeout(resolve, duration))
}

// 对图片做转换，将与目标颜色最接近的像素设为白色，其余像素设为黑色
async function extractColorText(imagePath: string, targetColor: number[]) {
  // 加载图片
  const image = await loadImage(imagePath)
  // 创建画布
  const canvas = createCanvas(image.width, image.height)
  const ctx = canvas.getContext('2d')
  // 将图片绘制到画布上
  ctx.drawImage(image, 0, 0, image.width, image.height)
  // 获取画布像素数据
  const imageData = ctx.getImageData(0, 0, image.width, image.height)
  const data = imageData.data
  // 遍历画布像素，将与目标颜色最接近的像素设为白色，其余像素设为黑色
  const [r, g, b] = targetColor
  for (let i = 0; i < data.length; i += 4) {
    const distance = Math.sqrt(
      (data[i] - r) ** 2 + (data[i + 1] - g) ** 2 + (data[i + 2] - b) ** 2,
    )
    if (distance < 50) {
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
    }
    else {
      data[i] = 0
      data[i + 1] = 0
      data[i + 2] = 0
    }
  }
  // 将处理后的像素数据重新绘制到画布上
  ctx.putImageData(imageData, 0, 0)
  // 将画布转换为 Base64 编码的 PNG 图片
  const base64Data = canvas.toDataURL('image/png')
  // 返回包含提取出的文字的数组
  return await OCR(base64Data)
}

// 初始化函数
export default async (url: string, options: LoginOptions) => {
  const browser = await puppeteer.launch({
    headless: 'new',
  })
  const page = await browser.newPage()
  await page.goto(url)
  await page.waitForSelector('.change-pc___2wS5N')
  await page.click('.change-pc___2wS5N')
  await page.type('#userName', options.name)
  await page.type('#password', options.pwd)
  let cookies = await page.cookies()
  while (cookies && cookies.length === 0) {
    await page.waitForSelector('.captcha-img___5RY6i')
    const src = await page.$eval('.captcha-img___5RY6i', (img) => {
      return img.getAttribute('src')
    })
    const text = await extractColorText(src, [255, 2, 0])
    await page.type('#graphicsCode', '')
    await page.type('#graphicsCode', text)
    await delay(1000)
    cookies = await page.cookies()
  }
  // await browser.close();
}
