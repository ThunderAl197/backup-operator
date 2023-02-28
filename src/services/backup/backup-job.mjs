import NestedError from 'nested-error-stacks'
import {formatStringTemplate} from '../../util.mjs'

export class BackupJob {

  /** @type {IBackupSource} */
  #source

  /** @type {IBackupDestination} */
  #destination

  /** @type {string} */
  #template

  /**
   * @param opts {{source: IBackupSource, destination: IBackupDestination, template?: string}}
   */
  constructor(opts) {
    this.#source = opts.source
    if (!this.#source) {
      throw new Error('Backup source is empty')
    }

    this.#destination = opts.destination
    if (!this.#destination) {
      throw new Error('Backup destination is empty')
    }

    this.#template = opts.template || this.#source.getDefaultTemplate()
    if (!this.#template) {
      throw new Error('Backup destination is empty')
    }
  }

  get source() {
    return this.#source
  }

  get destination() {
    return this.#destination
  }

  get template() {
    return this.#template
  }

  async isValid() {
    try {
      const [isSourceValid, isDestinationValid] = await Promise.all([
        this.#source.isValid(),
        this.#destination.isValid(),
      ])

      if (!isSourceValid) {
        throw new Error(`Source "${this.source.name}" invalid`)
      }

      if (!isDestinationValid) {
        throw new Error(`Destination "${this.destination.name}" invalid`)
      }

    } catch (e) {
      throw new NestedError('Backup job is invalid', e)
    }
  }

  async startBackup() {
    console.log(`Starting backup from source "${this.source.name}" to "${this.destination.name}"`)
    await this.source.startBackup(this)
    console.log(`Backup successfully finished`)
  }

  /**
   * @returns {Promise<Record<string, string|number|boolean|(()=>string|number|boolean)|(()=>Promise<string|number|boolean>)>>}
   */
  async getTemplateArgs() {
    const [destinationArgs, sourceArgs] = await Promise.all([
      this.destination.getTemplateArgs(),
      this.source.getTemplateArgs(),
    ])

    return {...destinationArgs, ...sourceArgs}
  }

  /**
   * @param template string
   * @param args {Record<string, string|number|boolean|(()=>string|number|boolean)|(()=>Promise<string|number|boolean>)>}
   * @param opts {{escapePath: boolean}}
   * @return {Promise<string>}
   */
  async getCompiledTemplate(template, args, opts = {}) {
    return await formatStringTemplate(template, args, opts)
  }
}
