const Router = require('koa-router')
const router = new Router({
  prefix: '/api/v1/admin'
})
const Article = require('../../models/article')

// 获取文章列表
router.get('/articles', async (ctx) => {
  const articles = await Article.find({})
  ctx.body = {
    data: articles
  }
})

// 添加文章
router.post('/create', async (ctx) => {
  const { title, content, tag_id, author_id } = ctx.request.body
  const result = await Article.create({ title, content, tag_id, author_id })
  if (result) {
    ctx.body = {
      data: {
        code: 200,
        msg: '添加成功'
      }
    }
  } else {
    ctx.body = {
      code: 300,
      msg: '添加失败'
    }
  }
})

// 查找单个文章
router.get('/article', async (ctx) => {
  const id = ctx.query.id
  await Article.findOne({ _id: id }).then(rel => {
    if (rel) {
      ctx.body = {
        code: 200,
        data: rel
      }
    } else {
      ctx.body = {
        code: 300,
        msg: '查找失败'
      }
    }
  }).catch(err => {
    ctx.body = {
      code: 500,
      msg: '查找时出现异常',
      err
    }
  })
})

module.exports = router
