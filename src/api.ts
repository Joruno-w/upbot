import axios from 'axios'
import { login } from './utils'

const API = {
  branchingmyself: 'https://beetle.zhuanspirit.com/apiBeetle/project/branchingmyself',
}

async function getInstance() {
  return axios.create({
    headers: {
      cookie: await login(),
    },
  })
}

export async function getAllDevelopBranches() {
  const instance = await getInstance()
  const { data } = await instance.get(API.branchingmyself, {
    params: {
      p_pageIndex: 1,
      branchState: 0,
    },
  })
  return data.respData.datalist
    .filter(
      (item: any) =>
        item.stateName === '开发中',
    )
    .map((item: any) => item.branchName)
}
