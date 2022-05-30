const Router = require('koa-router')
const Article = require('../../models/article')
const mongoose = require('mongoose')
const router = new Router({
  prefix: '/api/v1/article'
})
const { parseValidateError } = require('../../utils/tool')

router.get('/list', async ctx => {
  const {
    page = 1,
    limit = 8,
    sort_key,
    sort_rule = 1
  } = ctx.query
  const query = Article.find()
  // 添加排序
  if (sort_key) {
    query.sort({
      [sort_key]: parseInt(sort_rule)
    })
  } else if (sort_key !== 'create_at') {
    query.sort({
      create_at: -1
    })
  }
  query
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('author', ['email', 'username'])
    .populate('tags', ['name'])
    .populate('category', ['name', 'cover'])
    .select({
      title: 1,
      author: 1,
      description: 1,
      tags: 1,
      read: 1,
      create_at: 1,
      category: 1
    })
  const articles = await query.exec()
  const count = await Article.find({}).count()
  ctx.body = {
    code: 200,
    message: '本次获取' + articles.length + '条文章数据',
    count,
    data: articles
  }
})

router.get('/detail/:id', async ctx => {
  const id = ctx.params.id
  const article = await Article.findById(id)
    .populate('author', ['email', 'username'])
    .populate('tags', ['name'])
    .populate('category', ['name', 'cover'])
  ctx.body = {
    code: '200',
    message: '获取成功',
    data: article
  }
})

// 搜索接口
router.get('/search', async ctx => {
  const { keyword } = ctx.query
  const articles = await Article.find({
    $or: [
      { title: { $regex: keyword, $options: '$i' } },
      { content: { $regex: keyword, $options: '$i' } },
      { description: { $regex: keyword, $options: '$i' } }
    ]
  }).sort({
    // 按发布日期降序排序
    create_at: -1
  }).select({
    tag_id: 0,
    author_id: 0,
    content: 0
  })
  ctx.body = {
    code: 200,
    messsage: '搜索成功',
    keyword,
    data: articles
  }
})

// 给文章添加阅读量
router.post('/read/:id', async ctx => {
  const id = ctx.params.id
  const article = await Article.findById(id)
  await Article.findByIdAndUpdate(id, {
    read: parseInt(article.read) + 1
  })
  ctx.body = {
    code: '200',
    message: 'OK'
  }
})

module.exports = router
