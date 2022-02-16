const Koa = require('koa')
const koaBody = require('koa-body')
const cors = require('koa2-cors')
const onerror = require('koa-onerror')
const MongoDBConnect = require('./db/index.js')
const clientRouters = require('./routers/client/index') // 前端api路由
const adminRouters = require('./routers/admin/index')
// 后台api路由
const app = new Koa()

// 连接数据库
MongoDBConnect()

// 解析请求数据
app.use(koaBody({
  multipart: true
}))

// 跨域
app.use(cors())

// 添加路由中间件
clientRouters.forEach((router) => {
  app.use(router.routes(), router.allowedMethods())
})
adminRouters.forEach((router) => {
  app.use(router.routes(), router.allowedMethods())
})

// 集中处理错误
onerror(app, {
  all: (err) => {
    console.log(err.message)
  }
})

app.listen(3000)
