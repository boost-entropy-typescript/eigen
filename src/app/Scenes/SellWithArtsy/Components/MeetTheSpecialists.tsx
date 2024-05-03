import { ActionType, ContextModule, OwnerType, TappedConsignmentInquiry } from "@artsy/cohesion"
import { Flex, Spacer, Text, useColor, useSpace, Button } from "@artsy/palette-mobile"
import { useExtraLargeWidth } from "app/Components/ArtworkRail/useExtraLargeWidth"
import { ReadMore } from "app/Components/ReadMore"
import {
  SpecialistsData,
  useSWALandingPageData,
} from "app/Scenes/SellWithArtsy/utils/useSWALandingPageData"
import { AnimateHeight } from "app/utils/animations/AnimateHeight"
import { PlaceholderBox, PlaceholderButton, PlaceholderText } from "app/utils/placeholders"
import { MotiView } from "moti"
import { useState } from "react"
import { FlatList, ImageBackground } from "react-native"
import { isTablet } from "react-native-device-info"
import LinearGradient from "react-native-linear-gradient"
import { Easing } from "react-native-reanimated"

type InqueryPress = (
  trackingargs?: TappedConsignmentInquiry,
  recipientEmail?: string,
  recipientName?: string
) => void

export const MeetTheSpecialists: React.FC<{
  onInquiryPress: InqueryPress
}> = ({ onInquiryPress }) => {
  const space = useSpace()

  const {
    data: { specialists },
    loading,
  } = useSWALandingPageData()

  if (loading) {
    return <LoadingSkeleton />
  }

  if (!specialists) {
    return null
  }

  return (
    <Flex>
      <Text variant="lg-display" mx={2} mb={1}>
        Meet the specialists
      </Text>
      <Text variant="xs" mb={2} mx={2}>
        Our specialists span today’s most popular collecting categories.
      </Text>
      <Spacer y={2} />
      <FlatList
        contentContainerStyle={{ marginLeft: space(2) }}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={specialists}
        renderItem={({ item }) => {
          return <Specialist specialist={item} onInquiryPress={onInquiryPress} />
        }}
        keyExtractor={(item) => item.name}
        ListFooterComponent={() => <Spacer x={4} />}
      />
      <Flex mx={2} mt={2}>
        <Text variant="md" mb={2}>
          Not sure who’s the right fit for your collection? Get in touch and we’ll connect you.
        </Text>

        <Button
          testID="MeetTheSpecialists-inquiry-CTA"
          block
          onPress={() => {
            onInquiryPress(tracks.consignmentInquiryTapped("Get in Touch"))
          }}
        >
          Get in Touch
        </Button>
      </Flex>
    </Flex>
  )
}

interface SpecialistProps {
  specialist: SpecialistsData
  onInquiryPress: InqueryPress
}

const Specialist: React.FC<SpecialistProps> = ({ specialist, onInquiryPress }) => {
  const color = useColor()
  const space = useSpace()
  const bioTextLimit = isTablet() ? 160 : 88

  const buttonText = `Contact ${specialist.firstName}`

  const imgHeightToWidthRatio = 1.511 // based on designs
  const imgWidth = useExtraLargeWidth()
  const imgHeight = imgWidth * imgHeightToWidthRatio

  const [isBioExpanded, setIsBioExpanded] = useState(false)

  return (
    <ImageBackground
      source={{ uri: specialist.image }}
      resizeMode="cover"
      style={{
        width: imgWidth,
        height: imgHeight,
        marginRight: space(1),
      }}
    >
      <MotiView
        style={{
          position: "absolute",
          height: "100%",
          flexDirection: "row",
        }}
        animate={{ bottom: isBioExpanded ? -20 : -imgHeight / 3 }}
        transition={{
          type: "timing",
          duration: 400,
          easing: Easing.out(Easing.exp),
        }}
      >
        <LinearGradient
          colors={["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 1)"]}
          style={{
            width: "100%",
          }}
        />
      </MotiView>
      <Flex position="absolute" bottom={0} pb={2} mt={1} mx={1}>
        <AnimateHeight>
          <Text variant="lg-display" color={color("white100")}>
            {specialist.name}
          </Text>
          <Text variant="xs" fontWeight="bold" mb={1} color={color("white100")}>
            {specialist.jobTitle}
          </Text>
          <Flex>
            <ReadMore
              content={specialist.bio}
              maxChars={bioTextLimit}
              textStyle="new"
              textVariant="xs"
              linkTextVariant="xs"
              color={color("white100")}
              showReadLessButton
              onExpand={(isExpanded) => setIsBioExpanded(isExpanded)}
            />
          </Flex>
        </AnimateHeight>
        <Spacer y={2} />
        <Button
          size="small"
          variant="outlineLight"
          testID="MeetTheSpecialists-contact-CTA"
          onPress={() => {
            onInquiryPress(
              tracks.consignmentInquiryTapped(buttonText),
              specialist.email,
              specialist.firstName
            )
          }}
        >
          {buttonText}
        </Button>
      </Flex>
    </ImageBackground>
  )
}

const tracks = {
  consignmentInquiryTapped: (subject: string): TappedConsignmentInquiry => ({
    action: ActionType.tappedConsignmentInquiry,
    context_module: ContextModule.sellMeetTheSpecialists,
    context_screen: OwnerType.sell,
    context_screen_owner_type: OwnerType.sell,
    subject,
  }),
}

const LoadingSkeleton = () => {
  const imgHeightToWidthRatio = 1.511 // based on designs
  const imgWidth = useExtraLargeWidth()
  return (
    <Flex>
      <PlaceholderText marginHorizontal={20} width="60%" height={40} />
      <PlaceholderText marginHorizontal={20} />
      <PlaceholderText marginHorizontal={20} />

      <Spacer y={2} />
      <FlatList
        contentContainerStyle={{ marginLeft: 20 }}
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[1, 2, 3]}
        renderItem={() => {
          return (
            <PlaceholderBox
              width={imgWidth}
              height={imgWidth * imgHeightToWidthRatio}
              marginRight={10}
            />
          )
        }}
        keyExtractor={(item) => item + "yy"}
        ListFooterComponent={() => <Spacer x={4} />}
      />
      <Flex mx={2} mt={2}>
        <PlaceholderText />
        <PlaceholderText />

        <PlaceholderButton />
      </Flex>
    </Flex>
  )
}
