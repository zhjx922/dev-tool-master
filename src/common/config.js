/**
 * Config
 * @author zhjx922
 */

import db from './db'

export default {
  // 查询单个Config内容
  GetConfig (key) {
    return db.read().get('config.' + key).value()
  },
  // 更新单个Config内容
  UpdateConfig (key, value) {
    return db.set('config.' + key, value).write()
  }
}
