import { Flex, Spacer, Text } from "@artsy/palette-mobile"
import { isPad } from "app/utils/hardware"
import { Image } from "react-native"

export const CollectorsNetwork: React.FC = () => {
  const isAPad = isPad()
  if (isAPad) {
    return (
      <Flex mx={2}>
        <Text variant="lg-display" mb={2}>
          Reach a global network of collectors
        </Text>
        <Flex flexDirection="row" alignItems="center">
          <Flex>
            <Flex mb={2}>
              <Text variant="xl">3M+</Text>
              <Text variant="sm-display">registered buyers worldwide</Text>
            </Flex>
            <Flex mb={2}>
              <Text variant="xl">30,000</Text>
              <Text variant="sm-display">Artworks sold at auction </Text>
            </Flex>
            <Flex mb={2}>
              <Text variant="xl">190</Text>
              <Text variant="sm-display">Countries</Text>
            </Flex>
          </Flex>
          <Image
            source={require("images/world-map.png")}
            style={{ width: "70%", height: "100%" }}
            resizeMode="contain"
          />
        </Flex>
      </Flex>
    )
  }
  return (
    <Flex mx={2}>
      <Text variant="lg-display" mb={2}>
        Reach a global network of collectors
      </Text>
      <Flex>
        <Text variant="xl">3M+</Text>
        <Text variant="sm-display">registered buyers worldwide</Text>
      </Flex>
      <Spacer y={2} />
      <Flex flexDirection="row" mb={2}>
        <Flex>
          <Text variant="xl">30,000</Text>
          <Text variant="sm-display">Artworks sold at auction </Text>
        </Flex>
        <Spacer x={2} />
        <Flex>
          <Text variant="xl">190</Text>
          <Text variant="sm-display">Countries</Text>
        </Flex>
      </Flex>
      <Image
        source={require("images/world-map.png")}
        style={{ width: "100%" }}
        resizeMode="contain"
      />
    </Flex>
  )
}
