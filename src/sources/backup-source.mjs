/**
 * @abstract
 */
export class IBackupSource {

  /** @abstract */
  name = 'To be implemented'

  /**
   * @abstract
   * @param job {BackupJob}
   * @return {Promise<?>}
   */
  async startBackup(job) {
    throw new Error('Not implemented')
  }

  /**
   * @abstract
   * @return {Promise<?>}
   */
  async isValid() {
    throw new Error('Not implemented')
  }

  /**
   * @return {Promise<Record<string, string|number|boolean|(()=>string|number|boolean)|(()=>Promise<string|number|boolean>)>>}
   */
  async getTemplateArgs() {
    return {
      source_name: () => this.name,
    }
  }

  /**
   * @return {string|null}
   */
  getDefaultTemplate() {
    return null
  }
}
