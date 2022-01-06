const Router = require('koa-router')
const router = new Router({
  prefix: '/api/v1/admin/article'
})
const Article = require('../../models/article')

// 获取文章列表
router.get('/list', async (ctx) => {
  const { page = 1, limit = 10 } = ctx.query
  const articles = await Article
    .find()
    .skip(page - 1)
    .limit(parseInt(limit))
  ctx.body = {
    code: 200,
    message: '本次获取' + articles.length + '条文章数据',
    count: articles.length,
    data: articles
  }
})

// 添加文章
router.post('/create', async (ctx) => {
  const {
    title,
    content,
    tag_id: tagId,
    author_id: authorId
  } = ctx.request.body
  const result = await Article.create({
    title,
    content,
    tag_id: tagId,
    author_id: authorId
  })
  if (result) {
    ctx.body = {
      code: 200,
      message: '新建文章成功',
      data: {
        create_id: result._id
      }
    }
  } else {
    ctx.body = {
      code: 200,
      message: '新建文章错误'
    }
  }
})

// 查找单个文章
router.get('/detail', async (ctx) => {
  const id = ctx.query.id
  const result = await Article.findById(id)
  if (result) {
    ctx.body = {
      code: 200,
      message: '获取成功',
      data: result
    }
    return
  }
  ctx.body = {
    code: 300,
    message: '查找失败'
  }
})

module.exports = router
