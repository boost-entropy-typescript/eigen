import { BackButton, Flex, Text, Touchable } from "@artsy/palette-mobile"
import { SubmitArtworkFormStore } from "app/Scenes/SellWithArtsy/ArtworkForm/Components/SubmitArtworkFormStore"
import { SubmitArtworkProgressBar } from "app/Scenes/SellWithArtsy/ArtworkForm/Components/SubmitArtworkProgressBar"
import { ArtworkDetailsFormModel } from "app/Scenes/SellWithArtsy/ArtworkForm/Utils/validation"
import { createOrUpdateSubmission } from "app/Scenes/SellWithArtsy/SubmitArtwork/ArtworkDetails/utils/createOrUpdateSubmission"
import { GlobalStore } from "app/store/GlobalStore"
import { goBack } from "app/system/navigation/navigate"
import { useFeatureFlag } from "app/utils/hooks/useFeatureFlag"
import { refreshSellScreen } from "app/utils/refreshHelpers"
import { useFormikContext } from "formik"
import { useEffect } from "react"
import { Alert, Keyboard, LayoutAnimation } from "react-native"

const HEADER_HEIGHT = 50

export const SubmitArtworkTopNavigation: React.FC<{}> = () => {
  const enableSaveAndExit = useFeatureFlag("AREnableSaveAndContinueSubmission")
  const currentStep = SubmitArtworkFormStore.useStoreState((state) => state.currentStep)
  const hasCompletedForm = currentStep === "CompleteYourSubmission"

  const { values } = useFormikContext<ArtworkDetailsFormModel>()

  const handleSaveAndExitPress = async () => {
    Keyboard.dismiss()
    if (!enableSaveAndExit) {
      if (hasCompletedForm) {
        goBack()
        return
      }

      Alert.alert(
        "Are you sure you want to exit?",
        "Your artwork will not be submitted.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: () => goBack(),
            style: "destructive",
          },
        ],
        { cancelable: true }
      )
      return
    }

    if (hasCompletedForm) {
      // Reset form if user is on the last step
      // This is to ensure that the user can start a new submission
      // This is not required but is a nice to have as a second layer of protection
      GlobalStore.actions.artworkSubmission.setDraft(null)
      return goBack()
    }

    try {
      const submissionId = await createOrUpdateSubmission(values, values.submissionId)

      if (submissionId) {
        GlobalStore.actions.artworkSubmission.setDraft({
          submissionID: submissionId,
          currentStep,
        })
      }

      refreshSellScreen()
    } catch (error) {
      console.error("Something went wrong. The submission could not be saved.", error)

      Alert.alert("Something went wrong. The submission could not be saved.")
    }

    goBack()
  }

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }, [currentStep])

  if (!currentStep) {
    return null
  }

  const showXButton = ["StartFlow", "ArtistRejected", "SelectArtist"].includes(currentStep)
  const showProgressBar = !["StartFlow", "ArtistRejected"].includes(currentStep)
  const showSaveAndExit = !["StartFlow", "ArtistRejected", "SelectArtist"].includes(currentStep)

  return (
    <Flex mx={2} mb={1} height={HEADER_HEIGHT}>
      <Flex flexDirection="row" justifyContent="space-between" height={30} mb={1}>
        {!!showXButton && (
          <BackButton showX style={{ zIndex: 100, overflow: "visible" }} onPress={goBack} />
        )}
        {!!showSaveAndExit && (
          <Flex style={{ flexGrow: 1, alignItems: "flex-end" }} mb={0.5}>
            <Touchable onPress={handleSaveAndExitPress}>
              <Text>{!hasCompletedForm && !!enableSaveAndExit ? "Save & " : ""}Exit</Text>
            </Touchable>
          </Flex>
        )}
      </Flex>
      {!!showProgressBar && <SubmitArtworkProgressBar />}
    </Flex>
  )
}
