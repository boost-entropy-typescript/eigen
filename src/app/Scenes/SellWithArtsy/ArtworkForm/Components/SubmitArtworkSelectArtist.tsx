import { Flex, Spacer, Text } from "@artsy/palette-mobile"
import { AutosuggestResult } from "app/Components/AutosuggestResults/AutosuggestResults"
import { AutosuggestResultsPlaceholder } from "app/Components/AutosuggestResults/AutosuggestResultsPlaceholder"
import { ArtistAutosuggest } from "app/Scenes/MyCollection/Screens/ArtworkForm/Components/ArtistAutosuggest"
import { SubmitArtworkFormStore } from "app/Scenes/SellWithArtsy/ArtworkForm/Components/SubmitArtworkFormStore"
import { useSubmissionContext } from "app/Scenes/SellWithArtsy/ArtworkForm/Utils/navigationHelpers"
import { ArtworkDetailsFormModel } from "app/Scenes/SellWithArtsy/ArtworkForm/Utils/validation"
import { createOrUpdateSubmission } from "app/Scenes/SellWithArtsy/SubmitArtwork/ArtworkDetails/utils/createOrUpdateSubmission"
import { PlaceholderBox, PlaceholderText, ProvidePlaceholderContext } from "app/utils/placeholders"
import { useFormikContext } from "formik"
import { Suspense } from "react"

export const SubmitArtworkSelectArtist = () => {
  const { navigateToNextStep } = useSubmissionContext()
  const setIsLoading = SubmitArtworkFormStore.useStoreActions((actions) => actions.setIsLoading)

  const formik = useFormikContext<ArtworkDetailsFormModel>()

  const handleResultPress = async (result: AutosuggestResult) => {
    setIsLoading(true)

    formik.setFieldValue("artistSearchResult", result)
    formik.setFieldValue("artist", result.displayLabel)
    formik.setFieldValue("artistId", result.internalID)

    if (!result.internalID) {
      console.error("Artist ID not found")
      return
    }

    const updatedValues = {
      artistId: result.internalID,
      artist: result.displayLabel,
      artistSearchResult: result,
      userPhone: formik.values.userPhone,
      userEmail: formik.values.userEmail,
      userName: formik.values.userName,
    }

    try {
      // TODO: Does it make sense to create a new submission here?
      // We might end up with a lot of submissions that are never completed
      const submissionId = await createOrUpdateSubmission(updatedValues, formik.values.submissionId)
      formik.setFieldValue("submissionId", submissionId)
      navigateToNextStep()
    } catch (error) {
      console.error("Error creating submission", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Flex>
      <Text variant="lg" mb={2}>
        Add artist name
      </Text>

      <Suspense fallback={<Placeholder />}>
        <ArtistAutosuggest onResultPress={handleResultPress} disableCustomArtists onlyP1Artists />
      </Suspense>
    </Flex>
  )
}

const Placeholder: React.FC = () => (
  <ProvidePlaceholderContext>
    <PlaceholderBox height={50} />
    <Spacer y={2} />
    <PlaceholderText width={250} />
    <Spacer y={4} />
    <PlaceholderText width={180} />
    <Spacer y={2} />
    <AutosuggestResultsPlaceholder />
  </ProvidePlaceholderContext>
)
