const Router = require('koa-router')
const router = new Router({
  prefix: '/api/v1'
})

// 获取标签列表
router.get('/tags', async (ctx) => {
  ctx.body = {
    code: 200,
    message: '获取成功'
  }
})

router.get('/test', async (ctx) => {
  ctx.body = ctx.request.body
})

module.exports = router
