/**
 * IP
 * @author zhjx922
 */

import { Notification } from 'electron'
import db from './db'
import config from './config'

const rp = require('request-promise')
const shortid = require('shortid')

// 事件声明
const EventIPBind = 'ip-bind'
const EventIPSave = 'ip-save'

export default {
  ipc: null,
  // 当前IP地址
  ip: null,
  // 初始化
  Init (ipc) {
    const self = this
    self.ipc = ipc

    // IP绑定处理
    self.ipc.transfer.on(EventIPBind, (value) => {
      console.log(EventIPBind)
      this.IPBind(value)
    })

    // IP保存处理
    self.ipc.transfer.on(EventIPSave, () => {
      console.log('save')
      this.Ticks()
    })

    // 尝试启动定时器
    self.Ticks()

    // 连接远程服务器
    // self.Socket()
  },
  // 添加Hosts
  AddHosts (name, value, sort = 99) {
    const doc = { id: shortid.generate(), name: name, value: value, checked: false, sort: sort }
    return db.get('hosts').push(doc).write()
  },
  // 定时器
  Ticks () {
    const self = this
    const auto = config.GetConfig('ip.auto')

    // 检查配置，是否自动更新
    if (!auto) {
      return false
    }

    // 检查IP是否变化(异步)
    self.CheckIPChange()

    setTimeout(() => {
      console.log('ticks')
      self.Ticks()
    }, 600000)
  },
  // 检查IP变化
  CheckIPChange () {
    const self = this
    self.GetIP().then((value) => {
      // 检查IP变化
      if (self.ip !== value) {
        self.ip = value
        self.IPBind()
      }
    })
  },
  // 查询IP
  GetIP () {
    let options = {
      method: 'GET',
      timeout: 1000,
      uri: '',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': 'ip.51talk.com'
      }
    }

    options.uri = 'http://' + config.GetConfig('ip.env_ip')

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
  // IP绑定
  IPBind (value) {
    const self = this
    let options = {
      method: 'POST',
      timeout: 1000,
      uri: '',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': 'ip.51talk.com'
      },
      form: {
        username: ''
      }
    }

    if (value) {
      options.form.username = value.username
      options.uri = 'http://' + value.env_ip
    } else {
      options.form.username = config.GetConfig('ip.username')
      options.uri = 'http://' + config.GetConfig('ip.env_ip')
    }

    rp(options).then((body) => {
      console.log(body)
      self.ipc.SendEvents(EventIPBind, {type: 'success', message: body})

      const options = {
        title: 'IP绑定成功',
        body: '又可以愉快的工作了',
        silent: true
      }
      // eslint-disable-next-line no-new
      const n = new Notification(options)
      n.show()
    }).catch((err) => {
      self.ipc.SendEvents(EventIPBind, {type: 'error', message: err})
    })
  }
}
