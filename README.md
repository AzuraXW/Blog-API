# 博客API服务
这是为一个博客系统提供后端API服务的项目，包括客户端和后台管理所需的API，主要的技术栈包括 `nodejs`、 `koa`、`mongodb`、`ES6`
## 运行
```
$ npm install
$ cd Blog-API
$ npm run dev
```

## 已经完成的API功能
- 后台管理API  
  - 用户模块
    - [x] 用户登录
    - [x] 用户修改密码
    - [x] 用户修改信息
  - 文章模块
  	- [x] 文章列表
  	- [x] 发表文章
  	- [x] 修改文章
  	- [x] 删除文章
- 前台展示API

## 功能点记录
### 1、后台用户登录

登录功能使用 `jwt` 的鉴权方案，用户登录成功之后，服务端发放一个 token ，这个token包含`header` `payload` `signature` 三部分，默认采用 `SHA256` 算法对token进行编码，`payload` 部分可以把一些跟用户相关的信息编码进去，例如用户的id，这样在后续的一些操作中就增加方便  
依赖包：
```
npm install jsonwebtoken koa-jwt --save
```
其中 `jsonwebtoken` 用来生成token，而 `koa-jwt` 用来对路由进行权限控制，只有在有效期内的未被篡改的token才能通过验证，而未通过验证的请求将被分流到错误处理中间件中 

所以前端在请求需要用户登录之后的才能访问的接口时，需要设置请求头的 `authorization` 属性为服务端颁发的token，具体如下：  
```
authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IjIyMTk0NDQ4MjVAcXEuY29tIiwiaWQiOiI2MWRhZjY2ZDE4ZDE5YjBmZjhlNzI1MTIiLCJ0eXBlIjoiYWRtaW4iLCJpYXQiOjE2NDE3ODA3ODIsImV4cCI6MTY0MTg2NzE4Mn0.aOYv5BSWPO5oDPZQDuHQh8KuIYElZi7uJqR_Va4YN-g
```

完整代码如下：
```
//登录接口
router.post('/login', async ctx => {
  const {
    email = '',
    password = ''
  } = ctx.request.body
  // 查找用户
  const user = await Admin.findOne({
    email,
    password: md5(password)
  })
  if (user) {
    // 验证成功
    const token = jsonwebtoken.sign({
      email: user.email,
      id: user._id,
      type: 'admin'
    }, SECRET, { expiresIn: '24h' })
    ctx.body = {
      code: '200',
      message: '登录成功',
      token
    }
  } else {
    ctx.status = 401
    ctx.body = {
      code: '401',
      message: '邮箱或密码错误！'
    }
  }
})
```
还需要处理一下验证不通过的情况
```
// 使用验证中间件
router.use(koajwt({ secret: SECRET }).unless({
  // 登录接口不需要验证
  path: [/^\/api\/v1\/admin\/user\/login/]
}))

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
```