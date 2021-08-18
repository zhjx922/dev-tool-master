/**
 * Hosts
 * @author zhjx922
 */

import { app } from 'electron'
import db from './db'
import config from './config'

const fs = require('fs')
const exec = require('child_process').exec
const shortid = require('shortid')

// 事件声明
const EventHostsSwitch = 'hosts-switch'
const EventPasswordInput = 'password-input'

export default {
  ipc: null,
  // 记录用户输入的密码
  password: null,
  // 初始化
  Init (ipc) {
    const self = this
    self.ipc = ipc

    // Hosts切换处理
    self.ipc.transfer.on(EventHostsSwitch, () => {
      console.log('transfer')
      self.SaveHostsToFile()
    })

    // 密码输入处理
    self.ipc.transfer.on(EventPasswordInput, (password) => {
      self.password = password
      self.SaveHostsToFile()
    })
  },
  // 添加Hosts
  AddHosts (name, value, sort = 99) {
    const doc = { id: shortid.generate(), name: name, value: value, checked: false, sort: sort }
    return db.get('hosts').push(doc).write()
  },
  // 查询单个Hosts内容
  GetHosts (id) {
    return db.read().get('hosts').find({ id: id }).value()
  },
  // 更新单个Hosts内容
  UpdateHosts (id, data) {
    return db.get('hosts').find({ id: id }).assign(data).write()
  },
  // 删除单个Hosts
  DeleteHosts (id) {
    return db.get('hosts').remove({ id: id }).write()
  },
  // 查询所有Hosts内容
  GetAllHosts () {
    return db.read().get('hosts').sortBy('sort').value()
  },
  // 保存Hosts到文件
  SaveHostsToFile () {
    const self = this
    if (self.password === null) {
      self.ipc.SendEvents('password-input', 'show')
      return false
    }

    // 查询Hosts内容拼接
    let hostsValue = ''
    const hosts = self.GetAllHosts()
    for (let i in hosts) {
      if (hosts[i].checked) {
        hostsValue += hosts[i].value + '\n\n'
      }
    }
    // 临时文件路径
    const tmpHostPath = app.getPath('userData') + '/host.tmp'
    fs.writeFile(tmpHostPath, hostsValue, (err) => {
      if (err === null) {
        const hostsFile = '/etc/hosts'
        const cmd = [
          `echo '${self.password}' | sudo -S chmod 777 ${hostsFile}`,
          `cat "${tmpHostPath}" > ${hostsFile}`,
          `echo '${self.password}}' | sudo -S chmod 644 ${hostsFile}`
        ].join(' && ')
        exec(cmd, (error, stdout, stderr) => {
          console.log('err:' + error)
          console.log('out:' + stdout)
          console.log('ste:' + stderr)
          if (error) {
            // 重置密码为空
            self.password = null
            // 密码错误
            self.ipc.SendEvents('password-input', 'error')
          } else {
            // 隐藏密码输入框
            self.ipc.SendEvents('password-input', 'hide')
            // 通知托盘Hosts切换
            self.ipc.transfer.emit('hosts-switch-tray')
            // 通知子进程Hosts切换
            self.ipc.SendEvents('hosts-switch')
            // 更新Chrome缓存
            self.clearChrome()
          }
        })
      }
    })
  },
  // dns+socket清理
  clearChrome () {
    // 查询开关
    if (!config.GetConfig('hosts.clearChrome')) {
      return
    }
    const self = this
    const Chrome = require('chrome-remote-interface')
    Chrome({host: '127.0.0.1'}, function (chrome) {
      const {Runtime} = chrome
      Runtime.enable()
      Runtime.evaluate({ expression: 'chrome.benchmarking.clearHostResolverCache();' })
      Runtime.evaluate({ expression: 'chrome.benchmarking.clearCache();' })
      Runtime.evaluate({ expression: 'chrome.benchmarking.closeConnections();' })
      Runtime.evaluate({ expression: 'chrome.benchmarking.closeIdleSockets();' })
      Runtime.evaluate({ expression: 'chrome.benchmarking.flushSocketPools();' })
      self.ipc.SendEvents('hosts-switch', 'chromeSuccess')
    }).on('error', function (e) {
      console.error(e)
      console.error('Cannot connect to chrome')
      self.ipc.SendEvents('hosts-switch', 'chromeError')
    })
  }
}
