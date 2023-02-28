import {createCommand} from 'commander'
import {attachCommands} from './commands.mjs'

export async function createCli() {
  const cli = createCommand('backup-operator')
  await attachCommands(cli)

  return cli
}
