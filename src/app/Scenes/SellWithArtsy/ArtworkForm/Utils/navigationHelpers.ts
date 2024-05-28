import { SubmitArtworkFormStore } from "app/Scenes/SellWithArtsy/ArtworkForm/Components/SubmitArtworkFormStore"
import {
  __unsafe__SubmissionArtworkFormNavigationRef,
  getCurrentRoute,
} from "app/Scenes/SellWithArtsy/ArtworkForm/SubmitArtworkForm"
import {
  ARTWORK_FORM_STEPS,
  SubmitArtworkScreen,
} from "app/Scenes/SellWithArtsy/ArtworkForm/Utils/constants"
import { updateMyCollectionArtwork } from "app/Scenes/SellWithArtsy/ArtworkForm/Utils/updateMyCollectionArtwork"
import { ArtworkDetailsFormModel } from "app/Scenes/SellWithArtsy/ArtworkForm/Utils/validation"
import { createOrUpdateSubmission } from "app/Scenes/SellWithArtsy/SubmitArtwork/ArtworkDetails/utils/createOrUpdateSubmission"
import { GlobalStore } from "app/store/GlobalStore"
import { goBack } from "app/system/navigation/navigate"
import { useFormikContext } from "formik"
import { Alert } from "react-native"

export const useSubmissionContext = () => {
  const setCurrentStep = SubmitArtworkFormStore.useStoreActions((actions) => actions.setCurrentStep)
  const setIsLoading = SubmitArtworkFormStore.useStoreActions((actions) => actions.setIsLoading)
  const { currentStep } = SubmitArtworkFormStore.useStoreState((state) => state)

  const { values, setFieldValue } = useFormikContext<ArtworkDetailsFormModel>()

  const navigateToNextStep = async (props?: {
    step?: SubmitArtworkScreen
    skipMutation?: boolean
  }) => {
    try {
      setIsLoading(true)

      const nextStep =
        props?.step || ARTWORK_FORM_STEPS[ARTWORK_FORM_STEPS.indexOf(currentStep as any) + 1]

      if (!nextStep) {
        console.error("No next step found")
        return
      }

      const newValues = {
        ...values,
        state: (currentStep === "AddDimensions"
          ? "SUBMITTED"
          : undefined) as ArtworkDetailsFormModel["state"],
      }

      if (!props?.skipMutation) {
        const submissionId = await createOrUpdateSubmission(newValues, values.submissionId)
        if (!values.submissionId && submissionId) {
          setFieldValue("submissionId", submissionId)
        }
      }

      if (newValues.state === "SUBMITTED") {
        // Reset saved draft if submission is successful
        GlobalStore.actions.artworkSubmission.setDraft(null)
        // Refetch associated My Collection artwork to display the updated submission status on the artwork screen.
        if (newValues.myCollectionArtworkID) {
          await updateMyCollectionArtwork({
            artworkID: newValues.myCollectionArtworkID,
          })
        }
      }

      __unsafe__SubmissionArtworkFormNavigationRef.current?.navigate?.(nextStep)
      setCurrentStep(nextStep)
    } catch (error) {
      console.error("Error navigating to next step", error)
      Alert.alert("Could not navigate to next step")
    } finally {
      setIsLoading(false)
    }
  }

  const navigateToPreviousStep = () => {
    if (!__unsafe__SubmissionArtworkFormNavigationRef.current?.canGoBack()) {
      return goBack()
    }
    // Order is important here to make sure getCurrentRoute returns the correct value
    __unsafe__SubmissionArtworkFormNavigationRef.current?.goBack?.()
    const previousStepId = getCurrentRoute()

    if (previousStepId) {
      setCurrentStep(previousStepId)
    }
  }

  return {
    navigateToNextStep,
    navigateToPreviousStep,
  }
}
