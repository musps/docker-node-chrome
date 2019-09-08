const Listr = require('listr')
const path = require('path')
const lib = require('./index-lib')

const filename = '.lighthouserc.js'
const realFilePath  = path.resolve(filename)

! async function main() {
  const data = await lib
    .getFileRC(realFilePath)
    .catch(errorMessage => {
      return {
        config: {},
        headers: {},
        urls: [],
        error: true,
        errorMessage,
      }
    })
  const tasks = []

  tasks.push({
    title: 'Checkout .lighthouserc.js',
    task: () => {
      if (data.error) {
        return Promise.reject(new Error(data.errorMessage))
      }
      return Promise.resolve(true)
    }
  })

  data.urls.map((url) => {
    const task = {
      // Task config.
      url: null,
      target: [],
      skipState: false,
      skipTitle: 'skipped',
      // listr object.
      title: null,
      skip: () => task.skipState ? task.skipTitle : false,
    }

    const typeofUrl = typeof url

    if (!['string', 'object'].includes(typeofUrl)) {
      task.skipState = true
    }

    // Add url.
    // Todo: check url.url.
    task.url = typeofUrl === 'string' ? url : (url.url || null)

    if (!task.url) {
      task.skipTitle = 'The URL you have provided appears to be invalid.'
    }

    // Add target.
    task.target =  data.config.target || []

    if (typeofUrl === 'object' && url.target) {
      if (typeof url.target === 'string' && lib.TARGET_TYPES.includes(url.target)) {
        task.target = [url.target]
      } else if (typeof url.target === 'object') {
        task.target = []
        url.target.map(t => {
          if (lib.TARGET_TYPES.includes(t)) {
            task.target.push(t)
          } else {
            task.skipState = true
            task.skipTitle = 'Target should be one of [...]'
          }
        })
      } else {
        task.skipState = true
        task.skipTitle = 'Target should be one of [...]'
      }
    }

    task.target.map(target => tasks.push({
      ...task,
      title: `[audit] [${target}] ${task.url}`,
      target,
      task: (c, v) => {
        return lib.
          task({
            url: task.url,
            target: target,
            headers: data.headers,
          }, data.config)
          .then(res => null)
          .catch(e => {
            v.skip(e.friendlyMessage || 'skipped')
          })
      }
    }))
  })

  const setup = new Listr(tasks)
  setup
    .run()
    .then(() => process.exit(0))
    .catch(() => process.exit(0))
}().catch(e => console.log('Error main', e))
