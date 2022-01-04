const { Schema, model } = require('mongoose')

const articleSchema = new Schema({
  title: {
    type: String
  },
  tag_id: {
    type: String
  },
  author_id: {
    type: String
  },
  content: {
    type: String
  },
  create_at: {
    type: Date,
    default: Date.now
  },
  update_at: {
    type: Date,
    default: Date.now
  }
})

const Article = model('article', articleSchema)

module.exports = Article
