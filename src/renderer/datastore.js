import Datastore from 'nedb'
import path from 'path'
import { remote } from 'electron'

export function dbConfig () {
  return new Datastore({
    autoload: true,
    filename: path.join(remote.app.getPath('userData'), '/talk-config.db')
  })
}

export function dbHosts () {
  return new Datastore({
    autoload: true,
    filename: path.join(remote.app.getPath('userData'), '/talk-hosts.db')
  })
}
