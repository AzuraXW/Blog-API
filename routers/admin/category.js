const Router = require('koa-router')
const jwt = require('jwt-simple')
const Category = require('../../models/category')
const Tag = require('../../models/tag')
const Article = require('../../models/article')
const { parseValidateError,
  SECRET,
  filterRequestParams,
  cdnDomain
} = require('../../utils/tool')
const bindAuthMiddware = require('../../utils/auth')
const { removeOSS, uploadOSS } = require('../../utils/upload')
const { Schema, default: mongoose } = require('mongoose')
const { v4: uuidV4 } = require('uuid')
const { remove } = require('../../models/category')

const router = new Router({
  prefix: '/api/v1/admin/category'
})
bindAuthMiddware(router, {})

async function uploadCover (cover) {
  let coverKey = ''
  if (cover && cover.size) {
    coverKey = `category-cover/${uuidV4()}`
    // 上传封面
    const res = await uploadOSS(coverKey, cover.path)
  }
  return coverKey
}

// 新建分类
router.post('/create', async ctx => {
  const { name } = ctx.request.body
  const cover = ctx.request.files.cover
  const coverKey = uploadCover(cover)
  const result = await Category.create({
    name,
    cover: coverKey
  })
  ctx.body = {
    code: '200',
    message: '创建成功'
  }
})

// 分类列表
router.get('/list', async ctx => {
  const result = await Category.find({}).lean()
  result.forEach(item => {
    if (item.cover) {
      item.cover = cdnDomain() + item.cover
    }
  })
  ctx.body = {
    code: '200',
    data: result
  }
  // const result = await Article.updateMany({}, {
  //   $set: {
  //     category: mongoose.Types.ObjectId('628b411f0e3c0ca99889f28a')
  //   }
  // })
  // ctx.body = result
})

// 删除分类
router.post('/delete', async ctx => {
  // ids -> id数组，可用于批量删除
  const { ids = '' } = ctx.request.body
  const deleteIds = [...ids.split(',')]
  const result = await Category.deleteMany({
    _id: {
      $in: deleteIds
    }
  })
  ctx.body = {
    code: '200',
    message: '删除成功',
    deleteCount: result.deletedCount
  }
})

// 更新分类信息
router.post('/update/:id', async ctx => {
  const { id } = ctx.params
  const { name } = ctx.request.body
  const cover = ctx.request.files.cover
  const oldCover = (await Category.findById(id)).cover
  removeOSS(oldCover)  // 删除旧封面
  // 上传封面
  const coverKey = await uploadCover(cover)
  console.log(coverKey)
  const result = await Category.findByIdAndUpdate(id, {
    name,
    cover: coverKey
  })
  ctx.body = {
    code: '200',
    message: '更新成功'
  }
})

module.exports = router