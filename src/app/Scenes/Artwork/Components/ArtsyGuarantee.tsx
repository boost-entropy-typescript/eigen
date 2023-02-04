import {
  Spacer,
  VerifiedIcon,
  IconProps,
  SecureLockIcon,
  GuaranteeIcon,
} from "@artsy/palette-mobile"
import { navigate } from "app/system/navigation/navigate"
import { Box, Flex, Join, LinkText, Text } from "palette"

export const ArtsyGuarantee: React.FC = () => {
  const iconProps: IconProps = {
    height: 24,
    width: 24,
    mr: 1,
  }

  return (
    <Box>
      <Text variant="md" color="black100">
        Be covered by the Artsy Guarantee when you checkout with Artsy
      </Text>
      <Spacer mt={2} />

      <Join separator={<Spacer mt={1} />}>
        <Flex flexDirection="row" alignItems="center">
          <SecureLockIcon
            accessibilityRole="image"
            accessibilityLabel="Secure Checkout Icon"
            {...iconProps}
          />
          <Text variant="sm" color="black60">
            Secure Checkout
          </Text>
        </Flex>
        <Flex flexDirection="row" alignItems="center">
          <GuaranteeIcon
            accessibilityRole="image"
            accessibilityLabel="Money-Back Guarantee Icon"
            {...iconProps}
          />
          <Text variant="sm" color="black60">
            Money-Back Guarantee
          </Text>
        </Flex>

        <Flex flexDirection="row" alignItems="center">
          <VerifiedIcon
            accessibilityRole="image"
            accessibilityLabel="Authenticity Guarantee Icon"
            {...iconProps}
          />
          <Text variant="sm" color="black60">
            Authenticity Guarantee
          </Text>
        </Flex>

        <LinkText
          accessibilityRole="link"
          accessibilityHint="Redirects to Artsy Guarantee page"
          accessibilityLabel="Learn more about the Artsy Guarantee"
          onPress={() => navigate("https://www.artsy.net/buyer-guarantee")}
          variant="xs"
          color="black60"
        >
          Learn more
        </LinkText>
      </Join>
    </Box>
  )
}
