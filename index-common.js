global.__TEST__ = false
global.__STORYBOOK__ = false

// for more info about metaflags, look [here](/docs/metaflags.md)
let metaflags = {
  startStorybook: false,
}

try {
  const fileContent = require("./metaflags.json")
  startStorybook = fileContent.startStorybook
} catch {}

require("./src/app/errorReporting/sentrySetup").setupSentry({ environment: "bootstrap" })

if (metaflags.startStorybook) {
  global.__STORYBOOK__ = true
  require("./src/storybook")
} else {
  const appName = require("./app.json").appName
  require("react-native-gesture-handler")
  require("react-native-screens").enableScreens()
  const { AppRegistry } = require("react-native")
  const { App } = require("./src/app/App")
  AppRegistry.registerComponent(appName, () => App)
}
