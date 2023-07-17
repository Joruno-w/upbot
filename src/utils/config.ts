import fs from 'node:fs'
import path from 'node:path'
// 如下载不下来(有兼容性问题)，可以参考 https://github.com/Automattic/node-canvas#installation
import ini from 'ini'

const customRcPath = process.env.UPBOT_CONFIG_FILE

const home
  = process.platform === 'win32' ? process.env.USERPROFILE : process.env.HOME

const defaultRcPath = path.join(home || '~/', '.upbotrc.ini')

const rcPath = customRcPath || defaultRcPath

interface Config {
  directory: string
  name: string
  pwd: string
  url: string
}

export const defaultConfig: Config = {
  directory: '',
  name: '',
  pwd: '',
  url: '',
}

export function getConfig() {
  return Object.assign(
    {},
    defaultConfig,
    ini.parse(fs.readFileSync(rcPath, 'utf-8')),
  )
}
