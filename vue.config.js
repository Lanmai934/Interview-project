const bodyParser = require('body-parser')

module.exports = {
  devServer: {
    port: 8080
  },
  // Ensure Univer packages are transpiled by Babel/webpack
  transpileDependencies: [
    '@univerjs'
  ],
  configureWebpack: {
    experiments: {
      asyncWebAssembly: true
    },
    module: {
      rules: [
        {
          test: /\.wasm$/,
          type: 'webassembly/async'
        }
      ]
    }
  }
}