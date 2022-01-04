const { Schema, model } = require('mongoose')

const commentSchema = new Schema({
  user_id: {
    type: String
  },
  article_id: {
    type: String
  },
  content: {
    type: String
  },
  create_at: {
    type: Date,
    default: Date.now
  }
})

const Comment = model('comment', commentSchema)

module.exports = Comment
