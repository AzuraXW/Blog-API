const qiniu = require('qiniu')
const dotenv = require('dotenv')
// 加载环境变量
dotenv.config()
const accessKey = process.env.ACCESS_KEY
const secretKey = process.env.SECRET_KEY
const publicBucketDomain = process.env.CDN
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
// 要上传的空间
const bucket = 'couldimage'
// const bucket = 'supernbk'
const options = {
  scope: bucket,
  callbackBody:
    '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}',
  callbackBodyType: 'application/json'
}
const putPolicy = new qiniu.rs.PutPolicy(options)
const uploadToken = putPolicy.uploadToken(mac)

const config = new qiniu.conf.Config()
// 是否使用https域名
// config.useHttpsDomain = true
// 上传是否使用cdn加速
config.useCdnDomain = true

// 上传
const formUploader = new qiniu.form_up.FormUploader(config)
// 空间管理
const bucketManager = new qiniu.rs.BucketManager(mac, config)
const putExtra = new qiniu.form_up.PutExtra()
// const policy = new qiniu.rs.GetPolicy()

// 上传文件
function uploadOSS (key, file) {
  return new Promise((resolve, reject) => {
    formUploader.putFile(
      uploadToken,
      key,
      file,
      putExtra,
      function (respErr, respBody, respInfo) {
        if (respErr) {
          reject(respErr)
        }
        console.log(respInfo)
        if (respInfo.statusCode === 200) {
          resolve(respBody)
        } else {
          // console.log(respInfo.statusCode)
          // console.log(respBody)
          reject(respBody)
        }
      }
    )
  })
}

// 删除空间中的图片
function removeOSS (key) {
  return new Promise((resolve, reject) => {
    bucketManager.delete(bucket, key, function (err, respBody, respInfo) {
      if (err) {
        reject(err)
      } else {
        resolve(respBody)
      }
    })
  })
}

// 下载空间中图片
function getOSS (key) {
  return new Promise((resolve, reject) => {
    const publicDownloadUrl = bucketManager.publicDownloadUrl(publicBucketDomain, key)
    resolve(publicDownloadUrl)
  })
}

module.exports = {
  uploadOSS,
  removeOSS,
  getOSS
}
