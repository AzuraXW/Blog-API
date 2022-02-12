const koajwt = require('koa-jwt')
const jwt = require('jwt-simple')
const { SECRET } = require('./tool')
const { hasPermission } = require('./access')

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

  // 验证用户是否有权限访问该路由
  router.use(async (ctx, next) => {
    let path = ctx.request.path
    // 截取 /admin后面的url
    path = path.split('/admin')[1]
    // 去除动态参数
    path = path.replace(/\/[a-f\d]{24}/i, '')
    // console.log(path)
    // 排除接口
    if (['/user/login'].includes(path)) return next()
    // 解析用户携带的token
    const { id: userId } = jwt.decode(ctx.headers.authorization.split(' ')[1], SECRET)
    const isNext = await hasPermission(userId, path)
    if (!isNext) {
      ctx.status = 403
      ctx.body = {
        code: 50346,
        message: '缺少访问权限'
      }
      return
    }
    return next()
  })
}
