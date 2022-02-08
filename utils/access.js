const UserRole = require('../models/userRole')
const RolePermission = require('../models/rolePermission')
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

module.exports = {
  assignRole,
  removeRole,
  assignPermission,
  removePermission,
  diff
}
