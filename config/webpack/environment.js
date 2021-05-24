const { environment } = require("@rails/webpacker")

const globCssImporter = require("node-sass-glob-importer")

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
