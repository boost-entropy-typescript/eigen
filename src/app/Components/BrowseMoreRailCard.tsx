import { Button, Flex } from "@artsy/palette-mobile"

interface BrowseMoreRailCardProps {
  dark?: boolean
  onPress: () => void
  text: string
}

export const BrowseMoreRailCard: React.FC<BrowseMoreRailCardProps> = ({ dark, onPress, text }) => {
  return (
    <Flex flex={1} px={1} mx={2} justifyContent="center">
      <Button
        variant={dark ? "outlineLight" : "outline"}
        onPress={onPress}
        accessibilityLabel={text}
      >
        {text}
      </Button>
    </Flex>
  )
}
