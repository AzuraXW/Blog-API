const { Schema, model } = require('mongoose')

const roleSchema = new Schema({
  name: {
    type: String,
    required: {
      values: true,
      message: '角色名称不能为空'
    }
  },
  description: {
    type: String,
    default: ''
  }
})

const Role = model('role', roleSchema)

module.exports = Role
