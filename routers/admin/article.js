const Router = require('koa-router')
const router = new Router({
  prefix: '/api/v1/admin'
})
const Article = require('../../models/article')

// const test = new Article({
//   title: '测试',
//   tag_id: '2',
//   author_id: '2',
//   content: '测试内测试内容测试内容测试内容容'
// })
// test.save()

// 获取文章列表
router.get('/articles', async (ctx) => {
  const articles = await Article.find({})
  ctx.body = {
    data: articles
  }
})

module.exports = router
