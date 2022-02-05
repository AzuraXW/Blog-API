const { Schema, model } = require('mongoose')

const tagSchema = new Schema({
  name: {
    type: String,
    required: {
      values: true,
      message: '标签名字不能为空'
    }
  },
  article_count: {
    type: Number,
    default: 0
  },
  create_at: {
    type: Date,
    default: Date.now
  }
})

const Tag = model('tag', tagSchema)

module.exports = Tag
