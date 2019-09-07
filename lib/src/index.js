const path = require('path')
const { getFileRC, runner } = require('./index-lib')

const filename = './.lighthouserc.js'
const realFilePath  = path.resolve(filename)

! async function main() {
  const {
    config = {},
    headers = {},
    urls = []
  } = await getFileRC(filename)

  const audits = await runner(config, urls, headers)
  console.log('audits', audits)
}()
