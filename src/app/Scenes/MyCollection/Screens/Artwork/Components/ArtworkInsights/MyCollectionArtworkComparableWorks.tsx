import { ActionType, ContextModule, OwnerType } from "@artsy/cohesion"
import { Flex } from "@artsy/palette-mobile"
import { MyCollectionArtworkComparableWorks_artwork$key } from "__generated__/MyCollectionArtworkComparableWorks_artwork.graphql"
import {
  AuctionResultListItemFragmentContainer,
  AuctionResultListSeparator,
} from "app/Components/Lists/AuctionResultListItem"
import { SectionTitle } from "app/Components/SectionTitle"
import { navigate } from "app/system/navigation/navigate"
import { extractNodes } from "app/utils/extractNodes"
import { useScreenDimensions } from "app/utils/hooks"
import { FlatList } from "react-native"
import { graphql, useFragment } from "react-relay"
import { useTracking } from "react-tracking"

interface MyCollectionArtworkComparableWorksProps {
  artwork: MyCollectionArtworkComparableWorks_artwork$key
}

export const MyCollectionArtworkComparableWorks: React.FC<
  MyCollectionArtworkComparableWorksProps
> = (props) => {
  const { trackEvent } = useTracking()
  const { width } = useScreenDimensions()

  const artwork = useFragment(artworkFragment, props.artwork)

  const comparableWorks = extractNodes(artwork?.comparableAuctionResults)

  if (!comparableWorks.length) {
    return null
  }

  return (
    <Flex mb={6}>
      <SectionTitle title="Comparable Works" />

      <FlatList
        data={comparableWorks}
        keyExtractor={(item) => item.internalID}
        renderItem={({ item }) => (
          <AuctionResultListItemFragmentContainer
            auctionResult={item}
            onPress={() => {
              trackEvent(tracks.tappedAuctionResultGroup(artwork?.internalID, artwork?.slug))
              navigate(`/artist/${artwork?.artist?.slug!}/auction-result/${item.internalID}`)
            }}
          />
        )}
        ItemSeparatorComponent={AuctionResultListSeparator}
        style={{ width, left: -20 }}
      />
    </Flex>
  )
}

const artworkFragment = graphql`
  fragment MyCollectionArtworkComparableWorks_artwork on Artwork {
    internalID
    slug
    artist {
      slug
    }
    comparableAuctionResults(first: 6) @optionalField {
      edges {
        node {
          internalID
          ...AuctionResultListItem_auctionResult
        }
      }
    }
  }
`

const tracks = {
  tappedShowMore: (internalID: string, slug: string) => ({
    action: ActionType.tappedShowMore,
    context_module: ContextModule.myCollectionComparableWorks,
    context_screen: OwnerType.myCollectionArtworkInsights,
    context_screen_owner_type: OwnerType.myCollectionArtwork,
    context_screen_owner_id: internalID,
    context_screen_owner_slug: slug,
  }),
  tappedAuctionResultGroup: (internalID: string, slug: string) => ({
    action: ActionType.tappedAuctionResultGroup,
    context_module: ContextModule.myCollectionComparableWorks,
    context_screen: OwnerType.myCollectionArtworkInsights,
    context_screen_owner_type: OwnerType.myCollectionArtwork,
    context_screen_owner_id: internalID,
    context_screen_owner_slug: slug,
  }),
}
