import { Flex, FlexProps } from "app/Components/Bidding/Elements/Flex"
import { ViewProps } from "react-native"

export const Container = (props: FlexProps & ViewProps) => (
  <Flex m={2} flex={1} flexDirection="column" justifyContent="space-between" {...props} />
)
