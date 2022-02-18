const { Schema, model } = require('mongoose')

const VisitSchema = new Schema({
  user_ip: {
    type: String
  },
  access_at: {
    type: Date,
    default: Date.now
  }
})
const Visit = model('visit', VisitSchema)

module.exports = Visit
