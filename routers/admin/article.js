const Router = require('koa-router')
const jwt = require('jwt-simple')
const router = new Router({
  prefix: '/api/v1/admin/article'
})
const Article = require('../../models/article')
const { parseValidateError, SECRET } = require('../../utils/tool')
const bindAuthMiddware = require('../../utils/auth')

bindAuthMiddware(router, {})

// 获取文章列表
router.get('/list', async (ctx) => {
  const { page = 1, limit = 10 } = ctx.query
  const articles = await Article.aggregate([
    {
      $skip: page - 1
    },
    {
      $limit: parseInt(limit)
    },
    {
      $lookup: {
        from: 'tags',
        localField: 'tag_id',
        foreignField: '_id',
        as: 'tag'
      }
    },
    {
      $lookup: {
        from: 'admins',
        localField: 'author_id',
        foreignField: '_id',
        as: 'author'
      }
    },
    {
      $project: {
        tag_id: 0,
        author_id: 0,
        content: 0,
        'author.role': 0,
        'author.password': 0,
        'tag.article_count': 0
      }
    },
    { $unwind: '$author' },
    { $unwind: '$tag' }
  ])
  ctx.body = {
    code: 200,
    message: '本次获取' + articles.length + '条文章数据',
    count: articles.length,
    data: articles
  }
})

// 添加文章
router.post('/create', async (ctx) => {
  const authorId = jwt.decode(ctx.headers.authorization.split(' ')[1], SECRET).id
  const {
    title,
    content,
    tag_id: tagId
  } = ctx.request.body
  const article = new Article({
    title,
    content,
    tag_id: tagId,
    author_id: authorId
  })
  // console.log(authorId)
  const error = parseValidateError(article.validateSync())
  // error数组为0 参数没有出现错误
  if (!error.length) {
    // 新建
    const result = await article.save()
    console.log(result)
    ctx.body = {
      code: 200,
      message: '新建文章成功',
      data: {
        create_id: result._id
      }
    }
    return
  }
  ctx.body = 400
  ctx.body = {
    code: 400,
    message: '文章新建失败',
    errors: error
  }
})

// 查找单个文章
router.get('/detail/:id', async (ctx) => {
  const id = ctx.params.id
  if (!id) {
    ctx.status = 400
    ctx.body = {
      code: 400,
      message: '缺少文章id'
    }
    return
  }

  const result = await Article.findById(id)
  if (result) {
    ctx.body = {
      code: 200,
      message: '获取成功',
      data: result
    }
    return
  }
  ctx.status = 400
  ctx.body = {
    code: 300,
    message: '文章不存在'
  }
})

// 更新文章
router.post('/update/:id', async ctx => {
  const id = ctx.params.id
  const result = await Article.findByIdAndUpdate(
    id,
    ctx.request.body,
    { runValidators: true }
  )
  ctx.body = {
    code: 200,
    message: '更新成功',
    data: result
  }
})

// 删除文章
router.post('/delete/:id', async ctx => {
  const id = ctx.params.id
  const result = await Article.deleteOne({ _id: id })
  if (result.deletedCount > 0) {
    ctx.body = {
      code: 200,
      message: '删除成功'
    }
    return
  }
  ctx.status = 400
  ctx.body = {
    code: 400,
    message: '删除失败'
  }
})

module.exports = router
