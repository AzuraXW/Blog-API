const Router = require('koa-router')
const router = new Router({
  prefix: '/api/v1/admin'
})
const moment = require('moment')
const Article = require('../../models/article')
const Visit = require('../../models/visit')

router.get('/article/count', async (ctx) => {
  const todayDate = moment().format('ll')
  const yesterdayDate = moment().subtract(1, 'day').format('ll')
  const count = await Article.find().count()
  const today = await Article.find({
    create_at: {
      $gte: todayDate
    }
  }).count()
  const yesterday = await Article.find({
    create_at: {
      $gte: yesterdayDate,
      $lt: todayDate
    }
  }).count()
  ctx.body = {
    code: '200',
    data: {
      count: count,
      today,
      yesterday
    }
  }
})

router.get('/article/week', async (ctx) => {
  const labels = []
  const data = []
  let weekCount = 0
  for (let i = 0; i < 7; i++) {
    const week = moment().locale('zh-cn').subtract(i, 'days').format('dddd')
    const d1 = new Date(moment().subtract(i, 'days').format('LL'))
    const d2 = new Date(
      moment()
        .subtract(i - 1, 'days')
        .format('LL')
    )
    const todayCount = await Article.find({
      create_at: { $gte: d1, $lt: d2 }
    }).count()
    weekCount += todayCount
    labels.unshift(week)
    data.unshift(todayCount)
  }
  ctx.body = {
    code: '200',
    labels,
    data,
    message: `近7天共创作：${weekCount}篇文章`,
    count: weekCount
  }
})

router.get('/article/month', async (ctx) => {
  const labels = []
  const data = []
  // const date = new Date()
  // const day = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const day = 30
  let monthCount = 0
  for (let i = 0; i < day; i++) {
    const time = moment().locale('zh-cn').subtract(i, 'days').format('ll')
    const d1 = new Date(moment().subtract(i, 'days').format('LL'))
    const d2 = new Date(
      moment()
        .subtract(i - 1, 'days')
        .format('LL')
    )
    const todayCount = await Article.find({
      create_at: { $gte: d1, $lt: d2 }
    }).count()
    monthCount += todayCount
    labels.unshift(time)
    data.unshift(todayCount)
  }
  ctx.body = {
    code: '200',
    labels,
    data,
    message: `近30天共创作：${monthCount}篇文章`,
    count: monthCount
  }
})

router.get('/visit/count', async (ctx) => {
  const todayDate = moment().format('ll')
  const yesterdayDate = moment().subtract(1, 'day').format('ll')
  const count = await Visit.find().count()
  const today = await Visit.find({
    access_at: {
      $gte: todayDate
    }
  }).count()
  const yesterday = await Visit.find({
    access_at: {
      $gte: yesterdayDate,
      $lt: todayDate
    }
  }).count()
  ctx.body = {
    code: '200',
    data: {
      count: count,
      today,
      yesterday
    }
  }
})

router.get('/visit/week', async (ctx) => {
  const labels = []
  const data = []
  let weekCount = 0
  for (let i = 0; i < 7; i++) {
    const week = moment().locale('zh-cn').subtract(i, 'days').format('dddd')
    const d1 = new Date(moment().subtract(i, 'days').format('LL'))
    const d2 = new Date(
      moment()
        .subtract(i - 1, 'days')
        .format('LL')
    )
    const todayCount = await Visit.find({
      access_at: { $gte: d1, $lt: d2 }
    }).count()
    weekCount += todayCount
    labels.unshift(week)
    data.unshift(todayCount)
  }
  ctx.body = {
    code: '200',
    labels,
    data,
    message: `近7天共有：${weekCount}个用户访问`,
    count: weekCount
  }
})

router.get('/visit/month', async (ctx) => {
  const labels = []
  const data = []
  const day = 30
  let monthCount = 0
  for (let i = 0; i < day; i++) {
    const time = moment().locale('zh-cn').subtract(i, 'days').format('ll')
    const d1 = new Date(moment().subtract(i, 'days').format('LL'))
    const d2 = new Date(
      moment()
        .subtract(i - 1, 'days')
        .format('LL')
    )
    const todayCount = await Visit.find({
      access_at: { $gte: d1, $lt: d2 }
    }).count()
    monthCount += todayCount
    labels.unshift(time)
    data.unshift(todayCount)
  }
  ctx.body = {
    code: '200',
    labels,
    data,
    message: `近30天共有：${monthCount}个用户访问`,
    count: monthCount
  }
})

module.exports = router
