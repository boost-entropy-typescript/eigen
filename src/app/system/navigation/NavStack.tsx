import { findFocusedRoute, Route, useIsFocused, useNavigationState } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { AppModule, modules } from "app/AppRegistry"
import { useBottomTabBarHeight } from "app/Scenes/BottomTabs/useBottomTabBarHeight"
import { ArtsyKeyboardAvoidingViewContext } from "app/utils/ArtsyKeyboardAvoidingView"
import { ProvideScreenDimensions, useScreenDimensions } from "app/utils/hooks"
import { createContext, useState } from "react"
import { View } from "react-native"
import { isTablet } from "react-native-device-info"
import { BackButton } from "./BackButton"

const Stack = createNativeStackNavigator()

interface ScreenProps {
  moduleName: AppModule
  props?: object
  stackID: string
}

/**
 * ScreenWrapper renders a given app module as a screen in a NavStack. It is responsible for showing the back button
 * when the screen needs one.
 */
const ScreenWrapper: React.FC<{ route: Route<"", ScreenProps> }> = ({ route }) => {
  const module = modules[route.params.moduleName]

  const [legacy_shouldHideBackButton, updateShouldHideBackButton] = useState(false)

  const isRootScreen = useNavigationState((state) => state.routes[0].key === route.key)
  const showBackButton =
    !isRootScreen && !module.options.hidesBackButton && !legacy_shouldHideBackButton

  const isPresentedModally = (route.params.props as any)?.isPresentedModally

  const isVisible = useIsFocused()

  return (
    <LegacyBackButtonContext.Provider value={{ updateShouldHideBackButton }}>
      <ProvideScreenDimensions>
        <ArtsyKeyboardAvoidingViewContext.Provider
          value={{ isPresentedModally, isVisible, bottomOffset: 0 }}
        >
          <ScreenPadding
            isPresentedModally={isPresentedModally}
            isVisible={isVisible}
            fullBleed={!!module.options.fullBleed}
          >
            <module.Component {...route.params.props} isVisible={isVisible} />
            <BackButton show={showBackButton} />
          </ScreenPadding>
        </ArtsyKeyboardAvoidingViewContext.Provider>
      </ProvideScreenDimensions>
    </LegacyBackButtonContext.Provider>
  )
}

const ScreenPadding: React.FC<{
  fullBleed: boolean
  isPresentedModally: boolean
  isVisible: boolean
}> = ({ fullBleed, children }) => {
  const topInset = useScreenDimensions().safeAreaInsets.top
  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingTop: fullBleed ? 0 : topInset }}>
      {children}
    </View>
  )
}

/**
 * NavStack is a native navigation stack. Each tab in the main view has its own NavStack. Each modal that
 * is presented (excluding FancyModal) also has its own NavStack.
 */
export const NavStack: React.FC<{
  id: string
  rootModuleName: AppModule
  rootModuleProps?: any
}> = ({ id, rootModuleName, rootModuleProps }) => {
  const bottomTabBarHeight = useBottomTabBarHeight()
  const initialParams: ScreenProps = {
    moduleName: rootModuleName,
    props: rootModuleProps,
    stackID: id,
  }

  return (
    <Stack.Navigator
      screenOptions={(props) => {
        const focusedRoute = findFocusedRoute(props.navigation.getState())
        const params = focusedRoute?.params as any
        const isPresentedModally = params?.props?.isPresentedModally
        const module = modules[params.moduleName as AppModule]
        const options: any = {
          headerShown: false,
          contentStyle: {
            backgroundColor: "white",
            marginBottom: bottomTabBarHeight,
          },
          orientation: isTablet() ? "default" : "portrait",
        }

        if (isPresentedModally || module?.options?.hidesBottomTabs) {
          options.contentStyle.marginBottom = 0
        }

        return options
      }}
    >
      <Stack.Screen
        name={"screen:" + id}
        component={ScreenWrapper}
        initialParams={initialParams}
        options={(props) => {
          const focusedRoute = findFocusedRoute(props.navigation.getState())
          const params = focusedRoute?.params as any

          const screenOptions = modules[params.moduleName as AppModule]?.options?.screenOptions

          return { ...screenOptions }
        }}
      />
    </Stack.Navigator>
  )
}

export const LegacyBackButtonContext = createContext<{
  updateShouldHideBackButton(shouldHideBackButton: boolean): void
}>({
  updateShouldHideBackButton() {
    if (__DEV__) {
      console.error("no LegacyBackButtonContext in tree")
    }
  },
})
