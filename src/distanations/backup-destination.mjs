/**
 * @abstract
 */
export class IBackupDestination {
  /** @abstract */
  name = 'To be Implemented'

  /**
   * @abstract
   * @param name {string}
   * @returns {Promise<stream.Writable>|stream.Writable}
   */
  async createFileStream(name) {
    throw new Error('Not implemented')
  }

  /**
   * @abstract
   * @return {Promise<boolean>}
   */
  async isValid() {
    throw new Error('Not implemented')
  }

  /**
   * @return {Promise<Record<string, string|number|boolean|(()=>string|number|boolean)|(()=>Promise<string|number|boolean>)>>}
   */
  async getTemplateArgs() {
    return {}
  }
}
