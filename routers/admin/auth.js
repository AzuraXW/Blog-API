const Router = require('koa-router')
const jwt = require('jwt-simple')
const router = new Router({
  prefix: '/api/v1/admin'
})
const Role = require('../../models/role')
const UserRole = require('../../models/userRole')
const Permission = require('../../models/permission')
const { parseValidateError, SECRET, filterRequestParams } = require('../../utils/tool')
const bindAuthMiddware = require('../../utils/auth')
const {
  assignRole,
  removeRole,
  diff,
  assignPermission,
  removePermission,
  getRolePermission
} = require('../../utils/access')
const RolePermission = require('../../models/rolePermission')

bindAuthMiddware(router, {})

// 添加角色
router.post('/role', async ctx => {
  const params = filterRequestParams(ctx.request.body, ['name', 'description', 'code'])
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
router.post('/role/delete', async ctx => {
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

// 权限列表
router.get('/permission', async ctx => {
  const list = await Permission.find()
  ctx.body = {
    code: 200,
    data: list
  }
})

// 调整角色关联的权限
router.post('/role/permission', async ctx => {
  let { roleId, permissionCodes } = filterRequestParams(ctx.request.body, ['roleId', 'permissionCodes'])
  permissionCodes = permissionCodes ? permissionCodes.split(',') : ''
  // 获取角色原本拥有的权限
  let oldPermissionCodes = await RolePermission.find({
    roleId
  })
  oldPermissionCodes = oldPermissionCodes.map(x => x.permissionCode.toString())
  try {
    const { removeIds: removeCodes, createIds: createCodes } = diff(oldPermissionCodes, permissionCodes)
    const removeResult = await removePermission(roleId, removeCodes)
    const addResult = await assignPermission(roleId, createCodes)
    ctx.body = {
      code: 200,
      message: `添加了${addResult.length}条权限，删除了${removeResult.length}个权限`,
      add: addResult
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

// 获取角色的权限信息
router.post('/role-permiss', async ctx => {
  const { roleId } = ctx.request.body
  const permission = await getRolePermission(roleId)
  ctx.body = {
    code: 200,
    message: '获取成功',
    data: permission
  }
})

module.exports = router
