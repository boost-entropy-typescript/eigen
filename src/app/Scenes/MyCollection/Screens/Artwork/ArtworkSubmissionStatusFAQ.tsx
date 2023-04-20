import { BulletedItem, Spacer, Flex, Text, Join, Button } from "@artsy/palette-mobile"
import { navigate } from "app/system/navigation/navigate"
import { sendEmailWithMailTo } from "app/utils/sendEmail"

export const ArtworkSubmissionStatusFAQ: React.FC<{ closeModal: () => void }> = ({
  closeModal,
}) => {
  const article = "https://support.artsy.net/s/article/What-items-do-you-accept"

  return (
    <Flex p={2}>
      <Text variant="lg-display" mb={4}>
        Submission Status
      </Text>
      <Text caps mb={2} variant="xs">
        What does my Artwork’s status mean?
      </Text>
      <Flex flexDirection="column" mb={4}>
        <Join separator={<Spacer y={1} />}>
          <BulletedItem color="black">
            <Text fontWeight="bold">Submission in Progress</Text> - the artwork is being reviewed or
            is in the sale process.
          </BulletedItem>
          <BulletedItem color="black">
            <Text fontWeight="bold">Evaluation Complete</Text> - our specialists have reviewed this
            submission and determined that we do not currently have a market for it.
          </BulletedItem>
        </Join>
      </Flex>
      <Text caps variant="xs" mb={2}>
        find out more
      </Text>
      <Flex flexDirection="column" mb={4}>
        <Text mb={1}>
          For more information, see our Collector Help Center article{" "}
          <Text style={{ textDecorationLine: "underline" }} onPress={() => navigate(article)}>
            What items do you accept?
          </Text>
        </Text>
        <Text>
          Or get in touch with one of our specialists at{" "}
          <Text
            style={{ textDecorationLine: "underline" }}
            onPress={() => sendEmailWithMailTo("mailto:consign@artsymail.com")}
          >
            sell@artsy.net
          </Text>
          .
        </Text>
      </Flex>
      <Button block haptic onPress={closeModal}>
        Close
      </Button>
    </Flex>
  )
}
