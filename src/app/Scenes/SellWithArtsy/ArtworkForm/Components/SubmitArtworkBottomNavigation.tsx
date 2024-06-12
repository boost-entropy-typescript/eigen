import { Button, Flex, Spacer, Text, Touchable, useScreenDimensions } from "@artsy/palette-mobile"
import { SubmitArtworkFormStore } from "app/Scenes/SellWithArtsy/ArtworkForm/Components/SubmitArtworkFormStore"
import { useSubmissionContext } from "app/Scenes/SellWithArtsy/ArtworkForm/Utils/navigationHelpers"
import { ArtworkDetailsFormModel } from "app/Scenes/SellWithArtsy/ArtworkForm/Utils/validation"
import { useSubmitArtworkTracking } from "app/Scenes/SellWithArtsy/Hooks/useSubmitArtworkTracking"
import { Photo } from "app/Scenes/SellWithArtsy/SubmitArtwork/UploadPhotos/validation"
import { GlobalStore } from "app/store/GlobalStore"
import { dismissModal, navigate, popToRoot, switchTab } from "app/system/navigation/navigate"
import { useFeatureFlag } from "app/utils/hooks/useFeatureFlag"
import { useFormikContext } from "formik"
import { useEffect } from "react"
import { LayoutAnimation } from "react-native"

export const SubmitArtworkBottomNavigation: React.FC<{}> = () => {
  const {
    trackTappedSubmissionBack,
    trackTappedSubmitAnotherWork,
    trackTappedViewArtworkInMyCollection,
  } = useSubmitArtworkTracking()
  const { navigateToNextStep, navigateToPreviousStep, isFinalStep, isValid } =
    useSubmissionContext()
  const { values } = useFormikContext<ArtworkDetailsFormModel>()

  const { trackTappedNewSubmission, trackTappedStartMyCollection, trackConsignmentSubmitted } =
    useSubmitArtworkTracking()

  const isUploadingPhotos = values.photos.some((photo: Photo) => photo.loading)
  const allPhotosAreValid = values.photos.every(
    (photo: Photo) => !photo.error && !photo.errorMessage
  )
  const showStartFromMyCollection = useFeatureFlag("AREnableSubmitMyCollectionArtworkInSubmitFlow")

  const { isLoading, currentStep } = SubmitArtworkFormStore.useStoreState((state) => state)
  const { width: screenWidth } = useScreenDimensions()

  const handleBackPress = () => {
    trackTappedSubmissionBack(values.submissionId, currentStep)
    navigateToPreviousStep()
  }

  const handleNextPress = () => {
    if (isFinalStep) {
      trackConsignmentSubmitted(values.submissionId)
    }

    navigateToNextStep()
  }

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }, [currentStep])

  if (!currentStep || currentStep === "SelectArtist") {
    return null
  }

  if (currentStep === "StartFlow") {
    return (
      <Flex borderTopWidth={1} borderTopColor="black10" py={2} alignSelf="center" px={2}>
        <Button
          onPress={() => {
            trackTappedNewSubmission()
            navigateToNextStep({
              step: "SelectArtist",
            })
          }}
          block
        >
          Start New Submission
        </Button>
        {!!showStartFromMyCollection && (
          <Button
            onPress={() => {
              trackTappedStartMyCollection()
              // TODO: Navigate to My Collection artworks screen
              navigateToNextStep()
            }}
            block
            mt={2}
            variant="outline"
          >
            Start from My Collection
          </Button>
        )}
      </Flex>
    )
  }

  if (currentStep === "CompleteYourSubmission") {
    return (
      <Flex
        borderTopWidth={1}
        borderTopColor="black10"
        py={2}
        width={screenWidth}
        alignSelf="center"
      >
        <Flex px={2}>
          <Spacer y={1} />
          <Button
            block
            onPress={() => {
              trackTappedSubmitAnotherWork(values.submissionId)
              dismissModal(() => {
                navigate("/sell/submissions/new")
              })
            }}
          >
            Submit Another Work
          </Button>
          <Spacer y={2} />
          <Button
            block
            onPress={() => {
              trackTappedViewArtworkInMyCollection(values.submissionId)
              switchTab("profile")
              dismissModal()
              requestAnimationFrame(() => {
                popToRoot()
              })
            }}
            variant="outline"
          >
            View Artwork In My Collection
          </Button>
        </Flex>
      </Flex>
    )
  }

  if (currentStep === "ArtistRejected") {
    return (
      <Flex borderTopWidth={1} borderTopColor="black10" py={2} alignSelf="center">
        <Flex px={2}>
          <Spacer y={1} />

          <Button
            block
            onPress={() => {
              GlobalStore.actions.myCollection.artwork.setFormValues({
                artist: values.artist,
                artistSearchResult: values.artistSearchResult,
              })

              navigate("/my-collection/artworks/new", {
                showInTabName: "profile",
                replaceActiveModal: true,
              })
            }}
          >
            Add to My Collection
          </Button>

          <Spacer y={2} />

          <Button
            block
            onPress={() => {
              handleBackPress()
            }}
            variant="outline"
          >
            Add Another Artist
          </Button>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex borderTopWidth={1} borderTopColor="black10" py={2} width="100%" alignSelf="center">
      <Flex px={2}>
        <Flex flexDirection="row" justifyContent="space-between" backgroundColor="white100">
          <Flex flexDirection="row" alignItems="center">
            <Touchable onPress={handleBackPress}>
              <Text underline>Back</Text>
            </Touchable>
          </Flex>
          <Button
            onPress={handleNextPress}
            disabled={!isValid || isLoading || isUploadingPhotos || !allPhotosAreValid}
            loading={isLoading || isUploadingPhotos}
          >
            {isFinalStep ? "Submit Artwork" : "Continue"}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
}
