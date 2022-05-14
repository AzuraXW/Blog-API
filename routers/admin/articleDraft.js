const Router = require('koa-router')
const jwt = require('jwt-simple')
const router = new Router({
  prefix: '/api/v1/admin/article-draft'
})
const ArticleDraft = require('../../models/articleDraft')
const { parseValidateError, SECRET } = require('../../utils/tool')
const bindAuthMiddware = require('../../utils/auth')
const { removeOSS } = require('../../utils/upload')
const mongoose = require('mongoose')

bindAuthMiddware(router, {})
const publicBucketDomain = process.env.CDN

router.get('/list', async (ctx) => {
  const authorId = jwt.decode(
    ctx.headers.authorization.split(' ')[1],
    SECRET
  ).id
  const Id = mongoose.Types.ObjectId(authorId)
  const Articles = await ArticleDraft.aggregate([
    {
      $match: {
        author_id: Id
      }
    },
    {
      $sort: {
        create_at: -1
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
        author_id: 0,
        'author.role': 0,
        'author.password': 0
      }
    },
    { $unwind: '$author' }
  ])
  ctx.body = {
    code: '200',
    message: '本次获取' + Articles.length + '条文章数据',
    count: Articles.length,
    data: Articles
  }
})

// 添加草稿
router.post('/create', async (ctx) => {
  const authorId = jwt.decode(
    ctx.headers.authorization.split(' ')[1],
    SECRET
  ).id
  const {
    title,
    content,
    tag_id: tagId,
    mdContent,
    content_img: ContentImg,
    description
  } = ctx.request.body
  const Article = new ArticleDraft({
    title,
    content,
    mdContent,
    tag_id: tagId,
    content_img: ContentImg,
    author_id: authorId,
    description
  })
  // 新建
  const result = await Article.save()
  try {
    ctx.body = {
      code: '200',
      message: '新建文章成功',
      data: {
        create_id: result._id
      }
    }
  } catch (error) {
    ctx.status = 400
    ctx.body = {
      code: '400',
      message: '文章新建失败',
      errors: error
    }
  }
})

// 草稿详情
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

  const result = await ArticleDraft.findById(id)
  console.log(result)
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

// 更新草稿
router.post('/update/:id', async (ctx) => {
  const id = ctx.params.id
  const result = await ArticleDraft.findByIdAndUpdate(id, {
    ...ctx.request.body,
    update_at: new Date().toString()
  })
  ctx.body = {
    code: '200',
    message: '更新成功',
    data: result
  }
})

// 删除草稿
router.post('/delete/:id', async (ctx) => {
  const id = ctx.params.id
  const Article = await ArticleDraft.findById(id)
  const result = await ArticleDraft.deleteOne({ _id: id })
  if (result.deletedCount > 0) {
    ctx.body = {
      code: '200',
      message: '删除成功'
    }
    // 删除文章内容中的图片
    if (Article.content_img !== '') {
      const imgs = Article.content_img.split(',')
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
