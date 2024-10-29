import * as Sentry from "@sentry/react-native"
import { HomeQueryRenderer } from "app/Scenes/Home/Home"
import { HomeViewScreen } from "app/Scenes/HomeView/HomeView"
import { Playground } from "app/Scenes/Playground/Playground"
import { GlobalStore } from "app/store/GlobalStore"
import { navigate } from "app/system/navigation/navigate"
import { useDevToggle } from "app/utils/hooks/useDevToggle"
import { useFeatureFlag } from "app/utils/hooks/useFeatureFlag"
import { useSwitchStatusBarStyle } from "app/utils/useStatusBarStyle"
import { useEffect } from "react"

export const InnerHomeContainer = () => {
  const artQuizState = GlobalStore.useAppState((state) => state.auth.onboardingArtQuizState)
  const isNavigationReady = GlobalStore.useAppState((state) => state.sessionState.isNavigationReady)
  const showPlayground = useDevToggle("DTShowPlayground")

  const enableDynamicHomeView = useFeatureFlag("AREnableDynamicHomeView")
  const preferLegacyHomeScreen = useFeatureFlag("ARPreferLegacyHomeScreen")

  const shouldDisplayNewHomeView = enableDynamicHomeView && !preferLegacyHomeScreen

  const navigateToArtQuiz = async () => {
    await navigate("/art-quiz")
  }

  useSwitchStatusBarStyle("dark-content", "dark-content")

  useEffect(() => {
    if (artQuizState === "incomplete" && isNavigationReady) {
      navigateToArtQuiz()
      return
    }
  }, [artQuizState, navigateToArtQuiz, isNavigationReady])

  if (artQuizState === "incomplete") {
    return null
  }

  if (showPlayground) {
    return <Playground />
  }

  if (shouldDisplayNewHomeView) {
    return <HomeViewScreen />
  } else {
    return <HomeQueryRenderer />
  }
}

export const HomeContainer = Sentry.withProfiler(InnerHomeContainer)
