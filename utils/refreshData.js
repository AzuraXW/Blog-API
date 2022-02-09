const Permission = require('../models/permission')
const MongoDBConnect = require('../db/index.js')
MongoDBConnect()
const permissionsList = [
  {
    url: '/article/list',
    name: '文章列表',
    code: '57566328',
    category: 'article'
  },
  {
    url: '/article/create',
    name: '创建文章',
    code: '90596748',
    category: 'article'
  },
  {
    url: '/article/detail',
    name: '文章详情',
    code: '78843835',
    category: 'article'
  },
  {
    url: '/article/update',
    name: '更新文章',
    code: '45093628',
    category: 'article'
  },
  {
    url: '/article/delete',
    name: '删除文章',
    code: '41912847',
    category: 'article'
  },
  {
    url: '/tag/list',
    name: '标签列表',
    code: '93556891',
    category: 'tag'
  },
  {
    url: '/tag/create',
    name: '创建标签',
    code: '44974458',
    category: 'tag'
  },
  {
    url: '/tag/detail',
    name: '标签详情',
    code: '65268848',
    category: 'tag'
  },
  {
    url: '/tag/update',
    name: '更新标签',
    code: '21208928',
    category: 'tag'
  },
  {
    url: '/tag/delete',
    name: '删除标签',
    code: '68762522',
    category: 'tag'
  },
  {
    url: '/role',
    name: '添加角色',
    code: '81012410',
    category: 'access'
  },
  {
    url: '/role/delete',
    name: '删除角色',
    code: '18382219',
    category: 'access'
  },
  {
    url: '/roles',
    name: '角色列表',
    code: '74525863',
    category: 'access'
  },
  {
    url: '/user/role',
    name: '调整用户角色',
    code: '97016160',
    category: 'access'
  },
  {
    url: '/permission',
    name: '权限列表',
    code: '23656171',
    category: 'access'
  },
  {
    url: '/role/permission',
    name: '调整角色权限',
    code: '42232097',
    category: 'access'
  },
  {
    url: '/user/create',
    name: '添加用户',
    code: '23230368',
    category: 'user'
  }
]

function initPermiss () {
  Permission.remove({})
  Permission.insertMany(permissionsList)
}

initPermiss()
