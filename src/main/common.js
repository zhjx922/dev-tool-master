const rp = require('request-promise')
let pwd

const common = {
  // IP绑定
  bindIP () {
    const options = {
      method: 'POST',
      timeout: 1000,
      uri: 'http://172.16.0.103',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': 'ip.51talk.com'
      },
      form: {
        username: 'zhaojingxian'
      }
    }
    return new Promise((resolve, reject) => {
      rp(options).then((body) => {
        resolve(body)
      }).catch((err) => {
        reject(err)
      })
    })
  },
  // 查询IP
  getIP () {
    const options = {
      method: 'GET',
      uri: 'http://172.16.0.103',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': 'ip.51talk.com'
      },
      form: {
        username: 'zhaojingxian'
      }
    }
    return new Promise((resolve, reject) => {
      rp(options).then((body) => {
        const ip = body.match(/(当前访问者IP是：)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/)
        if (ip[2]) {
          resolve(ip[2])
        } else {
          resolve('')
        }
      }).catch((err) => {
        reject(err)
      })
    })
  },
  getPwd () {
    return pwd
  },
  setPwd (value) {
    pwd = value
  }
}

exports = common
