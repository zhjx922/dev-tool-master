/**
 * IPC事件处理
 * @author zhjx922
 */

import { ipcMain } from 'electron'

const ipc = {
  // Sender集合
  sender: {
    'hosts-switch': {},
    'password-input': {},
    'ip-bind': {},
    'ip-save': {}
  },
  // 主进程事件传递员
  transfer: null,
  // 初始化
  Init () {
    // 主进程事件传输初始化
    const EventEmitter = require('events').EventEmitter
    this.transfer = new EventEmitter()

    // 接收主进程事件(用来分发事件)
    this.transfer.on('event', (eventName, eventValue) => {
      this.transfer.emit(eventName, eventValue)
    })

    // 接收渲染进程事件
    ipcMain.on('event', (event, eventName, eventValue) => {
      console.log('ipcMain:', eventName, eventValue)
      switch (eventName) {
        // 注册sender
        case 'reg':
          this.SenderReg(event.sender, eventValue)
          break
        // 其它事件
        default:
          this.transfer.emit(eventName, eventValue)
          break
      }
    })
  },
  // Sender注册+事件订阅
  SenderReg (sender, value) {
    // 页面名称
    const name = value.name
    // 需要注册的事件
    const events = value.events
    for (let i in events) {
      // 同一个事件可以多个页面注册
      this.sender[events[i]][name] = sender
    }
  },
  // 向渲染进程发送事件
  SendEvents (event, value = null) {
    for (let i in this.sender[event]) {
      this.sender[event][i].send('event', event, value)
    }
  }
}

export default ipc
