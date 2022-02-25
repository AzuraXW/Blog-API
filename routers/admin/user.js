const Router = require('koa-router')
const md5 = require('md5')
const jwt = require('jwt-simple')
const jsonwebtoken = require('jsonwebtoken')
const bindAuthMiddware = require('../../utils/auth')
const { getUserRoles, getUserPermission } = require('../../utils/access')
const router = new Router({
  prefix: '/api/v1/admin/user'
})
const Admin = require('../../models/admin')
const {
  parseValidateError,
  filterRequestParams,
  SECRET
} = require('../../utils/tool')
const { getOSS } = require('../../utils/upload')

// 绑定验证中间件
bindAuthMiddware(router, {
  path: ['/api/v1/admin/user/login']
})

router.post('/login', async (ctx) => {
  const { email = '', password = '' } = ctx.request.body
  // 查找用户
  const user = await Admin.findOne({
    email,
    password: md5(password)
  })
  if (user) {
    // 验证成功
    const token = jsonwebtoken.sign(
      {
        email: user.email,
        id: user._id,
        type: 'admin'
      },
      SECRET,
      { expiresIn: '24h' }
    )
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

// 添加用户
router.post('/create', async (ctx) => {
  const { username, avatar = '', email, password } = ctx.request.body
  const repeatUser = await Admin.find({
    email
  })
  if (repeatUser.length > 0) {
    ctx.status = 400
    ctx.body = {
      code: '400',
      message: '该邮箱已经存在'
    }
    return
  }
  const user = new Admin({
    username,
    avatar,
    email,
    password: md5(password)
  })
  const errors = parseValidateError(user.validateSync())
  if (errors.length) {
    ctx.body = {
      code: '400',
      message: '参数错误',
      errors
    }
    return
  }
  const result = await user.save()
  ctx.body = {
    code: '200',
    message: '用户添加成功',
    data: result
  }
})

// 删除用户
router.post('/delete/:id', async (ctx) => {
  const id = ctx.params.id
  const result = await Admin.deleteOne({ _id: id })
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

// 用户列表
router.get('/list', async (ctx) => {
  const user = await Admin.aggregate([
    {
      $lookup: {
        from: 'userroles',
        localField: '_id',
        foreignField: 'userId',
        as: 'userroles'
      }
    },
    {
      $lookup: {
        from: 'roles',
        localField: 'userroles.roleId',
        foreignField: '_id',
        as: 'roles'
      }
    },
    {
      $project: {
        password: 0,
        userroles: 0,
        'roles.__v': 0
      }
    }
  ])
  if (user.length !== 0) {
    user.forEach(async (item, index) => {
      user[index].avatar = await getOSS(item.avatar)
    })
  }
  ctx.body = {
    code: '200',
    data: user
  }
})

// 更新用户信息
router.post('/update', async (ctx) => {
  // 解析用户携带的token
  const payload = jwt.decode(ctx.headers.authorization.split(' ')[1], SECRET)
  const user = await Admin.findById(payload.id)
  if (!user) {
    // 没有此用户
    ctx.status = 400
    ctx.body = {
      code: 400,
      message: '没有此用户'
    }
    return
  }
  const data = filterRequestParams(ctx.request.body, ['username', 'avatar'])
  // 更新信息
  await Admin.findByIdAndUpdate(payload.id, data, {
    runValidators: true
  })
  ctx.body = {
    code: 200,
    message: '用户更新成功'
  }
})

// 获取用户信息
router.get('/info', async (ctx) => {
  // 解析用户携带的token
  const { id: userId } = jwt.decode(
    ctx.headers.authorization.split(' ')[1],
    SECRET
  )
  const roles = await getUserRoles(userId)
  const user = await Admin.findById(userId)
    .select('username avatar email')
    .lean()
  user.roles = roles
  if (user) {
    ctx.body = {
      code: 200,
      message: '获取成功',
      data: user
    }
    return
  }
  ctx.status = 400
  ctx.body = {
    code: 400,
    message: '没有找到此用户'
  }
})

// 用户更改密码
router.post('/update/pwd', async (ctx) => {
  const payload = jwt.decode(ctx.headers.authorization.split(' ')[1], SECRET)
  const user = await Admin.findById(payload.id)
  const {
    new_pwd: newPwd = '',
    new_pwd_confirm: newPwdConfirm = '',
    old_pwd: oldPwd = ''
  } = ctx.request.body
  if (!newPwd || !newPwdConfirm || !oldPwd) {
    ctx.status = 400
    ctx.body = {
      code: 400,
      message: '缺少参数'
    }
    return
  }
  if (user) {
    if (user.password !== md5(oldPwd)) {
      // 旧密码不一致
      ctx.status = 400
      ctx.body = {
        code: 400,
        message: '旧密码不一致'
      }
      return
    }
    if (newPwd !== newPwdConfirm) {
      // 两次密码不一致
      ctx.status = 400
      ctx.body = {
        code: 400,
        message: '两次密码不一致'
      }
      return
    }
    if (oldPwd === newPwd) {
      // 新密码不能与旧密码一致
      ctx.status = 400
      ctx.body = {
        code: 400,
        message: '新密码不能与旧密码一致'
      }
      return
    }

    // 更新用户密码
    await Admin.findOneAndUpdate(
      { _id: payload.id },
      {
        password: md5(newPwd)
      }
    )
    ctx.body = {
      code: 200,
      message: '密码更新成功'
    }
  }
})

// 获取用户的角色信息
router.post('/user-roles', async (ctx) => {
  const { userId } = ctx.request.body
  const roles = await getUserRoles(userId)
  ctx.body = {
    code: 200,
    message: '获取成功',
    data: roles
  }
})

// 获取用户的权限信息
router.post('/user-permiss', async (ctx) => {
  const { userId } = ctx.request.body
  const permission = await getUserPermission(userId)
  ctx.body = {
    code: 200,
    message: '获取成功',
    data: permission
  }
})

module.exports = router
