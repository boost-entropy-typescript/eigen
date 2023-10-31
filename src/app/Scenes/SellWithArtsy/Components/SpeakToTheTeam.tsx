import { ActionType, ContextModule, OwnerType, TappedConsignmentInquiry } from "@artsy/cohesion"
import { Flex, Spacer, Text, useColor, Button } from "@artsy/palette-mobile"
import { Image } from "react-native"
import { isTablet } from "react-native-device-info"

export const SpeakToTheTeam: React.FC<{
  onInquiryPress: (inquiryArgs?: TappedConsignmentInquiry) => void
}> = ({ onInquiryPress }) => {
  const color = useColor()
  return (
    <Flex bg="black100" pt={2}>
      <Flex pt={1}>
        <Flex mx={2}>
          <Text variant="lg" color={color("white100")}>
            Interested in selling multiple artworks? {"\n"}
            Speak with our team.
          </Text>
          <Spacer y={4} />
          <Button
            testID="SpeakToTheTeam-inquiry-CTA"
            variant="outline"
            block
            onPress={() => {
              onInquiryPress(tracks.consignmentInquiryTapped())
            }}
          >
            Get in Touch
          </Button>
        </Flex>
        <Spacer y={4} />
        <Image
          source={
            isTablet()
              ? require("images/get-in-touch-banner-image-ipad.webp")
              : require("images/get-in-touch-banner-image.webp")
          }
          style={{
            width: "100%",
            height: isTablet() ? 500 : 180,
            alignSelf: "center",
          }}
          resizeMode={isTablet() ? "contain" : "cover"}
        />
      </Flex>
    </Flex>
  )
}

const tracks = {
  consignmentInquiryTapped: (): TappedConsignmentInquiry => ({
    action: ActionType.tappedConsignmentInquiry,
    context_module: ContextModule.sellSpeakToTheTeam,
    context_screen: OwnerType.sell,
    context_screen_owner_type: OwnerType.sell,
    subject: "Get in Touch",
  }),
}
