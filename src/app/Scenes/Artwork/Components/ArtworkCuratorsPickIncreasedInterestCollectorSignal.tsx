import { Flex, Text, TrendingIcon, VerifiedIcon } from "@artsy/palette-mobile"
import { ArtworkCuratorsPickIncreasedInterestCollectorSignal_artwork$key } from "__generated__/ArtworkCuratorsPickIncreasedInterestCollectorSignal_artwork.graphql"
import { graphql, useFragment } from "react-relay"

interface Props {
  artwork: ArtworkCuratorsPickIncreasedInterestCollectorSignal_artwork$key
}

export const ArtworkCuratorsPickIncreasedInterestCollectorSignal: React.FC<Props> = ({
  artwork,
}) => {
  const { collectorSignals } = useFragment(fragment, artwork)

  if (
    !collectorSignals ||
    (!collectorSignals.increasedInterest && !collectorSignals.curatorsPick)
  ) {
    return null
  }

  const { curatorsPick } = collectorSignals

  let singalTitle = "Increased Interest"
  let signalDescription = "Based on collector activity in the past 14 days"
  let SignalIcon = TrendingIcon

  if (curatorsPick) {
    singalTitle = "Curators’ Pick"
    signalDescription = "Hand selected by Artsy curators this week"
    SignalIcon = VerifiedIcon
  }

  return (
    <Flex flexDirection="row" pt={4} pb={2}>
      <SignalIcon mr={0.5} mt="2px" />

      <Flex flexDirection="column">
        <Text variant="sm-display" color="black100">
          {singalTitle}
        </Text>

        <Text variant="sm" color="black60">
          {signalDescription}
        </Text>
      </Flex>
    </Flex>
  )
}

const fragment = graphql`
  fragment ArtworkCuratorsPickIncreasedInterestCollectorSignal_artwork on Artwork {
    collectorSignals {
      increasedInterest
      curatorsPick
    }
  }
`
