const { config, environment } = require("@rails/webpacker")

const WebpackerPwa = require("webpacker-pwa")

const globCssImporter = require("node-sass-glob-importer")
const svelte = require("./loaders/svelte")

new WebpackerPwa(config, environment)

environment.loaders.prepend("svelte", svelte)

environment.loaders.get("sass")
  .use
  .find(item => item.loader === "sass-loader")
  .options
  .sassOptions = { importer: globCssImporter() }

environment.loaders.append("webp-loader", {
  test: require.resolve("webp-loader"),
  use: [
    {
      loader: "webp-loader"
    }
  ]
})

module.exports = environment
