import process from 'node:process'
import {createCli} from './cli/index.mjs'

export async function start() {
  const cli = await createCli()
  await cli.parseAsync(process.argv)
}
