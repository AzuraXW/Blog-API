const dotenv = require('dotenv')
const Router = require('koa-router')
const router = new Router({
  prefix: '/api/v1/admin/upload'
})
const Admin = require('../../models/admin')
const { tokenToId } = require('../../utils/tool')
const bindAuthMiddware = require('../../utils/auth')
const { uploadOSS, removeOSS } = require('../../utils/upload')

bindAuthMiddware(router, {})

// 加载环境变量
dotenv.config()
const CdnDomain = process.env.CDN
// 用户头像上传
router.post('/avatar', async ctx => {
  const userId = tokenToId(ctx.headers.authorization)
  const avatar = ctx.request.files.avatar
  if (!avatar || !avatar.size) {
    // 没有上传文件
    ctx.status = 401
    ctx.body = {
      code: 401,
      message: '没有上传头像'
    }
    return
  }
  // 上传的文件名
  const fileKey = 'avatar_' + userId
  try {
    // 删除用户原来的头像
    await removeOSS(fileKey)
    // 上传新的用户头像
    const result = await uploadOSS(fileKey, avatar.path)
    // 更新用户的头像
    await Admin.findByIdAndUpdate(userId, {
      avatar: fileKey
    })
    ctx.body = {
      code: 200,
      data: {
        url: CdnDomain + result.key + '?timestamp=' + new Date().getTime()
      }
    }
  } catch (error) {
    ctx.status = 400
    ctx.body = {
      code: 400,
      ...error
    }
  }
})

module.exports = router
