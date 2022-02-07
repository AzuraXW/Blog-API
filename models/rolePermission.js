const { Schema, model, SchemaTypes } = require('mongoose')

const rolePermissionSchema = new Schema({
  roleId: {
    type: SchemaTypes.ObjectId,
    required: {
      values: true,
      message: '角色id不能为空'
    }
  },
  permissionId: {
    type: SchemaTypes.ObjectId,
    drequired: {
      values: true,
      message: '权限id不能为空'
    }
  }
})

const RolePermission = model('rolePermission', rolePermissionSchema)

module.exports = RolePermission
