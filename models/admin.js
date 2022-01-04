const { Schema, model } = require('mongoose')

const commentSchema = new Schema({
  username: {
    type: String
  },
  avatar: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  role: {
    type: String
  },
  create_at: {
    type: Date,
    default: Date.now
  }
})

const Admin = model('comment', commentSchema)

module.exports = Admin
