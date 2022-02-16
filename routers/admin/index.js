const article = require('./article')
const user = require('./user')
const tag = require('./tag')
const comment = require('./comment')
const auth = require('./auth')
const upload = require('./upload')
module.exports = [
  article,
  user,
  tag,
  comment,
  auth,
  upload
]
