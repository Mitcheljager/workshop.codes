const { sass } = require("svelte-preprocess-sass")

module.exports = {
  test: /\.svelte(\.erb)?$/,
  use: [{
    loader: 'svelte-loader',
    options: {
      hotReload: false,
      preprocess: {
        style: sass()
      },
      compilerOptions: {
        dev: process.env.NODE_ENV == 'development' ? true : false,
      },
      emitCss: true
    }
  }],
}
