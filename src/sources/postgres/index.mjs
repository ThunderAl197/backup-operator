import {IBackupSource} from '../backup-source.mjs'
import {startPgDump} from './dump.mjs'
import NestedError from 'nested-error-stacks'
import {pipeline} from 'node:stream/promises'

export class PostgresBackupSource extends IBackupSource {

  /** @type {{additionalArgs?: Record<string, string|boolean>, env?: Record<string, string>, verbose?: boolean, host: string, host: string, port?: string|number, user: string, password: '!'|string, dbname: string, schema?: string}} */
  dumpConfig

  /** @type {{fileSuffix?: string}} */
  config

  /**
   * @param name {string}
   * @param dumpConfig {{additionalArgs?: Record<string, string|boolean>, env?: Record<string, string>, verbose?: boolean, host: string, host: string, port?: string|number, user: string, password: '!'|string, dbname: string, schema?: string}}
   * @param config {{}}
   */
  constructor(name, dumpConfig, config = {}) {
    super()

    this.name = name
    this.dumpConfig = dumpConfig
    this.config = config
  }

  async startBackup(job) {
    try {
      const destinationFileName = await job.getCompiledTemplate(
        job.template,
        await job.getTemplateArgs(),
        {escapePath: true},
      )

      const destinationStream = await job.destination.createFileStream(destinationFileName)
      const {wait, stream: sourceStream} = await startPgDump(this.dumpConfig)

      const pipe = pipeline(
        sourceStream,
        destinationStream,
      )

      await Promise.all([
        wait,
        pipe,
      ])
    } catch (e) {
      throw new NestedError('Backup failed', e)
    }
  }

  async isValid() {
    // TODO validate postgres params
    return true
  }

  async getTemplateArgs() {
    return {
      ...await super.getTemplateArgs(),
      db_host: this.dumpConfig.host,
      db_port: this.dumpConfig.port,
      db_database: this.dumpConfig.dbname,
      db_user: this.dumpConfig.user,
      db_schema: this.dumpConfig.schema,
    }
  }

  getDefaultTemplate() {
    return '[source_name]/[source_name]_[date]_[time].pgdump'
  }
}
