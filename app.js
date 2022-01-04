const dotenv = require('dotenv')
// 加载环境变量
dotenv.config()
console.log(process.env.MONGODB_URI)