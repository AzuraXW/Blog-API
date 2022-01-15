const Router = require('koa-router')
const jwt = require('jwt-simple')
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
  await Tag.find({})
    .then((rel) => {
      ctx.body = {
        code: 200,
        message: '获取成功',
        data: rel
      }
    })
    .catch((err) => {
      ctx.status = 400
      ctx.body = {
        code: 400,
        message: '查询时出现异常',
        err
      }
    })
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
  const result = tag.save().catch(err => {
      if(err.code === 11000){
          ctx.status = 400
          ctx.body = {
              code: 400,
              error: ['该标签名称已存在']
          }
          return
      }
  })
  ctx.body = {
    code: 200,
    message: '标签创建成功',
    data: {
      id: result._id
    }
  }
})

// 查询单个标签
router.post('/detail/:id', async (ctx) => {
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
      error = parseValidateError(err)
      if (err.code === 11000) {
        error.push('该标签名称已存在')
      }
      ctx.body = {
        code: 500,
        message: '修改失败',
        errors: error
      }
    })
})

// 删除标签
router.post('/delete/:id', async (ctx) => {
  const id = ctx.params.id
  const result = await Tag.deleteOne({ _id: id })
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