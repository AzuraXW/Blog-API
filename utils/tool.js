/**
 * 解析model验证器返回的错误
 * 解析成数组的形式
 * @param {*} errors
 */
function parseValidateError (error) {
  const errorArr = []
  if (!error) return errorArr
  const errors = error.errors
  Object.keys(errors).forEach(key => {
    errorArr.push(errors[key].message)
  })
  return errorArr
}

module.exports = {
  parseValidateError
}
