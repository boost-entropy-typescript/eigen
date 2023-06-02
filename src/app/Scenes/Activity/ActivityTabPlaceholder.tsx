import { Spacer, Flex, Box, Separator, NAVBAR_HEIGHT } from "@artsy/palette-mobile"
import { PlaceholderBox } from "app/utils/placeholders"
import { times } from "lodash"
import { Fragment } from "react"
import Animated from "react-native-reanimated"

const ActivityItemPlaceholder = () => {
  return (
    <Box my={2}>
      <PlaceholderBox width={30} height={20} />
      <Spacer y={0.5} />
      <PlaceholderBox width={130} height={15} />
      <Spacer y={0.5} />
      <PlaceholderBox width={100} height={15} />
      <Spacer y={1} />
      <Flex flexDirection="row">
        <PlaceholderBox width={55} height={55} marginRight={10} />
        <PlaceholderBox width={55} height={55} marginRight={10} />
        <PlaceholderBox width={55} height={55} />
      </Flex>
    </Box>
  )
}

export const ActivityTabPlaceholder = () => {
  return (
    <Flex flex={1}>
      <Animated.View
        style={{
          height: NAVBAR_HEIGHT * 2,
        }}
      />

      {/* Subheader */}
      <Flex
        py={1}
        px={2}
        height={50}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <PlaceholderBox width={120} height={25} />
        <PlaceholderBox width={125} height={30} borderRadius={15} />
      </Flex>
      <Separator />

      <Box mx={2}>
        {times(3).map((index) => (
          <Fragment key={`placeholder-item-${index}`}>
            <ActivityItemPlaceholder />
            <Separator />
          </Fragment>
        ))}
      </Box>
    </Flex>
  )
}
