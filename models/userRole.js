const { Schema, model, SchemaTypes } = require('mongoose')

const userRoleSchema = new Schema({
  userId: {
    type: SchemaTypes.ObjectId,
    required: {
      values: true,
      message: '用户id不能为空'
    }
  },
  roleId: {
    type: SchemaTypes.ObjectId,
    required: {
      values: true,
      message: '角色id不能为空'
    },
    ref: 'role'
  }
})

const UserRole = model('userRole', userRoleSchema)

module.exports = UserRole
