const { Schema, model } = require('mongoose')

const notEmptyVaildator = (v) => {
  return v.length > 0
}

const articleSchema = new Schema({
  title: {
    type: String,
    validate: {
      validator: notEmptyVaildator,
      message: '文章标题不能为空'
    }
  },
  tag_id: {
    type: String
  },
  author_id: {
    type: String,
    validate: {
      validator: notEmptyVaildator,
      message: '作者id不能为空'
    }
  },
  content: {
    type: String,
    validate: {
      validator: notEmptyVaildator,
      message: '内容不能为空'
    }
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
