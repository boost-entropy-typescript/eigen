import {
  ActionType,
  OwnerType,
  SearchedReverseImageWithNoResults,
  SearchedReverseImageWithResults,
} from "@artsy/cohesion"
import { Flex } from "@artsy/palette-mobile"
import { CommonActions } from "@react-navigation/native"
import { StackScreenProps } from "@react-navigation/stack"
import { captureMessage } from "@sentry/react-native"
import { Background } from "app/Scenes/ReverseImage/Components/Background"
import { CameraFramesContainer } from "app/Scenes/ReverseImage/Components/CameraFramesContainer"
import { HeaderBackButton } from "app/Scenes/ReverseImage/Components/HeaderBackButton"
import { HeaderContainer } from "app/Scenes/ReverseImage/Components/HeaderContainer"
import { HeaderTitle } from "app/Scenes/ReverseImage/Components/HeaderTitle"
import { useReverseImageContext } from "app/Scenes/ReverseImage/ReverseImageContext"
import { CAMERA_BUTTONS_HEIGHT } from "app/Scenes/ReverseImage/Screens/Camera/Components/CameraButtons"
import { ReverseImageNavigationStack, ReverseImageOwner } from "app/Scenes/ReverseImage/types"
import { navigate } from "app/system/navigation/navigate"
import { nextTick } from "app/utils/nextTick"
import { useImageSearch } from "app/utils/useImageSearch"
import { compact } from "lodash"
import { useEffect, useRef } from "react"
import { Alert, Image, StyleSheet } from "react-native"
import { useTracking } from "react-tracking"

type Props = StackScreenProps<ReverseImageNavigationStack, "Preview">

export const ReverseImagePreviewScreen: React.FC<Props> = (props) => {
  const { navigation, route } = props
  const { photo } = route.params
  const tracking = useTracking()
  const didUnmounted = useRef(false)
  const { analytics } = useReverseImageContext()
  const { handleSearchByImage } = useImageSearch()
  const { owner } = analytics

  const handleGoBack = () => {
    navigation.goBack()
  }

  useEffect(() => {
    return () => {
      didUnmounted.current = true
    }
  }, [])

  const handleSearch = async () => {
    try {
      const results = await handleSearchByImage(photo)

      // ignore results if component was unmounted
      if (didUnmounted.current) {
        return
      }

      if (results.length === 0) {
        tracking.trackEvent(tracks.withNoResults(owner))
        return navigation.replace("ArtworkNotFound", {
          photoPath: photo.path,
        })
      }

      const artworkIDs = compact(results.map((result) => result?.artwork?.internalID))
      tracking.trackEvent(tracks.withResults(owner, artworkIDs))

      if (results.length === 1) {
        await navigate(`/artwork/${artworkIDs[0]}`)
        await nextTick()

        // Navigate to the camera screen **without** animation
        return navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Camera" }],
          })
        )
      }

      navigation.replace("MultipleResults", {
        photoPath: photo.path,
        artworkIDs,
      })
    } catch (error) {
      // silently ignore error if component was unmounted
      if (didUnmounted.current) {
        return
      }

      if (__DEV__) {
        console.error(error)
      } else {
        captureMessage((error as Error).stack!)
      }

      Alert.alert(
        "Something went wrong.",
        "Sorry, we couldn't process the request. Please try again or contact support@artsy.net for help.",
        [
          {
            text: "Retry",
            onPress: () => {
              navigation.goBack()
            },
          },
        ]
      )
    }
  }

  useEffect(() => {
    handleSearch()
  }, [])

  return (
    <Flex bg="black100" flex={1}>
      <Image
        source={{ uri: photo.path }}
        style={StyleSheet.absoluteFill}
        resizeMode={photo.fromLibrary ? "contain" : "cover"}
      />

      <Flex {...StyleSheet.absoluteFillObject}>
        <Background>
          <HeaderContainer>
            <HeaderBackButton onPress={handleGoBack} />
            <HeaderTitle title="Looking for Results..." />
          </HeaderContainer>
        </Background>

        {!photo.fromLibrary && (
          <>
            <CameraFramesContainer />
            <Background height={CAMERA_BUTTONS_HEIGHT} />
          </>
        )}
      </Flex>
    </Flex>
  )
}

const tracks = {
  withNoResults: (owner: ReverseImageOwner): SearchedReverseImageWithNoResults => ({
    action: ActionType.searchedReverseImageWithNoResults,
    context_screen_owner_type: OwnerType.reverseImageSearch,
    owner_type: owner.type,
    owner_id: owner.id,
    owner_slug: owner.slug,
  }),
  withResults: (owner: ReverseImageOwner, results: string[]): SearchedReverseImageWithResults => ({
    action: ActionType.searchedReverseImageWithResults,
    context_screen_owner_type: OwnerType.reverseImageSearch,
    owner_type: owner.type,
    owner_id: owner.id,
    owner_slug: owner.slug,
    total_matches_count: results.length,
    artwork_ids: results.join(","),
  }),
}
