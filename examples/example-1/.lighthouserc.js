const config = {
  generateHTML: true,
  generateJSON: true,
  target: ['desktop', 'mobile'],
  exitOnError: false,
}

const headers = {
  Cookie: 'token=xxxxx',
}

const urls = [
  10,
  {
    url: 'https://sercan.site/',
  },
  {
    url: 'https://dev.to/t/webdev',
    target: ['mobile'],
  },
]

module.exports = {
  config,
  headers,
  urls,
}
