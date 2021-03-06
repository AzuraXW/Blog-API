const Router = require('koa-router')
const bindAuthMiddware = require('../../utils/auth')
const { parseValidateError } = require('../../utils/tool')
const Tag = require('../../models/tag')
const router = new Router({
  prefix: '/api/v1/admin/tag'
})

// 绑定验证中间件
bindAuthMiddware(router, {})

// 获取标签列表
router.get('/list', async (ctx) => {
  const { startTime = 0, endTime = Date.now(), keyword = '' } = ctx.query
  const condition = [
    {
      $match: {
        create_at: {
          $gt: new Date(parseInt(startTime)),
          $lt: new Date(parseInt(endTime))
        }
      }
    },
    {
      $lookup: {
        from: 'articles',
        localField: '_id',
        foreignField: 'tag_id',
        as: 'articles'
      }
    }
  ]
  if (keyword) {
    const $or = [{ name: { $regex: keyword, $options: '$i' } }]
    condition.push({
      $match: {
        $or
      }
    })
  }
  const res = await Tag.aggregate(condition)
  const result = res.map(item => {
    return {
      _id: item._id,
      name: item.name,
      create_at: item.create_at,
      article_count: item.articles.length
    }
  })
  ctx.body = {
    code: 200,
    message: '获取成功',
    data: result
  }
})

// 创建新的标签
router.post('/create', async (ctx) => {
  const { name = '' } = ctx.request.body
  const tag = new Tag({
    name
  })
  const errors = parseValidateError(tag.validateSync())
  if (errors.length) {
    ctx.status = 400
    ctx.body = {
      code: 400,
      message: '发生了错误',
      errors
    }
    return
  }
  try {
    const result = await tag.save()
    ctx.body = {
      code: 200,
      message: '标签创建成功',
      data: {
        id: result._id
      }
    }
  } catch (err) {
    ctx.status = 400
    ctx.body = {
      code: 400,
      message: '该标签名称已存在'
    }
  }
})

// 查询单个标签
router.get('/detail/:id', async (ctx) => {
  const id = ctx.params.id
  if (!id) {
    ctx.status = 400
    ctx.body = {
      code: 400,
      message: '缺少标签id'
    }
    return
  }

  const result = await Tag.findById(id)
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

// 修改标签
router.post('/update/:id', async (ctx) => {
  const id = ctx.params.id
  const { name } = ctx.request.body
  if (!id) {
    ctx.status = 400
    ctx.body = {
      code: 400,
      message: '缺少标签id'
    }
    return
  }
  await Tag.findByIdAndUpdate(id, { name }, { runValidators: true })
    .then((res) => {
      ctx.body = {
        code: 200,
        message: '修改成功',
        data: res
      }
    })
    .catch((err) => {
      let error = []
      if (err.code === 11000) {
        error.push('该标签名称已存在')
      } else {
        error = parseValidateError(err)
      }
      error = error.join(',')
      ctx.status = 400
      ctx.body = {
        code: '400',
        message: error
      }
    })
})

// 删除标签
router.post('/delete/:id', async (ctx) => {
  const id = ctx.params.id
  // 判断该标签下是否还有文章
  const tag = await Tag.findById(id)
  if (tag.article_count !== 0) {
    ctx.status = 400
    ctx.body = {
      code: '400',
      message: '该标签下存在文章'
    }
    return
  }
  const result = await Tag.deleteOne({ _id: id })
  if (result.deletedCount > 0) {
    ctx.body = {
      code: '200',
      message: '删除成功'
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
