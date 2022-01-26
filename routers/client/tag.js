const Tag = require('../../models/tag')
const Router = require('koa-router')
const router = new Router({
  prefix: '/api/v1/tag'
})

// 获取标签列表
router.get('/list', async (ctx) => {
  const tags = await Tag.find()
  ctx.body = {
    code: 200,
    message: '获取成功',
    data: tags
  }
})

module.exports = router
