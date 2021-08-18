/**
 * 托盘
 * @author zhjx922
 */

import { Menu, Tray } from 'electron'
import hosts from '../common/hosts'
const path = require('path')
// 事件声明
const EventHostsSwitchTray = 'hosts-switch-tray'

const app = {
  sender: {
    hosts: null,
    ip: null
  },
  app: null,
  win: null,
  ipc: null,
  show: true,
  Init (ipc, app, win) {
    this.app = app
    this.win = win
    this.ipc = ipc
    this.tray = new Tray(path.join(__static, 'logo.png'))
    this.ReloadMenu()

    // Hosts切换处理
    this.ipc.transfer.on(EventHostsSwitchTray, () => {
      this.ReloadMenu()
    })
  },
  SetWinShowStatus (status) {
    this.show = status
  },
  // 重新加载菜单
  ReloadMenu () {
    console.log('reload menu')
    let template = []
    template.push(
      {
        label: '开发小助手',
        type: 'normal',
        click: () => {
          this.show ? this.win.hide() : this.win.show()
        }
      },
      {
        label: '-',
        type: 'separator'
      }
    )

    const hostsInfo = hosts.GetAllHosts()
    console.log(hostsInfo)

    for (let i in hostsInfo) {
      template.push(
        {
          label: hostsInfo[i].name,
          type: 'checkbox',
          checked: !!hostsInfo[i].checked,
          click: () => {
            hosts.UpdateHosts(hostsInfo[i].id, { checked: !hostsInfo[i].checked })
            // 托盘切换
            this.ipc.transfer.emit('event', 'hosts-switch', 'tray')
          }
        }
      )
    }

    template.push(
      {
        label: '-',
        type: 'separator'
      },
      {
        label: '退出',
        click: () => {
          this.app.quit()
        }
      }
    )

    const contextMenu = Menu.buildFromTemplate(template)
    this.tray.setToolTip('开发小助手')
    this.tray.setContextMenu(contextMenu)
  }
}

export default app
