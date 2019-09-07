const config = {
  generateHTML: true,
  generateJSON: true,
}

const headers = {
  Cookie: 'token=xxxxx',
}

const urls = [
  {
    url: 'https://dev.to/',
    target: 'desktop',
  },
]

module.exports = {
  config,
  headers,
  urls,
}
