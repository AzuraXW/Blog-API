const Router = require('koa-router')
const router = new Router({
  prefix: '/api/v1'
})
const { resolve } = require('path')
const jsonfile = require('jsonfile')
const Visit = require('../../models/visit')
const { getIPAdress } = require('../../utils/ip.js')
const moment = require('moment')

router.post('/visit', async (ctx) => {
  const ip = getIPAdress()
  console.log(`${ip}访问了网站`)
  // 获取时间段
  const d1 = new Date(moment().format('LL'))
  const d2 = new Date(moment().add(1, 'days').format('LL'))
  const result = await Visit.find({
    ip: ip,
    access_at: { $gte: d1, $lt: d2 }
  })
  if (!result.length) {
    await Visit.create({ user_ip: ip })
    ctx.body = {
      code: '200',
      data: result,
      message: '记录成功'
    }
    return
  }
  ctx.body = {
    code: '200',
    data: result,
    message: '该IP今日已记录'
  }
})

router.get('/visit/count', async ctx => {
  const count = await Visit.find({}).count()
  ctx.body = {
    code: '200',
    count
  }
})

router.get('/site/about', ctx => {
  const path = resolve(__dirname, '../../data/profile.json')
  const data = jsonfile.readFileSync(path)
  ctx.body = {
    code: '200',
    data
  }
})

module.exports = router
