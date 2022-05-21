const Router = require('koa-router')
const jsonfile = require('jsonfile')
const { resolve } = require('path')
const router = new Router({
  prefix: '/api/v1/admin/site'
})

// 修改网站关于页面信息
router.post('/about', ctx => {
  const path = resolve(__dirname, '../../data/profile.json')
  const { params } = ctx.request.body
  jsonfile.writeFileSync(path, JSON.parse(params))
  ctx.body = {
    code: '200',
    message: '修改成功'
  }
})


module.exports = router