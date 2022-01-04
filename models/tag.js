const { Schema, model } = require('mongoose')

const tagSchema = new Schema({
  name: {
    type: String
  },
  article_count: {
    type: Number
  },
  create_at: {
    type: Date,
    default: Date.now
  }
})

const Tag = model('tag', tagSchema)

module.exports = Tag
