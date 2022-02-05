const Router = require('koa-router')
const Comment = require('../../models/comment')
const { parseValidateError } = require('../../utils/tool')
const router = new Router({
  prefix: '/api/v1'
})

// 发送评论
router.post('/comment', async (ctx) => {
  const { user_id: userId, article_id: articleId, content } = ctx.request.body
  const comment = new Comment({
    user_id: userId,
    article_id: articleId,
    content
  })
  const error = parseValidateError(comment.validateSync())
  if (!error.length) {
    // 新建
    const result = await comment.save()
    console.log(result)
    ctx.body = {
      code: 200,
      message: '评论发表成功',
      data: {
        create_id: result._id
      }
    }
    return
  }
  ctx.body = 400
  ctx.body = {
    code: 400,
    message: '评论发表失败',
    errors: error
  }
})

// 删除标签
router.post('/comment/delete/:id', async (ctx) => {
  const id = ctx.params.id
  if (!id) {
    ctx.status = 400
    ctx.body = {
      code: 400,
      message: '缺少标签id'
    }
  }
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

// 获取文章评论
router.post('/comment/article/:id', async (ctx) => {
  const { page = 1, limit = 10 } = ctx.request.body
  const id = ctx.params.id
  if (!id) {
    ctx.status = 400
    ctx.body = {
      code: 400,
      message: '缺少文章id'
    }
  }
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
    .catch(() => {
      ctx.status = 400
      ctx.body = {
        code: 400,
        message: '获取失败'
      }
    })
})

module.exports = router
