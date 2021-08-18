'use strict'

import { app, BrowserWindow, Menu } from 'electron'
import myIpc from '../common/ipc'
import myTray from '../common/tray'
import myHosts from '../common/hosts'
import myIP from '../common/ip'
const path = require('path')
let quitApp = false

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 600,
    useContentSize: true,
    width: 800,
    title: '应用努力加载中，请稍后。',
    // titleBarStyle: 'customButtonsOnHover',
    // frame: false,
    // backgroundColor: '#545c64',
    webPreferences: {
      webSecurity: false
    }
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.loadURL(winURL)
  // mainWindow.webContents.openDevTools()

  mainWindow.on('close', (event) => {
    console.log(event)
    if (quitApp) {
      mainWindow = null
    } else {
      mainWindow.hide()
      event.preventDefault()
    }
  })

  mainWindow.on('closed', (event) => {
    mainWindow = null
  })

  mainWindow.on('hide', () => {
    myTray.SetWinShowStatus(false)
    console.log('hide')
  })

  mainWindow.on('show', () => {
    myTray.SetWinShowStatus(true)
    console.log('show')
  })

  // 菜单处理
  if (process.platform === 'darwin') {
    const template = [
      {
        label: '开发小助手',
        submenu: [
          {
            label: '退出',
            accelerator: 'Command+Q',
            click: () => {
              app.quit()
            }
          }
        ]
      },
      {
        label: '编辑',
        submenu: [
          { label: '复制', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
          { label: '粘贴', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
          { label: '查找', accelerator: 'CmdOrCtrl+F', selector: 'find:' }
        ]
      }
    ]
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  } else {
    Menu.setApplicationMenu(null)
  }

  // IPC初始化
  myIpc.Init()

  // 托盘初始化
  myTray.Init(myIpc, app, mainWindow)

  // Hosts初始化
  myHosts.Init(myIpc)

  // myIP初始化
  myIP.Init(myIpc)
}

app.on('ready', () => {
  // 窗口创建
  createWindow()
})

app.on('activate', () => {
  myTray.SetWinShowStatus(true)
  if (mainWindow === null) {
    createWindow()
  } else {
    mainWindow.show()
  }
})

app.on('before-quit', () => {
  quitApp = true
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
