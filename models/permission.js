const { Schema, model } = require('mongoose')

const permissionSchema = new Schema({
  url: {
    type: String,
    required: {
      values: true,
      message: '用户id不能为空'
    }
  },
  name: {
    type: String,
    default: ''
  }
})

const Permission = model('permission', permissionSchema)

module.exports = Permission
