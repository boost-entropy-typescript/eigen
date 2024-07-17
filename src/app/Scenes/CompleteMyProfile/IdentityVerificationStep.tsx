import { Text, Screen, Button, Spacer, Flex, useSpace, CheckIcon } from "@artsy/palette-mobile"
import { IdentityVerificationStep_me$key } from "__generated__/IdentityVerificationStep_me.graphql"
import { Footer } from "app/Scenes/CompleteMyProfile/Footer"
import { useCompleteMyProfileSteps } from "app/Scenes/CompleteMyProfile/hooks/useCompleteMyProfileSteps"
import { useCompleteProfile } from "app/Scenes/CompleteMyProfile/hooks/useCompleteProfile"
import { useHandleIDVerification } from "app/Scenes/MyProfile/useHandleVerification"
import { navigate } from "app/system/navigation/navigate"
import { FC } from "react"
import { graphql, useFragment } from "react-relay"

export const IdentityVerificationStep: FC = () => {
  const space = useSpace()
  const { goNext, isCurrentRouteDirty, field, setField } = useCompleteProfile()
  const { me } = useCompleteMyProfileSteps()
  const data = useFragment<IdentityVerificationStep_me$key>(fragment, me)
  const { handleVerification } = useHandleIDVerification(data?.internalID ?? "")

  const handleSendVerification = () => {
    handleVerification()
    setField(true)
  }

  return (
    <Screen>
      <Screen.Body>
        <Flex flexGrow={100}>
          <Text variant="lg-display">Verify your ID</Text>

          <Spacer y={1} />

          <Flex gap={space(2)}>
            <Text color="black60">
              Send an ID verification email and follow the link and instructions to verify your
              account.
            </Text>

            {!field ? (
              <Button onPress={handleSendVerification}>Send verification Email</Button>
            ) : (
              <Button icon={<CheckIcon fill="white100" />} variant="fillSuccess">
                Email sent
              </Button>
            )}

            <Text color="black60">
              Identify Verification is required for some transactions. For more details, see our
              <Text
                style={{ textDecorationLine: "underline" }}
                onPress={() => navigate(`https://www.artsy.net/identity-verification-faq`)}
                suppressHighlighting
              >
                {` FAQs`}
              </Text>
              .
            </Text>
          </Flex>

          {!!field && (
            <Flex flex={1} justifyContent="flex-end">
              <Text color="white100" backgroundColor="green100" py={1} px={2}>
                ID verification email sent to {data?.email}.
              </Text>
            </Flex>
          )}
        </Flex>

        <Footer isFormDirty={isCurrentRouteDirty} onGoNext={goNext} />
      </Screen.Body>
    </Screen>
  )
}

const fragment = graphql`
  fragment IdentityVerificationStep_me on Me {
    internalID @required(action: NONE)
    email @required(action: NONE)
  }
`
