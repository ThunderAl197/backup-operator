import {pipeLogsWithPrefix, spawnCliProcess} from '../../util.mjs'

const defaultPgDumpOptions = {
  format: 'c',
  compress: '9',
  create: true,
  'no-owner': true,
  clean: true,
  'if-exists': true,
}

/**
 * @param params {{additionalArgs?: Record<string, string|boolean>, env?: Record<string, string>, verbose?: boolean, host: string, host: string, port?: string|number, user: string, password: '!'|string, dbname: string, schema?: string}}
 * @return {Promise<{wait: Promise<void>, stream: Readable}>}
 */
export async function startPgDump(params) {
  const args = {...(params.additionalArgs), ...defaultPgDumpOptions}
  const options = {
    env: params.env || {},
  }

  if (params.verbose) {
    args.verbose = true
  }

  if (!params.host) {
    throw Error('Postgres dump: host is empty')
  }
  args.host = params.host

  args.port = params.port || 5432

  if (!params.user) {
    throw Error('Postgres dump: user is empty')
  }
  args.username = params.user

  if (!params.password) {
    throw Error('Postgres dump: password is empty. Use ! for no password')
  }
  if (params.password === '!') {
    args['-w'] = true
  } else {
    options.env.PGPASSWORD = params.password
  }

  if (!params.dbname) {
    throw Error('Postgres dump: dbmane is empty')
  }
  args.dbname = params.dbname

  if (params.schema) {
    args.schema = params.schema
  }

  const {wait, proc} = await spawnCliProcess('pg_dump', args, options)
  pipeLogsWithPrefix(proc.stderr, process.stdout, 'pg_dump')

  return {
    wait,
    stream: proc.stdout,
  }
}
