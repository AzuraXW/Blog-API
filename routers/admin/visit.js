const Router = require('koa-router')
const router = new Router({
  prefix: '/api/v1/admin/visit'
})
const Visit = require('../../models/visit')
const moment = require('moment')

router.get('/count', async (ctx) => {
  const count = (await Visit.find().count()) || 0
  ctx.body = {
    code: '200',
    message: `一共有：${count}访问了本站`,
    count
  }
})

router.get('/today', async (ctx) => {
  // 获取时间段
  const d1 = new Date(moment().format('LL'))
  const d2 = new Date(moment().add(1, 'days').format('LL'))
  const count =
    (await Visit.find({
      access_at: { $gte: d1, $lt: d2 }
    }).count()) || 0
  ctx.body = {
    code: '200',
    message: `今日一共有：${count}访问了本站`,
    count
  }
})

router.get('/week', async (ctx) => {
  const weekArr = []
  let weekCount = 0
  for (let i = 0; i < 7; i++) {
    const week = moment().subtract(i, 'days').format('dddd')
    const d1 = new Date(moment().subtract(i, 'days').format('LL'))
    const d2 = new Date(moment().subtract(i - 1, 'days').format('LL'))
    const count =
      (await Visit.find({ access_at: { $gte: d1, $lt: d2 } }).count()) || 0
    weekCount += count
    const today = {}
    today[week] = count
    weekArr.push(today)
  }
  ctx.body = {
    code: '200',
    weekArr,
    message: `近一周共有：${weekCount}访问本站`,
    count: weekCount
  }
})

router.get('/month', async (ctx) => {
  const date = new Date()
  const day = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const monthArr = []
  let monthCount = 0
  for (let i = 0; i < day; i++) {
    const time = moment().subtract(i, 'days').format('L')
    const d1 = new Date(moment().subtract(i, 'days').format('LL'))
    const d2 = new Date(moment().subtract(i - 1, 'days').format('LL'))
    const count =
      (await Visit.find({ access_at: { $gte: d1, $lt: d2 } }).count()) || 0
    monthCount += count
    const today = {}
    today[time] = count
    monthArr.push(today)
  }
  ctx.body = {
    code: '200',
    monthArr,
    message: `近一月共有：${monthCount}访问本站`,
    count: monthCount
  }
})

module.exports = router
