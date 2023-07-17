// 延时函数
export function delay(duration = 500) {
  return new Promise(resolve => setTimeout(resolve, duration))
}
