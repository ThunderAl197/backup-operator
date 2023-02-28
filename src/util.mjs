import {spawn} from 'node:child_process'

/**
 * @param obj {Object|Array}
 * @returns {Array<string>}
 */
export function argsFromObj(obj) {
  if (Array.isArray(obj)) {
    return obj
  }

  const args = []

  for (const key in obj) {
    const val = obj[key]

    const argKey = key.startsWith('-') ? key : `--${key}`

    if (val === true) {
      args.push(argKey)
      continue
    }

    args.push(`${argKey}=${val}`)
  }

  return args
}

/**
 * @param cmd {string}
 * @param args {Object|Array}
 * @param options {any}
 * @return {Promise<{proc: ChildProcessWithoutNullStreams, wait: Promise<unknown>}>}
 */
export async function spawnCliProcess(cmd, args, options = {}) {
  const procOptions = {
    stdio: 'pipe',
    ...options,
  }

  const procArgs = argsFromObj(args)

  console.debug(`Spawning ${cmd} ${procArgs.join(' ')}`)

  // noinspection JSCheckFunctionSignatures
  const proc = spawn(cmd, procArgs, procOptions)

  let procEnd = null
  let procEndErr = null
  const wait = new Promise((resolve, reject) => {
    procEnd = resolve
    procEndErr = reject
  })

  proc.on('exit', code => {
      if (code === 0) {
        procEnd()
      } else {
        procEndErr(new Error(`Process ${cmd} ends with ${code}`))
      }

      console.debug(`Process ${cmd} ends with ${code}`)
    },
  )

  return {
    proc,
    wait,
  }
}

/**
 * @param input {Readable}
 * @param output {{write: (data: any) => unknown}}
 * @param prefix {string}
 */
export function pipeLogsWithPrefix(input, output, prefix = '') {
  input.on('data', function (data) {
    if (prefix) {
      const lines = `${data}`.split(/\n|\r\n/ig)

      for (const line of lines) {
        if (!line) {
          continue
        }

        output.write(`[${prefix}] ${line}\n`)
      }

      return
    }

    const lines = `${data}`.replace(/\n|\r\n/ig, '\n')
    output.write(lines)
  })
}

/**
 * @param template {string}
 * @param params {Record<string, string|number|boolean|(()=>string|number|boolean)|(()=>Promise<string|number|boolean>)>}
 * @param opts {{escapePath: boolean}}
 * @returns {Promise<string>}
 */
export async function formatStringTemplate(template, params = {}, opts = {}) {
  const patterns = [...template.matchAll(/\[(?<part>[^\]]+)]/ig)].map(m => m.groups.part)

  let resultTemplate = template

  params = {
    date: () => (new Date()).toISOString().replace(/T.+$/i, ''),
    time: () => (new Date()).toISOString().replace(/^.+T|(?:\.\d+)?Z$/ig, ''),
    ...params,
  }

  for (const pattern of patterns) {
    if (!(pattern in params)) {
      throw new Error(`Pattern "${pattern}" does not exists in params for template "${template}"`)
    }

    let val = params[pattern]

    if (typeof val === 'function') {
      val = await val()
    }

    if (opts.escapePath) {
      val = escapeFilePathString(`${val}`, {escapeSlashes: true})
    }

    resultTemplate = resultTemplate.replace(`[${pattern}]`, `${val}`)
  }

  return resultTemplate
}

/**
 * @param str {string}
 * @param opts {{stub?: string, escapeSlashes?: boolean}}
 * @return {string}
 */
export function escapeFilePathString(str, opts = {}) {
  return str.replace(
    opts.escapeSlashes
      ? /[\\/?%*:|"<>]/g
      : /[?%*:|"<>]/g,
    opts.stub || '-',
  )
}


/**
 *
 * @param pipeStream
 * @return {Promise<void>}
 */
export async function awaitPipe(pipeStream) {
  return new Promise(function (resolve, reject) {
    hash.on('end', () => resolve(hash.read()))
    fd.on('error', reject) // or something like that. might need to close `hash`
  })
}
