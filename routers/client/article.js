const Router = require('koa-router')
const Article = require('../../models/article')
const mongoose = require('mongoose')
const router = new Router({
  prefix: '/api/v1/article'
})
const { parseValidateError } = require('../../utils/tool')

router.get('/list', async ctx => {
  const { page = 1,
    limit = 8,
    tag = '',
    tag_id: tagId = '',
    sort_key,
    sort_rule = 1
  } = ctx.query
  const condition = [
    {
      $sort: {
        create_at: -1
      }
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
        'author.email': 0,
        'author.avatar': 0,
        'tag.article_count': 0
      }
    },
    { $unwind: '$author' },
    { $unwind: '$tag' }
  ]
  // 添加标签筛选条件
  if (tag) {
    condition.push({
      $match: {
        'tag.name': tag
      }
    })
  }
  // 使用标签id也可以进行筛选
  if (tagId) {
    condition.push({
      $match: {
        'tag._id': mongoose.Types.ObjectId(tagId)
      }
    })
  }
  // 添加排序
  if (sort_key) {
    condition.push({
      $sort: {
        [sort_key]: parseInt(sort_rule)
      }
    })
  }
  // 最后添加分页条件
  condition.push(
    {
      $skip: page - 1
    },
    {
      $limit: parseInt(limit)
    }
  )
  const articles = await Article.aggregate(condition)
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
  const article = await Article.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(id)
      }
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
    { $unwind: '$author' },
    { $unwind: '$tag' },
    {
      $project: {
        tag_id: 0,
        author_id: 0,
        is_draft: 0,
        off: 0,
        content_img: 0,
        'author.role': 0,
        'author.password': 0,
        'author.email': 0,
        'author.avatar': 0,
        'tag.article_count': 0
      }
    }
  ])
  ctx.body = {
    code: '200',
    message: '获取成功',
    data: article[0]
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
  article.read = parseInt(article.read) + 1
  await article.save()
  ctx.body = {
    code: '200',
    message: 'OK'
  }
})

module.exports = router
