const UserRole = require('../models/userRole')
const RolePermission = require('../models/rolePermission')
const Permission = require('../models/permission')
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

// 为角色分配选项
function assignPermission (roleId, permissionCodes) {
  const result = []
  if (!permissionCodes.length) {
    return Promise.resolve([])
  }
  return new Promise((resolve, reject) => {
    permissionCodes.forEach(async (permissionCode, index) => {
      const res = await RolePermission.create({
        roleId,
        permissionCode
      })
      result.push(res)
      if (index === permissionCodes.length - 1) {
        resolve(result)
      }
    })
  })
}

// 移除角色的权限
function removePermission (roleId, permissionCodes) {
  const result = []
  if (!permissionCodes.length) {
    return Promise.resolve([])
  }
  return new Promise((resolve, reject) => {
    permissionCodes.forEach(async (permissionCode, index) => {
      const res = await RolePermission.deleteOne({
        roleId,
        permissionCode
      })
      result.push(res)
      if (index === permissionCodes.length - 1) {
        resolve(result)
      }
    })
  })
}

// 获取用户拥有的角色
function getUserRoles (userId) {
  return new Promise(async (resolve, reject) => {
    let result = await UserRole.find({
      userId
    }).populate('roleId')
    result = result.map(x => ({
      _id: x.roleId._id,
      name: x.roleId.name,
      description: x.roleId.description,
      code: x.roleId.code
    }))
    resolve(result)
  })
}

// 获取用户拥有的角色
function getUserPermission (userId) {
  return new Promise(async (resolve, reject) => {
    // 查找出用户所有角色的id
    let roleIds = await UserRole.find({
      userId
    })
    roleIds = roleIds.map(x => x.roleId)
    // 查找这些角色所属的权限code
    let permissionCodes = await RolePermission.find({
      roleId: {
        $in: roleIds
      }
    })
    permissionCodes = permissionCodes.map(x => x.permissionCode)
    // 最后查找出权限列表
    const permission = await Permission.find({
      code: {
        $in: permissionCodes
      }
    })
    resolve(permission)
  })
}

// 判断用户是否拥有某一项权限
async function hasPermission (userId, url) {
  // 如果该用户是超级管理员，默认直接拥有所有权限，绕过验证
  const roles = await getUserRoles(userId)
  const roleNames = roles.map(x => x.code)
  if (roleNames.includes('super_admin')) return true

  // 如果该url不存在所有的权限列表中，则表示所有的用户都可以访问
  const allPermissions = await Permission.find()
  const isExist = allPermissions.some((permiss) => {
    return permiss.url === url
  })
  if (!isExist) return true

  // 正常验证普通用户的权限
  const permissions = await getUserPermission(userId)
  const arr = permissions.find((permission) => {
    return permission.url === url
  })
  return arr !== undefined
}

module.exports = {
  assignRole,
  removeRole,
  assignPermission,
  removePermission,
  diff,
  getUserRoles,
  getUserPermission,
  hasPermission
}
