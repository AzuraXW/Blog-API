const dotenv = require('dotenv')
const mongoose = require('mongoose')
// 加载环境变量
dotenv.config()

const mongodbUri = process.env.MONGODB_URI

const run = () => {
  mongoose.connect(mongodbUri, { useNewUrlParser: true })
  const db = mongoose.connection
  // 成功连接数据库
  db.once('open', function () {
    console.log('成功连接数据库')
  })
  // 连接失败
  db.once('error', function () {
    throw new Error('数据库连接失败')
  })
}

module.exports = run
