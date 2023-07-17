import { Command } from 'commander'
import zx from 'zx'
import { getAllDevelopBranches } from './api'

const program = new Command()

program
  .name('upbot')
  .helpOption('-h, --help', '查看帮助信息')
  .description('自动发包小工具')
  .option('-e, --establish', '创建分支')
  .option('-c, --compile', '编译分支')
  .option('-d, --deploy', '部署分支')

program.parse()

const options = program.opts()
console.log(options);

(async () => {
  const res = await getAllDevelopBranches()
  console.log(res)
})()
