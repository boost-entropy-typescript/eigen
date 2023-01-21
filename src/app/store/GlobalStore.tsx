import { useNavigationState } from "@react-navigation/native"
import { __unsafe_mainModalStackRef } from "app/NativeModules/ARScreenPresenterModule"
import { ArtsyNativeModule } from "app/NativeModules/ArtsyNativeModule"
import { BottomTabType } from "app/Scenes/BottomTabs/BottomTabType"
import { switchTab } from "app/system/navigation/navigate"
import { loadDevNavigationStateCache } from "app/system/navigation/useReloadedDevNavigationState"
import { logAction } from "app/utils/loggers"
import { createStore, createTypedHooks, StoreProvider } from "easy-peasy"
import { Platform } from "react-native"
import DeviceInfo from "react-native-device-info"
import { Action, Middleware } from "redux"
import { version } from "./../../../app.json"
import { getGlobalStoreModel, GlobalStoreModel, GlobalStoreState } from "./GlobalStoreModel"
import { FeatureMap } from "./config/FeaturesModel"
import { DevToggleName, FeatureName, features } from "./config/features"
import { VisualClueName, visualClueNames } from "./config/visualClues"
import { persistenceMiddleware, unpersist } from "./persistence"

function createGlobalStore() {
  const middleware: Middleware[] = []

  if (!__TEST__) {
    middleware.push(persistenceMiddleware)
  }

  if (__DEV__ && !__TEST__) {
    const reduxInFlipper = require("redux-flipper").default
    middleware.push(reduxInFlipper())
  }

  // At dev time but not test time, let's log out each action that is dispatched
  if (__DEV__ && !__TEST__) {
    middleware.push((_api) => (next) => (_action) => {
      if (logAction) {
        console.log(`ACTION ${_action.type}`, _action)
      }
      next(_action)
    })
  }

  // At test time let's keep a log of all dispatched actions so that tests can make assertions based on what
  // has been dispatched
  if (__TEST__ && __globalStoreTestUtils__) {
    __globalStoreTestUtils__.dispatchedActions = []
    middleware.push((_api) => (next) => (_action) => {
      __globalStoreTestUtils__.dispatchedActions.push(_action)
      next(_action)
    })
  }

  const store = createStore(getGlobalStoreModel(), {
    middleware,
  })

  if (!__TEST__) {
    unpersist().then(async (state) => {
      await loadDevNavigationStateCache(switchTab)
      store.getActions().rehydrate(state)
    })
  }

  return store
}

export const __globalStoreTestUtils__ = __TEST__
  ? {
      // this can be used to mock the initial state before mounting a test renderer
      // e.g. `__globalStoreTestUtils__?.injectState({ nativeState: { selectedTab: "sell" } })`
      // takes effect until the next test starts
      injectState: (state: DeepPartial<GlobalStoreState>) => {
        GlobalStore.actions.__inject(state)
      },
      setProductionMode() {
        this.injectState({ devicePrefs: { environment: { env: "production" } } })
      },
      injectFeatureFlags(options: Partial<FeatureMap>) {
        this.injectState({ artsyPrefs: { features: { localOverrides: options } } })
      },
      getCurrentState: () => globalStoreInstance().getState(),
      dispatchedActions: [] as Action[],
      getLastAction() {
        return this.dispatchedActions[this.dispatchedActions.length - 1]
      },
      reset: () => {
        _globalStoreInstance = undefined
      },
    }
  : undefined

if (__TEST__) {
  beforeEach(() => {
    __globalStoreTestUtils__?.reset()
  })
}

const hooks = createTypedHooks<GlobalStoreModel>()

export const GlobalStore = {
  useAppState: hooks.useStoreState,
  get actions() {
    return globalStoreInstance().getActions()
  },
}

export const GlobalStoreProvider: React.FC<{}> = ({ children }) => {
  return <StoreProvider store={globalStoreInstance()}>{children}</StoreProvider>
}

export function useSelectedTab(): BottomTabType {
  const tabState = useNavigationState(
    (state) => state.routes.find((r) => r.state?.type === "tab")?.state
  )
  if (!tabState) {
    return "home"
  } else {
    const { index, routes } = tabState
    return routes[index!].name as BottomTabType
  }
}

let _globalStoreInstance: ReturnType<typeof createGlobalStore> | undefined
const globalStoreInstance = (): ReturnType<typeof createGlobalStore> => {
  if (_globalStoreInstance === undefined) {
    _globalStoreInstance = createGlobalStore()
  }
  return _globalStoreInstance
}

export function useFeatureFlag(key: FeatureName) {
  return GlobalStore.useAppState((state) => state.artsyPrefs.features.flags[key])
}

export function useDevToggle(key: DevToggleName) {
  return GlobalStore.useAppState((state) => state.artsyPrefs.features.devToggles[key])
}

