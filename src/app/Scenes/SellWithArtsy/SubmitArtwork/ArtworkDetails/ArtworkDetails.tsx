import { BulletedItem, Spacer, Flex, LinkText } from "@artsy/palette-mobile"
import { CTAButton } from "app/Components/Button/CTAButton"
import { GlobalStore } from "app/store/GlobalStore"
import { navigate } from "app/system/navigation/navigate"
import { Formik } from "formik"
import React, { useState } from "react"
import { Alert } from "react-native"
import { ArtworkDetailsForm } from "./ArtworkDetailsForm"
import { ArtworkDetailsFormModel, artworkDetailsValidationSchema } from "./validation"

export const ArtworkDetails: React.FC<{
  handlePress: (formValues: ArtworkDetailsFormModel) => Promise<void>
  isLastStep: boolean
  scrollToTop?: () => void
}> = ({ handlePress, isLastStep, scrollToTop }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { artworkDetails } = GlobalStore.useAppState((state) => state.artworkSubmission.submission)

  return (
    <Flex flex={3} py={1} mt={1}>
      <BulletedItem>
        Currently, artists can not sell their own work on Artsy.{" "}
        <LinkText
          onPress={() =>
            navigate(
              "https://support.artsy.net/s/article/Im-an-artist-Can-I-submit-my-own-work-to-sell"
            )
          }
        >
          Learn more.
        </LinkText>
      </BulletedItem>
      <BulletedItem>All fields are required to submit an artwork.</BulletedItem>

      <Spacer y={4} />
      <Formik<ArtworkDetailsFormModel>
        initialValues={artworkDetails}
        onSubmit={handlePress}
        validationSchema={artworkDetailsValidationSchema}
        // Validate on blur only when injecting existing values from my collection
        validateOnMount={artworkDetails.myCollectionArtworkID ? true : false}
        validateOnBlur
        // react-native-testing-library does not trigger the validation on change
        // so we need to force it to validate on change in tests to make sure the validation works
        validateOnChange={__TEST__ ? true : false}
      >
        {({ values, isValid, dirty, validateForm }) => {
          return (
            <>
              <ArtworkDetailsForm />
              <Spacer y={2} />
              <CTAButton
                disabled={(!isValid && dirty) || isLoading}
                loading={isLoading}
                onPress={async () => {
                  try {
                    setIsLoading(true)
                    const errors = await validateForm()
                    if (Object.keys(errors).length === 0) {
                      await handlePress(values)
                    } else {
                      scrollToTop?.()
                    }
                  } catch (error) {
                    console.error(error)
                    Alert.alert("Could not save artwork details. Please try again.")
                  } finally {
                    setIsLoading(false)
                  }
                }}
                testID="Submission_ArtworkDetails_Button"
              >
                {isLastStep ? "Submit Artwork" : "Save & Continue"}
              </CTAButton>
            </>
          )
        }}
      </Formik>
    </Flex>
  )
}
