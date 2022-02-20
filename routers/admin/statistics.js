const Router = require('koa-router')
const router = new Router({
  prefix: '/api/v1/admin'
})
const moment = require('moment')
const Article = require('../../models/article')
const Visit = require('../../models/visit')

// 文章总数
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

// 文章图表数据
router.get('/article/chart', async (ctx) => {
  const { preset_date: presetDate } = ctx.query
  // 图标横轴标签
  const labels = []
  // 标签对应的数据
  const data = []
  // const date = new Date()
  // const day = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  let dayRange = 7
  if (presetDate === 'week') {
    // 一个星期的数据
    dayRange = 7
  } else if (presetDate === 'month') {
    // 一个月的数据
    dayRange = 30
  }

  // 一段时间的总数量
  let count = 0

  for (let i = 0; i < dayRange; i++) {
    const time = moment().locale('zh-cn').subtract(i, 'days').format('ll')
    const d1 = new Date(moment().subtract(i, 'days').format('LL'))
    const d2 = new Date(
      moment()
        .subtract(i - 1, 'days')
        .format('LL')
    )
    // 今日的文章数量
    const todayCount = await Article.find({
      create_at: { $gte: d1, $lt: d2 }
    }).count()
    count += todayCount
    labels.unshift(time)
    data.unshift(todayCount)
  }
  ctx.body = {
    code: 200,
    labels,
    data,
    message: `近${dayRange}天共创作：${count}篇文章`,
    count
  }
})

// 访问总数
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

// 访问人数图表数据
router.get('/visit/chart', async (ctx) => {
  const { preset_date: presetDate } = ctx.query
  // 图表横轴标签
  const labels = []
  // 标签对应的数据
  const data = []

  let dayRange = 7
  if (presetDate === 'week') {
    // 一个星期的数据
    dayRange = 7
  } else if (presetDate === 'month') {
    // 一个月的数据
    dayRange = 30
  }

  // 一段时间的总数量
  let count = 0

  for (let i = 0; i < dayRange; i++) {
    const time = moment().locale('zh-cn').subtract(i, 'days').format('ll')
    const d1 = new Date(moment().subtract(i, 'days').format('LL'))
    const d2 = new Date(
      moment()
        .subtract(i - 1, 'days')
        .format('LL')
    )
    // 今日的访问人数
    const todayCount = await Visit.find({
      create_at: { $gte: d1, $lt: d2 }
    }).count()
    count += todayCount
    labels.unshift(time)
    data.unshift(todayCount)
  }
  ctx.body = {
    code: 200,
    labels,
    data,
    message: `近${dayRange}天共有：${count}个用户访问`,
    count
  }
})

module.exports = router
