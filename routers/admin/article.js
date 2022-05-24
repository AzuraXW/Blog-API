const Router = require('koa-router')
const jwt = require('jwt-simple')
const router = new Router({
  prefix: '/api/v1/admin/article'
})
const Article = require('../../models/article')
const Tag = require('../../models/tag')
const { parseValidateError, SECRET, filterRequestParams } = require('../../utils/tool')
const bindAuthMiddware = require('../../utils/auth')
const { removeOSS } = require('../../utils/upload')

bindAuthMiddware(router, {})
const publicBucketDomain = process.env.CDN

// 获取文章列表
router.get('/list', async (ctx) => {
  const {
    page = 1,
    limit = 10,
    startTime = 0,
    endTime = Date.now(),
    keyword = '',
    type = null,
    off = 0
  } = ctx.query
  const condition = {
    create_at: {
      $gt: new Date(parseInt(startTime)),
      $lt: new Date(parseInt(endTime))
    },
    // 判断是否是获取草稿
    is_draft: type === 'draft'
  }

  // 添加搜索关键字条件
  if (keyword) {
    condition.$or = [
      { title: { $regex: keyword, $options: '$i' } },
      { content: { $regex: keyword, $options: '$i' } },
      { description: { $regex: keyword, $options: '$i' } }
    ]
  }
  const total = await Article.find(condition).count()  // 总记录数
  const articles = await Article.find(condition)
    .sort({
      create_at: -1
    })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('author', ['email', 'username'])
    .populate('tags', ['name'])
    .populate('category', ['name', 'cover'])
  if (type !== 'draft') {
    ctx.body = {
      code: '200',
      message: `本次获取${articles.length}条文章数据`,
      count: articles.length,
      pageCount: Math.ceil((total || 1) / limit),
      data: articles
    }
  } else {
    ctx.body = {
      code: '200',
      message: `本次获取${articles.length}条草稿数据`,
      count: articles.length,
      data: articles
    }
  }
})

// 添加文章
router.post('/create', async (ctx) => {
  const authorId = jwt.decode(
    ctx.headers.authorization.split(' ')[1],
    SECRET
  ).id

  // 过滤参数
  const field = filterRequestParams(ctx.request.body, [
    'title',
    'content',
    'mdContent',
    'content_img',
    'tags',
    'description',
    'is_draft',
    'category'
  ])

  const article = new Article({
    ...field,
    author: authorId,
    tags: field.tags ? field.tags.split(',') : []
  })

  // 新建
  const result = await article.save()
  ctx.body = {
    code: '200',
    message: '新建文章成功',
    data: {
      create_id: result._id
    }
  }
})

// 文章详情
router.get('/detail/:id', async (ctx) => {
  const id = ctx.params.id
  if (!id) {
    ctx.status = 400
    ctx.body = {
      code: '400',
      message: '缺少文章id'
    }
    return
  }
  const result = await Article.findById(id)
    .populate('author', ['email', 'username'])
    .populate('tags', ['name'])
    .populate('category', ['name', 'cover'])

  if (result) {
    ctx.body = {
      code: '200',
      message: '获取成功',
      data: result
    }
    return
  }

  ctx.status = 400
  ctx.body = {
    code: '300',
    message: '文章不存在'
  }
})

// 更新文章
router.post('/update/:id', async (ctx) => {
  const id = ctx.params.id
  const { tags } = ctx.request.body
  const result = await Article.findByIdAndUpdate(
    id,
    {
      ...ctx.request.body,
      tags: tags ? tags.split(',') : [],
      update_at: new Date().toString()
    },
    {
      runValidators: true
    }
  )
  ctx.body = {
    code: '200',
    message: '更新成功',
    data: result
  }
})

// 改变文章的状态
router.post('/status/:id', async (ctx) => {
  const id = ctx.params.id
  const { off } = ctx.request.body
  const result = await Article.findByIdAndUpdate(
    id,
    {
      off
    }
  )
  ctx.body = {
    code: '200',
    message: '更新成功',
    data: result
  }
})

// 删除文章
router.post('/delete/:id', async (ctx) => {
  const id = ctx.params.id
  const article = await Article.findById(id)
  const result = await Article.deleteOne({ _id: id })
  if (result.deletedCount > 0) {
    ctx.body = {
      code: '200',
      message: '删除成功'
    }
    // 删除文章内容中的图片
    if (article.content_img !== '') {
      const imgs = article.content_img.split(',')
      imgs.forEach(async (img) => {
        img = img.split(publicBucketDomain)[1]
        await removeOSS(img)
      })
    }
    return
  }
  ctx.status = 400
  ctx.body = {
    code: '400',
    message: '删除失败'
  }
})

module.exports = router
