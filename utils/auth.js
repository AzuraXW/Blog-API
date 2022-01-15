const koajwt = require('koa-jwt')
const SECRET = require('./tool')

module.exports = function (router, unless) {
  // 处理401权限验证不通过
  router.use(function (ctx, next) {
    return next().catch((err) => {
      if (err.status === 401) {
        ctx.status = 401
        ctx.body = {
          code: 401,
          message: 'Authentication Error'
        }
      } else {
        throw err
      }
    })
  })

  // 使用验证中间件
  router.use(koajwt({ secret: SECRET }).unless(unless))
  /*
  {
    // 登录接口不需要验证
    path: [/^\/api\/v1\/admin\/user\/login/]
  }
   */
}
