import { ArtsyLogoBlackIcon, Flex, Box, Text, Button } from "@artsy/palette-mobile"
import { goBack } from "app/system/navigation/navigate"

export const RequestForPriceEstimateConfirmationScreen: React.FC<{}> = () => {
  return (
    <Box mt={2} px={2}>
      <Flex justifyContent="center" alignItems="center" mb={4}>
        <ArtsyLogoBlackIcon scale={0.75} />
      </Flex>
      <Text variant="lg-display" mb={2}>
        Price Estimate Request Sent
      </Text>
      <Text color="black60" variant="sm-display" mb={4}>
        An Artsy Specialist will evaluate your artwork and contact you with a free price estimate.
      </Text>
      <Button
        onPress={() => goBack()}
        block
        variant="fillDark"
        size="large"
        testID="back-to-my-collection-button"
      >
        Back to My Collection
      </Button>
    </Box>
  )
}
