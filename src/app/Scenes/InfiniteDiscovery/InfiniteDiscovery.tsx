import {
  ArrowBackIcon,
  CloseIcon,
  Flex,
  Screen,
  Spacer,
  Spinner,
  Touchable,
} from "@artsy/palette-mobile"
import { FancySwiper, FancySwiperArtworkCard } from "app/Components/FancySwiper/FancySwiper"
import { useToast } from "app/Components/Toast/toastHook"
import { InfiniteDiscoveryArtworkCard } from "app/Scenes/InfiniteDiscovery/Components/InfiniteDiscoveryArtworkCard"
import { InfiniteDiscoveryBottomSheet } from "app/Scenes/InfiniteDiscovery/Components/InfiniteDiscoveryBottomSheet"
import { GlobalStore } from "app/store/GlobalStore"
import { goBack, navigate } from "app/system/navigation/navigate"
import { extractNodes } from "app/utils/extractNodes"
import { pluralize } from "app/utils/pluralize"
import { ExtractNodeType } from "app/utils/relayHelpers"
import { useEffect, useMemo, useState } from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { graphql, PreloadedQuery, usePreloadedQuery, useQueryLoader } from "react-relay"
import type {
  InfiniteDiscoveryQuery,
  InfiniteDiscoveryQuery$data,
} from "__generated__/InfiniteDiscoveryQuery.graphql"

interface InfiniteDiscoveryProps {
  fetchMoreArtworks: () => void
  queryRef: PreloadedQuery<InfiniteDiscoveryQuery>
}

type InfiniteDiscoveryArtwork = ExtractNodeType<InfiniteDiscoveryQuery$data["discoverArtworks"]>

export const InfiniteDiscovery: React.FC<InfiniteDiscoveryProps> = ({
  fetchMoreArtworks,
  queryRef,
}) => {
  const REFETCH_BUFFER = 3
  const toast = useToast()

  const { addDiscoveredArtworkIds } = GlobalStore.actions.infiniteDiscovery

  const savedArtworksCount = GlobalStore.useAppState(
    (state) => state.infiniteDiscovery.savedArtworksCount
  )

  const [index, setIndex] = useState(0)
  const [artworks, setArtworks] = useState<InfiniteDiscoveryArtwork[]>([])

  const data = usePreloadedQuery<InfiniteDiscoveryQuery>(infiniteDiscoveryQuery, queryRef)

  const insets = useSafeAreaInsets()

  /**
   * This is called whenever a query for more artworks is made.
   */
  useEffect(() => {
    const newArtworks = extractNodes(data.discoverArtworks)

    // record the artworks that have been served to the user so that they are not served again
    // TODO: do this for the first batch of artworks as well
    addDiscoveredArtworkIds(newArtworks.map((artwork) => artwork.internalID))

    setArtworks((previousArtworks) => previousArtworks.concat(newArtworks))
  }, [data, extractNodes, setArtworks])

  const artworkCards: FancySwiperArtworkCard[] = useMemo(() => {
    return artworks.map((artwork) => ({
      content: <InfiniteDiscoveryArtworkCard artwork={artwork} key={artwork.internalID} />,
      artworkId: artwork.internalID,
    }))
  }, [artworks])

  const unswipedCards: FancySwiperArtworkCard[] = artworkCards.slice(index)

  const handleBackPressed = () => {
    if (index > 0) {
      setIndex(index - 1)
    }
  }

  const handleCardSwiped = () => {
    if (index < artworks.length - 1) {
      setIndex(index + 1)
    }

    // fetch more artworks when the user is about to reach the end of the list
    if (index === artworks.length - REFETCH_BUFFER) {
      fetchMoreArtworks()
    }
  }

  const handleExitPressed = () => {
    if (savedArtworksCount > 0) {
      toast.show(
        `${savedArtworksCount} ${pluralize("artwork", savedArtworksCount)} saved`,
        "bottom",
        {
          onPress: () => {
            navigate("/favorites/saves")
          },
          backgroundColor: "green100",
          description: "Tap here to navigate to your Saves area in your profile.",
        }
      )
    }
    goBack()
  }

  return (
    <Screen safeArea={false}>
      <Screen.Body fullwidth style={{ marginTop: insets.top }}>
        <Flex zIndex={-100}>
          <Screen.Header
            title="Discovery"
            leftElements={
              <Touchable onPress={handleBackPressed} testID="back-icon">
                <ArrowBackIcon />
              </Touchable>
            }
            hideLeftElements={index === 0}
            rightElements={
              <Touchable onPress={handleExitPressed} testID="close-icon">
                <CloseIcon fill="black100" />
              </Touchable>
            }
          />
        </Flex>
        <Spacer y={1} />
        <FancySwiper cards={unswipedCards} hideActionButtons onSwipeAnywhere={handleCardSwiped} />

        {!!artworks.length && (
          <InfiniteDiscoveryBottomSheet
            artworkID={artworks[index].internalID}
            artistIDs={artworks[index].artists.map((data) => data?.internalID ?? "")}
          />
        )}
      </Screen.Body>
    </Screen>
  )
}

const InfiniteDiscoverySpinner: React.FC = () => (
  <Screen>
    <Screen.Body fullwidth>
      <Screen.Header title="Discovery" />
      <Flex flex={1} justifyContent="center" alignItems="center">
        <Spinner />
      </Flex>
    </Screen.Body>
  </Screen>
)

export const InfiniteDiscoveryQueryRenderer: React.FC = () => {
  const [queryRef, loadQuery] = useQueryLoader<InfiniteDiscoveryQuery>(infiniteDiscoveryQuery)

  const discoveredArtworksIds = GlobalStore.useAppState(
    (state) => state.infiniteDiscovery.discoveredArtworkIds
  )
  const { resetSavedArtworksCount } = GlobalStore.actions.infiniteDiscovery

  useEffect(() => {
    resetSavedArtworksCount()
  }, [])

  /**
   * This fetches the first batch of artworks. discoveredArtworksIds is omitted from the list of
   * dependencies to prevent this from being called unnecessarily, since that list is updated when
   * new artworks are fetched.
   */
  useEffect(() => {
    if (!queryRef) {
      loadQuery({ excludeArtworkIds: discoveredArtworksIds })
    }
  }, [loadQuery, queryRef])

  if (!queryRef) {
    return <InfiniteDiscoverySpinner />
  }

  const fetchMoreArtworks = () => {
    loadQuery({ excludeArtworkIds: discoveredArtworksIds })
  }

  return <InfiniteDiscovery fetchMoreArtworks={fetchMoreArtworks} queryRef={queryRef} />
}

export const infiniteDiscoveryQuery = graphql`
  query InfiniteDiscoveryQuery($excludeArtworkIds: [String!]!) {
    discoverArtworks(excludeArtworkIds: $excludeArtworkIds) {
      edges {
        node {
          ...InfiniteDiscoveryArtworkCard_artwork

          internalID @required(action: NONE)
          artists(shallow: true) @required(action: NONE) {
            internalID @required(action: NONE)
          }
        }
      }
    }
  }
`
