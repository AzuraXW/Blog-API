const Router = require('koa-router')
const jwt = require('jwt-simple')
const bindAuthMiddware = require('../../utils/auth')
const {
  parseValidateError
} = require('../../utils/tool')
const Tag = require('../../models/tag')
const router = new Router({
  prefix: '/api/v1/admin/tag'
})

bindAuthMiddware(router, {
  path: ['/api/v1/admin/login']
})

router.post('/create', async ctx => {
  const { name } = ctx.request.body
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
  const result = tag.save()
  ctx.body = {
    code: 200,
    message: '标签创建成功',
    data: {
      id: result._id
    }
  }
})

module.exports = router
