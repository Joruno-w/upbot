#!/usr/bin/env zx
/* eslint-disable no-undef */
import { getConfig } from '../dist/index.mjs'

const { directory } = getConfig()
if (!directory) {
  console.error('请配置目录路径')
  process.exit(1)
}
// const branchName = 'main'

cd(directory)

fs.readdirSync('.').forEach((name) => {
  console.log(name)
})
// for await (const dir of Deno.readDir('.')) {
//   if (dir.isDirectory) {
//     cd(dir.name)
//     console.log(`Switching to ${dir.name}...`)

//     const hasChanges = await $`git status --porcelain`
//     if (hasChanges.trim()) {
//       console.log(`Skipping ${dir.name} due to uncommitted changes.`)
//       cd('..')
//       continue
//     }
//     await $`git checkout ${branchName}`
//     await $`npm install`
//     await $`git add .`
//     await $`git commit -m "Update packages"`
//     await $`git push`

//     console.log(`Finished ${dir.name}.`)
//     cd('..')
//   }
// }

// cd('..')
