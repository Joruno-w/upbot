import { login } from './utils';

(async () => {
  const cookies = await login()
  console.log(cookies)
})()