/**
 * This is marked as unsafe because it will not cause a re-render
 * if used in a react component. Use `useFeatureFlag` instead.
 * It is safe to use in contexts that don't require reactivity.
 */
export function unsafe_getFeatureFlag(key: FeatureName): boolean {
  const state = globalStoreInstance().getState() ?? null
  if (state) {
    return state.artsyPrefs.features.flags[key]
  }
  if (__DEV__) {
    throw new Error(`Unable to access ${key} before GlobalStore bootstraps`)
  }
  return features[key].readyForRelease
}

/**
 * This is marked as unsafe because it will not cause a re-render
 * if used in a react component. Use `useLocalizedUnit` instead.
 * It is safe to use in contexts that don't require reactivity.
 */
export function unsafe_getLocalizedUnit() {
  const state = globalStoreInstance().getState()
  if (state) {
    return state.userPrefs.metric
  }
  if (__DEV__) {
    throw new Error(`Unable to access metric before GlobalStore bootstraps`)
  }
}

export function unsafe_getDevToggle(key: DevToggleName) {
  const state = globalStoreInstance().getState() ?? null
  if (state) {
    return state.artsyPrefs.features.devToggles[key]
  }
  if (__DEV__) {
    throw new Error(`Unable to access ${key} before GlobalStore bootstraps`)
  }
  return false
}

export const useVisualClue = () => {
  const seenVisualClues = GlobalStore.useAppState((state) => state.visualClue.seenVisualClues)
  const sessionVisualClues = GlobalStore.useAppState((state) => state.visualClue.sessionState.clues)

  const showVisualClue = (clueName?: VisualClueName | string): boolean => {
    if (!clueName) {
      return false
    }

    if (visualClueNames.includes(clueName)) {
      return !seenVisualClues.includes(clueName)
    }
    return sessionVisualClues.includes(clueName)
  }

  return { seenVisualClues, showVisualClue }
}

export const addClue = GlobalStore.actions.visualClue.addClue

export const setVisualClueAsSeen = GlobalStore.actions.visualClue.setVisualClueAsSeen

export function unsafe_getUserAccessToken() {
  const state = globalStoreInstance().getState() ?? null
  if (state) {
    return state.auth.userAccessToken
  }
  if (__DEV__) {
    throw new Error(`Unable to access userAccessToken before GlobalStore bootstraps`)
  }
  return null
}

export function unsafe_getUserEmail() {
  const state = globalStoreInstance().getState() ?? null
  if (state) {
    return state.auth.userEmail
  }
  if (__DEV__) {
    throw new Error(`Unable to retrieve user email`)
  }
  return null
}

export function getCurrentEmissionState() {
  const state = globalStoreInstance().getState() ?? null

  // `getUserAgentSync` breaks the Chrome Debugger, so we use a string instead.
  const userAgent = `${
    __DEV__ ? "Artsy-Mobile " + Platform.OS : DeviceInfo.getUserAgentSync()
  } Artsy-Mobile/${version} Eigen/${DeviceInfo.getBuildNumber()}/${version}`

  const data: GlobalStoreModel["native"]["sessionState"] = {
    authenticationToken: state?.auth.userAccessToken || "",
    launchCount: ArtsyNativeModule.launchCount,
    userAgent,
    userID: state?.auth.userID!,
    userEmail: "user@example.com", // not used on android
  }
  return data
}

/**
 * This is safe, but is marked unsafe because it should not be used within react components since it does not cause re-renders.
 * Use `useSelectedTab` in react components, and use this in rare cases where you need to know the current tab outside of
 * react components.
 */
export function unsafe__getSelectedTab(): BottomTabType {
  const tabState = __unsafe_mainModalStackRef.current
    ?.getRootState()
    .routes.find((r) => r.state?.type === "tab")?.state
  if (!tabState) {
    return "home"
  } else {
    const { index, routes } = tabState
    return routes[index!].name as BottomTabType
  }
}

export function useIsStaging() {
  return GlobalStore.useAppState((state) => state.devicePrefs.environment.env === "staging")
}

/**
 * This is marked as unsafe because it will not cause a re-render
 * if used during a react component's render. Use `useEnvironment` instead.
 * This is safe to use in contexts that don't require reactivity, e.g. onPress handlers.
 */
export function unsafe__getEnvironment() {
  const {
    echo: { stripePublishableKey },
    userIsDev: { value },
  } = globalStoreInstance().getState().artsyPrefs
  const {
    environment: { env, strings },
  } = globalStoreInstance().getState().devicePrefs
  return { ...strings, stripePublishableKey, env, userIsDev: value }
}

export function useEnvironment() {
  const {
    echo: { stripePublishableKey },
  } = GlobalStore.useAppState((state) => state.artsyPrefs)
  const {
    environment: { env, strings },
  } = GlobalStore.useAppState((state) => state.devicePrefs)
  return { ...strings, stripePublishableKey, env }
}
