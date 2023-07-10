import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer'
// 如下载不下来，可以参考https://github.com/Automattic/node-canvas#installation
import { createCanvas, loadImage } from 'canvas'
import tesseract from 'tesseract.js'
import inquirer from 'inquirer'
import ora from 'ora'
import ini from 'ini'
import c from 'kleur'

const customRcPath = process.env.UPBOT_CONFIG_FILE

const home
  = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME

const defaultRcPath = path.join(home || '~/', '.upbotrc')

const rcPath = customRcPath || defaultRcPath

interface Config {
  directory: string
}

const defaultConfig: Config = {
  directory: '~/Desktop/zhuanzhuan',
}

function getConfig() {
  return Object.assign(
    {},
    defaultConfig,
    ini.parse(fs.readFileSync(rcPath, 'utf-8')),
  )
}

// 扫描验证码，识别文字
async function OCR(src: string): Promise<string> {
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

// 延时函数
function delay(duration?: number) {
  return new Promise(resolve => setTimeout(resolve, duration))
}

// 对图片做转换，将与目标颜色最接近的像素设为白色，其余像素设为黑色，方便OCR识别
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
async function login(url: string) {
  const options = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '请输入账号：',
    },
    {
      type: 'password',
      name: 'pwd',
      message: '请输入密码：',
      mask: '*',
    },
  ])
  const browser = await puppeteer.launch({
    headless: 'new',
  })
  const page = await browser.newPage()
  await page.goto(url)
  await page.waitForSelector('.change-pc___2wS5N')
  await page.click('.change-pc___2wS5N')
  await page.type('#userName', options.name)
  await page.type('#password', options.pwd)

  page.on('response', async (response) => {
    if (response.url().includes('login')) {
      const info = await response.json()
      console.log(info)
    }
  })

  let cookies = await page.cookies()
  const spinner = ora('验证码识别中...').start()
  while (cookies && cookies.length === 0) {
    await page.waitForSelector('.captcha-img___5RY6i')
    const src = await page.$eval('.captcha-img___5RY6i', img =>
      img.getAttribute('src'),
    )
    const text = await extractColorText(src, [255, 2, 0])
    const inputHandle = (await page.$('#graphicsCode'))!
    inputHandle.click({
      clickCount: 3,
    })
    inputHandle.type('')
    await delay(1000)
    inputHandle.type(text)
    await page.click('button[type="submit"]')
    await delay(1000)
    cookies = await page.cookies()
    if (cookies.length > 0)
      spinner.succeed(c.green('登录成功'))
    else spinner.text = '验证码错误，正在重试...'
  }
  await browser.close()
}

// login()
