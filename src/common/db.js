import { remote, app } from 'electron'
import fs from 'fs-extra'

const APP = process.type === 'renderer' ? remote.app : app
const dbPath = APP.getPath('home') + '/.dev-tool'

// 文件夹检查
if (!fs.pathExistsSync(dbPath)) {
  fs.mkdirpSync(dbPath)
}

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync(dbPath + '/db.json')
const db = low(adapter)

if (!db.has('hosts').value()) {
  db.set('hosts', []).write()
}

if (!db.has('config').value()) {
  db.set('config', {}).write()
}

export default db
