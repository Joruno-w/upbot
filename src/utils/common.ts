// 延时函数
export function delay(duration = 500) {
  return new Promise(resolve => setTimeout(resolve, duration))
}

// 从分支名中获取项目名
export function getProjectByBranch(branch: string) {
  return branch.replace(/(.+)-feature-.+/, '$1')
}
