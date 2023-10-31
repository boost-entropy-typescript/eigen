import { Flex, Box, Text, Separator, TextProps } from "@artsy/palette-mobile"
import { View } from "react-native"

export const PageWithSimpleHeader: React.FC<{
  title: string
  titleWeight?: TextProps["weight"]
  left?: React.ReactNode
  right?: React.ReactNode
  noSeparator?: boolean
}> = ({ title, titleWeight, left, right, children, noSeparator }) => {
  return (
    <Box style={{ flex: 1 }}>
      <Flex px={2} pb={1} pt={2} mb={0.5} flexDirection="row" alignItems="center" minHeight={54}>
        <Flex flex={1} alignItems="flex-start">
          {left}
        </Flex>
        {/* TODO: figure out how to make this stretch dynamically */}
        <Flex flex={2.5}>
          <Text variant="sm-display" weight={titleWeight || "medium"} textAlign="center">
            {title}
          </Text>
        </Flex>
        <Flex flex={1} alignItems="flex-end">
          {right}
        </Flex>
      </Flex>
      {!noSeparator && <Separator />}
      <View style={{ flex: 1 }}>{children}</View>
    </Box>
  )
}
