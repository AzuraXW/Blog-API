const { Schema, model } = require('mongoose')

const categorySchema = new Schema({
  name: {
    type: String,
    required: {
      values: true,
      message: '分类名称不能为空'
    }
  },
  article_count: {
    type: Number,
    default: 0
  },
  cover: {
    type: String,
    default: ''
  }
}, { timestamps: { createdAt: 'create_at', updatedAt: 'update_at' } })

const Category = model('category', categorySchema)

module.exports = Category
