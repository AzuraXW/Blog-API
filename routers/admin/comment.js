const Router = require('koa-router')
const bindAuthMiddware = require('../../utils/auth')
const Comment = require('../../models/comment')
const router = new Router({
  prefix: '/api/v1/admin/comment'
})

// 绑定验证中间件
bindAuthMiddware(router, {})

// 获取文章评论
router.post('/article/:id', async (ctx) => {
  const { page = 1, limit = 10 } = ctx.request.body
  const id = ctx.params.id
  await Comment.find({ article_id: id })
    .skip(page - 1)
    .limit(parseInt(limit))
    .then((res) => {
      ctx.body = {
        code: 200,
        message: '本次获取' + res.length + '条评论数据',
        count: res.length,
        data: res
      }
    })
    .catch((err) => {
      ctx.status = 400
      ctx.body = {
        code: 400,
        message: '获取失败',
        err
      }
    })
})

// 获取单条评论
router.post('/detail/:id', async (ctx) => {
  const id = ctx.params.id
  if (!id) {
    ctx.status = 400
    ctx.body = {
      code: 400,
      message: '缺少评论id'
    }
    return
  }

  const result = await Comment.findById(id)
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
    message: '评论不存在'
  }
})

// 修改评论
router.post('/update/:id', async (ctx) => {
  const id = ctx.params.id
  const { content } = ctx.request.body
  if (!id) {
    ctx.status = 400
    ctx.body = {
      code: 400,
      message: '缺少评论id'
    }
  }
  await Comment.findByIdAndUpdate(id, { content })
    .then((res) => {
      ctx.body = {
        code: 200,
        message: '修改成功',
        data: res
      }
    })
    .catch((err) => {
      ctx.body = {
        code: 500,
        message: '修改失败',
        err
      }
    })
})

// 删除评论
router.post('/delete/:id', async (ctx) => {
  const id = ctx.params.id
  const result = await Comment.deleteOne({ _id: id })
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
