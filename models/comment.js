const { Schema, model } = require('mongoose')

const commentSchema = new Schema({
  user_id: {
    type: String
  },
  article_id: {
    type: String
  },
  content: {
    type: String,
    validate: {
      validator: (content) => {
        const patt = /[艹,操,草,cao]你妈/g
        return !patt.test(content)
      },
      message: '不能说脏话哦'
    }
  },
  create_at: {
    type: Date,
    default: Date.now
  }
})

const Comment = model('comment', commentSchema)

module.exports = Comment
