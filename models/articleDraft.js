const { Schema, model } = require('mongoose')

const articleDraftSchema = new Schema({
  title: {
    type: String,
    index: true
  },
  description: {
    type: String
  },
  author_id: {
    type: Schema.ObjectId
  },
  content: {
    type: String
  },
  md_content: {
    type: String
  },
  content_img: {
    type: String
  },
  create_at: {
    type: Date,
    default: Date.now
  }
})

articleDraftSchema.index({ title: 'text' })

const ArticleDraft = model('articleDraft', articleDraftSchema)

module.exports = ArticleDraft
