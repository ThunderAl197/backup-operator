import {startOperator} from '../services/k8s-operator/index.mjs'
import {BackupJob} from '../services/backup/backup-job.mjs'
import {PostgresBackupSource} from '../sources/index.mjs'
import {LocalDirBackupDestination} from '../distanations/index.mjs'

/**
 * @param cli {Command}
 * @return {Promise<void>}
 */
export async function attachCommands(cli) {

  cli.command('operator-start')
    .description('Start operator process')
    .action(async () => startOperator())

  cli.command('db-dump')
    .description('Dump database')
    .requiredOption('--name <name>', 'Unique database server human readable name')
    .requiredOption('--host <host>', 'Postgres host')
    .option('--port <port>', 'Postgres port', '5432')
    .requiredOption('--dbname <dbname>', 'Postgres database')
    .option('--schema <schema>', 'Postgres database schema')
    .requiredOption('--user <user>', 'Postgres user')
    .requiredOption('--password <password>', 'Postgres password (use ! to disable password and run pg_dump with -w)')
    .option('--dir <dir>', 'Dir to store all data', './data')
    .action(async (opts) => {

      const source = new PostgresBackupSource(opts.name, {
        host: opts.host,
        user: opts.user,
        password: opts.password,
        dbname: opts.dbname,
        port: opts.port,
      })

      const destination = new LocalDirBackupDestination(opts.dir)

      const job = new BackupJob({source, destination})

      await job.isValid()
      await job.startBackup()
    })

}
