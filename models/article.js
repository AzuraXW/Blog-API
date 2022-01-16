const { Schema, model } = require('mongoose')

const notEmptyVaildator = (v) => {
  console.log(v.toString().length > 0)
  return v.toString().length > 0
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
    type: Schema.ObjectId
  },
  author_id: {
    type: Schema.ObjectId,
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

// 设置更新时使用的validator
Article.schema.path('title').validate(function (value) {
  return value.length > 0
}, '标题不能为空')
Article.schema.path('author_id').validate(function (value) {
  return value.toString().length > 0
}, '作者id不能为空')
Article.schema.path('content').validate(function (value) {
  return value.length > 0
}, '内容不能为空')

module.exports = Article
