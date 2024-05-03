import {
  ActionType,
  ContextModule,
  OwnerType,
  TappedConsignArgs,
  TappedConsignmentInquiry,
} from "@artsy/cohesion"
import { Flex, Text, Button, Spacer, LinkText, useScreenDimensions } from "@artsy/palette-mobile"
import { Platform } from "react-native"

interface StickySWAHeaderProps {
  onConsignPress: (tappedConsignArgs: TappedConsignArgs) => void
  onInquiryPress: (inquiryTrackingArgs?: TappedConsignmentInquiry) => void
}

export const StickySWAHeader: React.FC<StickySWAHeaderProps> = ({
  onConsignPress,
  onInquiryPress,
}) => {
  const { bottom } = useScreenDimensions().safeAreaInsets

  const handleSubmitPress = (subject: string) => {
    onConsignPress(tracks.consignArgs(subject))
  }

  const handleInquiryPress = () => {
    onInquiryPress(tracks.consignmentInquiryTapped())
  }

  return (
    <>
      <Flex
        p={2}
        mb={`${bottom}px`}
        pb={Platform.OS === "android" ? 2 : 0}
        borderTopWidth={1}
        borderTopColor="black10"
      >
        <Button
          testID="header-consign-CTA"
          block
          onPress={() => {
            handleSubmitPress("Start Selling")
          }}
          variant="fillDark"
        >
          Start Selling
        </Button>

        <Spacer y={1} />

        <Text variant="xs" mb={1}>
          Not sure what you’re looking for?{" "}
          <LinkText testID="StickySWAHeader-inquiry-CTA" onPress={handleInquiryPress}>
            <Text variant="xs">Speak to an advisor</Text>
          </LinkText>
        </Text>
      </Flex>
    </>
  )
}

const tracks = {
  consignArgs: (subject: string): TappedConsignArgs => ({
    contextModule: ContextModule.sellHeader,
    contextScreenOwnerType: OwnerType.sell,
    subject,
  }),
  consignmentInquiryTapped: (): TappedConsignmentInquiry => ({
    action: ActionType.tappedConsignmentInquiry,
    context_module: ContextModule.sellHeader,
    context_screen: OwnerType.sell,
    context_screen_owner_type: OwnerType.sell,
    subject: "Get in Touch",
  }),
}
