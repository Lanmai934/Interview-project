const bodyParser = require('body-parser')

module.exports = {
  devServer: {
    port: 8080
  },
  configureWebpack: {
    experiments: {
      asyncWebAssembly: true
    },
    module: {
      rules: [
        {
          test: /\.wasm$/,
          type: "webassembly/async"
        }
      ]
    }
  }
} 