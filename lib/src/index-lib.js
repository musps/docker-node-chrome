const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const ReportGenerator = require('lighthouse/lighthouse-core/report/report-generator');

const INPUT_CONFIG = {
  extends: 'lighthouse:default',
};

const TARGET_TYPES = ['mobile', 'desktop', 'none']

const INPUT_FLAGS = {
  emulatedFormFactor: 'none', // desktop | mobile | none
  extraHeaders: {},
  chromeFlags: ['--headless', '--no-sandbox', '--no-zygote'],
  port: null,
};

function launchChromeAndRunLighthouse(url, opts, config = null) {
  return chromeLauncher.launch({ chromeFlags: opts.chromeFlags }).then(chrome => {
    opts.port = chrome.port;

    return lighthouse(url, opts, config).then(results => {
      // use results.lhr for the JS-consumeable output
      // https://github.com/GoogleChrome/lighthouse/blob/master/types/lhr.d.ts
      // use results.report for the HTML/JSON/CSV output as a string
      // use results.artifacts for the trace/screenshots/other specific case you need (rarer)
      return chrome.kill().then(() => results.lhr)
    });
  });
}

function parseConfig(config) {
  return {
    generateHTML: true,
    generateJSON: true,
    ...config,
  }
}

const getFileRC = function getFileRC(filePath) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, fs.F_OK, (err) => {
      if (err) {
        console.error(err)
        return reject(err)
      }

      const file = require(filePath)
      resolve(file)
    })
  })
}

const arrayToGenerator = function* arrayToGenerator(arr) {
  yield* arr
}

const task = async ({
  url = null,
  target = 'none',
  headers = {}
}, tmpConfig) => {
  if (!url) {
    throw ({ friendlyMessage: 'Url must be set' })
  }
  if (!TARGET_TYPES.includes(target)) {
    throw ({ friendlyMessage: 'Target should be one of [mobile, desktop, none]' })
  }

  INPUT_FLAGS.emulatedFormFactor = target
  INPUT_FLAGS.extraHeaders = headers

  const config = parseConfig(tmpConfig)

  return launchChromeAndRunLighthouse(url, INPUT_FLAGS, INPUT_CONFIG)
    .then((report) => {
      const { categories } = report
      const basePath = './reports'
      let htmlPath = `${basePath}/report-${target}-${Date.now()}.html`
      let jsonPath = `${basePath}/report-${target}-${Date.now()}.json`

      if (config.generateHTML) {
        const html = ReportGenerator.generateReport(report, 'html')
        fs.mkdir(basePath, { recursive: true }, (err) => {
          fs.writeFileSync(htmlPath, html)
        });
      } else {
        htmlPath = null
      }

      if (config.generateJSON) {
        const json = ReportGenerator.generateReport(report, 'json')
        fs.mkdir(basePath, { recursive: true }, (err) => {
          fs.writeFileSync(jsonPath, json)
        });
      } else {
        jsonPath = null
      }

      const scores = {}
      Object.keys(categories).map(category => {
        const score = categories[category].score * 100
        scores[category] = score
        return { category, score }
      });

      return {
        url,
        target,
        html: {
          path: htmlPath,
        },
        json: {
          path: jsonPath
        },
        scores,
      }
    })
}

const runner = async (config, urls, headers) => {
  let audit
  const auditsGen = arrayToGenerator(urls)
  const results = []
  const pushResult = (result) => {
    console.log('pushResult', result)
    results.push(result)
  }

  const runTask = async () => {
    const { value, done } = auditsGen.next()
    if (typeof value === 'undefined') {
      return
    }

    const res = await task(value, config)
    pushResult(res)
    await runTask()
  }

  await runTask()
  return results
}

module.exports = {
  getFileRC,
  task,
  runner,
  TARGET_TYPES,
}


































