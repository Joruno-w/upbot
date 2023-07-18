#!/usr/bin/env zx
/* eslint-disable no-undef */
import { getConfig } from '../dist/index.mjs'

const { directory } = getConfig()
if (!directory) {
  console.error('请配置目录路径')
  process.exit(1)
}

cd(directory)
// fs.readdirSync('.').forEach((name) => {
//   if (list.includes())
//     cd(name)
//   console.log(`Switching to ${name}...`)
//   const hasChanges = await $`git status --porcelain`
//   if (hasChanges.trim()) {
//     console.log(`Skipping ${name} due to uncommitted changes.`)
//     cd('..')
//     return
//   }
//   await $`git checkout ${branchName}`
//   await $`npm install`
//   await $`git add .`
//   await $`git commit -m "修改config"`
//   await $`git push`
//   console.log(`Finished ${name}.`)
//   cd('..')
// })
// cd('..')
