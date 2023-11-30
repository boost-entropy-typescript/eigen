const moduleResolverAlias = require("./alias").babelModuleResolverAlias

module.exports = (api) => {
  api.cache.forever() // don't call this babel config all the time if it hasn't changed.

  return {
    // plugins run first
    plugins: [
      "@babel/plugin-transform-named-capturing-groups-regex",
      "@babel/plugin-transform-flow-strip-types",
      ["@babel/plugin-proposal-decorators", { version: "legacy" }],
      ["@babel/plugin-transform-private-methods", { loose: true }], // needed for latest jest, must come after decorators
      ["@babel/plugin-transform-class-properties", { loose: true }], // must come after decorators
      [
        "transform-imports",
        {
          lodash: {
            transform: "lodash/${member}",
            preventFullImport: true,
          },
        },
      ],
      "import-graphql", // to enable import syntax for .graphql and .gql files.
      "relay",

      ["module-resolver", { alias: moduleResolverAlias }],
      "react-native-reanimated/plugin", // has to be listed last according to the documentation. https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation/#babel-plugin
    ],

    // presets run after
    presets: [
      [
        "module:metro-react-native-babel-preset",
        { useTransformReactJSXExperimental: true }, // this is so `import React from "react"` is not needed.
      ],
      // TODO: Remove this once we determine if its actually needed. Added during reanimated upgrade.
      // but then we determined that it was leading to errors with loading reanimated while remotely
      // debugging JS in chrome.
      // ["@babel/preset-env", { loose: true }],
      "@babel/preset-typescript",
      ["@babel/preset-react", { runtime: "automatic" }], // this is so `import React from "react"` is not needed.
    ],
  }
}
