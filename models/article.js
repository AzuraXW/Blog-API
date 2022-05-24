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
  tags: [{ type: Schema.Types.ObjectId, ref: 'tag', default: [] }],
  description: {
    type: String,
    validate: {
      validator: notEmptyVaildator,
      message: '文章摘要不能为空'
    }
  },
  author: {
    type: Schema.ObjectId,
    validate: {
      validator: notEmptyVaildator,
      message: '作者id不能为空'
    },
    ref: 'admin',
    default: ''
  },
  category: {
    type: Schema.ObjectId,
    ref: 'category'
  },
  content: {
    type: String,
    default: ''
  },
  mdContent: {
    type: String,
    default: ''

  },
  content_img: {
    type: String,
    default: ''
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
  },
  read: {
    type: Number,
    default: 0
  }
})

articleSchema.index({ title: 'text' })

const Article = model('article', articleSchema)

module.exports = Article
