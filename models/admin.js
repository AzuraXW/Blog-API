const { Schema, model } = require('mongoose')

const adminSchema = new Schema({
  username: {
    type: String,
    required: {
      values: true,
      message: '用户名不能为空'
    }
  },
  avatar: {
    type: String
  },
  email: {
    type: String,
    required: {
      values: true,
      message: '邮箱不能为空'
    }
  },
  password: {
    type: String,
    required: {
      values: true,
      message: '密码不能为空'
    }
  },
  create_at: {
    type: Date,
    default: Date.now
  }
})

const Admin = model('admin', adminSchema)

Admin.schema.path('username').validate(function (value) {
  return value.length > 0
}, '用户名不能为空')
Admin.schema.path('password').validate(function (value) {
  return value.length > 0
}, '密码不能为空')

module.exports = Admin
