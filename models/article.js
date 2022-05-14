const { Schema, model } = require('mongoose')

const notEmptyVaildator = (v) => {
  return v.toString().length > 0
}

const articleSchema = new Schema({
  title: {
    type: String,
    index: true,
    validate: {
      validator: notEmptyVaildator,
      message: '文章标题不能为空'
    }
  },
  tag_id: {
    type: Schema.ObjectId
  },
  description: {
    type: String,
    validate: {
      validator: notEmptyVaildator,
      message: '文章摘要不能为空'
    }
  },
  author_id: {
    type: Schema.ObjectId,
    validate: {
      validator: notEmptyVaildator,
      message: '作者id不能为空'
    }
  },
  content: {
    type: String
  },
  mdContent: {
    type: String
  },
  content_img: {
    type: String
  },
  // 是否是草稿
  is_draft: {
    type: Boolean,
    default: false
  },
  // 文章是否下架
  off: {
    type: Boolean,
    default: false
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

articleSchema.index({ title: 'text' })

const Article = model('article', articleSchema)

// 设置更新时使用的validator
Article.schema.path('title').validate(function (value) {
  return value.length > 0
}, '标题不能为空')
Article.schema.path('author_id').validate(function (value) {
  return value.toString().length > 0
}, '作者id不能为空')

module.exports = Article
