import axios from 'axios'
import { login } from './utils'

type Status = '开发中' | '已上线'

interface BranchParams {
  status?: Status
}

const API = {
  branchingmyself:
    'https://beetle.zhuanspirit.com/apiBeetle/project/branchingmyself',
}

async function getInstance() {
  const { cookie } = await login()
  return axios.create({
    headers: {
      cookie,
    },
  })
}

export async function getBranches({ status = '开发中' }: BranchParams = {}) {
  const instance = await getInstance()
  const { data } = await instance.get(API.branchingmyself, {
    params: {
      p_pageIndex: 1,
      branchState: 0,
    },
  })
  return data.respData.datalist
    .filter((item: any) => item.stateName === status)
    .map((item: any) => item.branchName)
}
