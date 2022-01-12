module.exports = function(api) {
  const validEnv = ["development", "test", "production"]
  const currentEnv = api.env()
  const isDevelopmentEnv = api.env("development")
  const isProductionEnv = api.env("production")
  const isTestEnv = api.env("test")

  if (!validEnv.includes(currentEnv)) {
    throw new Error(
      "Please specify a valid `NODE_ENV` or " +
        "`BABEL_ENV` environment variables. Valid values are \"development\", " +
        "\"test\", and \"production\". Instead, received: " +
        JSON.stringify(currentEnv) +
        "."
    )
  }

  return {
    assumptions: {
      privateFieldsAsProperties: true,
      setPublicClassFields: true
    },
    presets: [
      isTestEnv && [
        "@babel/preset-env",
        {
          targets: {
            node: "current"
          }
        }
      ],
      (isProductionEnv || isDevelopmentEnv) && [
        "@babel/preset-env",
        {
          targets: {
            browsers: [ ">2%", "not ie 11"],
            node: "current"
          },
          forceAllTransforms: true,
          useBuiltIns: "entry",
          corejs: 3,
          modules: false,
          exclude: ["transform-typeof-symbol"]
        }
      ]
    ].filter(Boolean),
    plugins: [
      "babel-plugin-macros",
      "@babel/plugin-syntax-dynamic-import",
      isTestEnv && "babel-plugin-dynamic-import-node",
      "@babel/plugin-transform-destructuring",
      [
        "@babel/plugin-proposal-object-rest-spread",
        {
          useBuiltIns: true
        }
      ],
      [
        "@babel/plugin-transform-runtime",
        {
          helpers: false
        }
      ],
      [
        "@babel/plugin-transform-regenerator",
        {
          async: false
        }
      ]
    ].filter(Boolean)
  }
}
