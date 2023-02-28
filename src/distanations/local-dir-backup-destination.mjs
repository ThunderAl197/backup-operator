import * as fs from 'node:fs/promises'
import * as fss from 'node:fs'
import * as path from 'node:path'
import {IBackupDestination} from './backup-destination.mjs'

export class LocalDirBackupDestination extends IBackupDestination {
  name = 'local-dir'

  /** @type string */
  rootDir

  /**
   * @param rootDir {string}
   */
  constructor(rootDir) {
    super()

    this.rootDir = rootDir
  }

  async createFileStream(name) {
    const p = path.join(this.rootDir, name)
    await fs.mkdir(path.dirname(p), {mode: 0o700, recursive: true})
    return fss.createWriteStream(p, {mode: 0o700, flags: 'w'})
  }

  async isValid() {
    return true
  }
}
