const path = require('path')
module.exports = {
  chainWebpack: (config) => {
    config.resolve.alias.set('@assets', path.resolve(__dirname, 'src/assets'))
    config.resolve.alias.set('@raxui', path.resolve(__dirname, 'src/index.ts'))
    config.resolve.alias.set(
      '@examples',
      path.resolve(__dirname, 'src/examples')
    )
  },
}
