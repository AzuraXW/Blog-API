const Router = require('koa-router')
const jwt = require('jwt-simple')
const router = new Router({
  prefix: '/api/v1/admin'
})
const Role = require('../../models/role')
const UserRole = require('../../models/userRole')
const { parseValidateError, SECRET, filterRequestParams } = require('../../utils/tool')
const bindAuthMiddware = require('../../utils/auth')

bindAuthMiddware(router, {})

// 添加角色
router.post('/role', async ctx => {
  const params = filterRequestParams(ctx.request.body, ['name', 'description'])
  try {
    const res = await Role.create(params)
    ctx.body = {
      code: 200,
      message: '角色创建成功',
      data: res
    }
  } catch (err) {
    ctx.status = 400
    ctx.body = {
      code: 400,
      message: '发生错误',
      errors: parseValidateError(err)
    }
  }
})

// 删除角色
router.delete('/role', async ctx => {
  const {
    roleId
  } = filterRequestParams(ctx.request.body, ['roleId'])
  try {
    const res = await Role.findByIdAndDelete(roleId)
    ctx.body = {
      code: 200,
      message: '删除成功',
      data: res
    }
  } catch (err) {
    ctx.status = 400
    ctx.body = {
      code: 400,
      message: '发生错误',
      errors: parseValidateError(err)
    }
  }
})

// 获取角色列表
router.get('/roles', async ctx => {
  const roleList = await Role.find()
  ctx.body = {
    code: 200,
    message: '获取成功',
    data: roleList
  }
})

// 为用户分配角色
function assignRole (userId, roleIds) {
  const result = []
  if (!roleIds.length) {
    return Promise.resolve([])
  }
  // 一次性可以分配多个角色
  return new Promise((resolve, reject) => {
    roleIds.forEach(async (roleId, index) => {
      const res = await UserRole.create({
        userId,
        roleId
      })
      result.push(res)
      if (index === roleIds.length - 1) {
        resolve(result)
      }
    })
  })
}

// 删除用户的角色
function removeRole (userId, roleIds) {
  const result = []
  if (!roleIds.length) {
    return Promise.resolve([])
  }
  return new Promise((resolve, reject) => {
    roleIds.forEach(async (roleId, index) => {
      const res = await UserRole.deleteOne({
        userId,
        roleId
      })
      result.push(res)
      if (index === roleIds.length - 1) {
        resolve(result)
      }
    })
  })
}

// 计算出需要删除的记录id，和需要新增加的记录id
function diff (oldArr, newArr) {
  const removeIds = oldArr.filter(id => {
    return !newArr.includes(id)
  })
  const createIds = newArr.filter(id => {
    return !oldArr.includes(id)
  })
  return {
    removeIds,
    createIds
  }
}

// 调整用户角色
router.post('/user/role', async ctx => {
  const params = filterRequestParams(ctx.request.body, ['userId', 'roleIds'])
  params.roleIds = params.roleIds ? params.roleIds.split(',') : []
  // 获取旧的角色
  let oldRoleIds = await UserRole.find({
    userId: params.userId
  }).select('roleId')
  // 转换成字符串方便对比
  oldRoleIds = oldRoleIds.map(x => x.roleId.toString())
  try {
    const { removeIds, createIds } = diff(oldRoleIds, params.roleIds)
    // 删除需要删除的角色
    const removeResult = await removeRole(params.userId, removeIds)
    // 添加需要添加的角色
    const result = await assignRole(params.userId, createIds)
    ctx.body = {
      code: 200,
      message: `添加了${result.length}个角色, 删除了${removeResult.length}个角色`,
      add: result
    }
  } catch (err) {
    ctx.status = 400
    ctx.body = {
      code: 400,
      message: '发生错误',
      errors: parseValidateError(err)
    }
  }
})

module.exports = router
