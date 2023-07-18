import puppeteer from 'puppeteer'
import prompts from 'prompts'
import ora from 'ora'
import c from 'kleur'
import { getConfig } from './config'
import { delay } from './common'
import { getText } from './OCR'

// 登录并返回cookies
export async function login(url?: string) {
  const config = getConfig()
  url = url || config.url
  const options = await prompts([
    {
      type: 'confirm',
      name: 'configfile',
      message: '是否按照配置文件里的参数执行此命令？',
      initial: true,
    },
    {
      type: prev => (prev === 'n' ? 'text' : null),
      name: 'name',
      message: '请输入账号：',
    },
    {
      type: (_, values) => (values.configfile === 'n' ? 'password' : null),
      name: 'pwd',
      message: '请输入密码：',
    },
  ])
  const browser = await puppeteer.launch({
    headless: false,
  })
  const page = await browser.newPage()
  await page.goto(url)
  await page.waitForSelector('.change-pc___2wS5N')
  await page.click('.change-pc___2wS5N')
  await page.type('#userName', options.name || config.name)
  await page.type('#password', options.pwd || config.pwd)
  let cookies = await page.cookies()
  const spinner = ora('验证码识别中...').start()
  while (cookies && cookies.length === 0) {
    await page.waitForSelector('.captcha-img___5RY6i')
    const src = await page.$eval('.captcha-img___5RY6i', img =>
      img.getAttribute('src'),
    )
    const text = await getText(src)
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
  // TODO: 点击某一项
  await page.waitForSelector('[data-row-key="4267-15"] > td:nth-child(2) > a')
  const href = await page.$eval(
    '[data-row-key="4267-15"] > td:nth-child(2) > a',
    a => a.href,
  )
  await page.goto(href)
  // 编译（重新构建｜取消重新构建）
  // await page.waitForSelector('div[data-node-key="history_0"] .ant-card-extra > button')
  // await page.click('div[data-node-key="history_0"] .ant-card-extra > button')

  // await page.waitForSelector('.ant-modal-footer .ant-btn-primary')
  // await page.click('.ant-modal-footer .ant-btn-primary')
  // await page.waitForSelector('tr:nth-child(1) > .ant-space-item > button:not([disabled])')
  // await page.click('tr:nth-child(1) > .ant-space-item > button:not([disabled])')
  // await browser.close()
  return {
    cookie: cookies.map(({ name, value }) => `${name}=${value}`).join('; '),
  }
}
