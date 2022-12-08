import { ArtworkStickyBottomContent_artwork$key } from "__generated__/ArtworkStickyBottomContent_artwork.graphql"
import { ArtworkStickyBottomContent_me$key } from "__generated__/ArtworkStickyBottomContent_me.graphql"
import { AuctionTimerState } from "app/Components/Bidding/Components/Timer"
import { ArtworkStore } from "app/Scenes/Artwork/ArtworkStore"
import { Box, Separator } from "palette"
import { useFragment } from "react-relay"
import { graphql } from "relay-runtime"
import { useScreenDimensions } from "shared/hooks"
import { ArtworkCommercialButtons } from "./ArtworkCommercialButtons"
import { ArtworkPrice } from "./ArtworkPrice"

interface ArtworkStickyBottomContentProps {
  artwork: ArtworkStickyBottomContent_artwork$key
  me: ArtworkStickyBottomContent_me$key
}

export const ArtworkStickyBottomContent: React.FC<ArtworkStickyBottomContentProps> = ({
  artwork,
  me,
}) => {
  const { safeAreaInsets } = useScreenDimensions()
  const artworkData = useFragment(artworkFragment, artwork)
  const meData = useFragment(meFragment, me)
  const auctionState = ArtworkStore.useStoreState((state) => state.auctionState)

  if (!artworkData.isForSale || artworkData.isSold || auctionState === AuctionTimerState.CLOSED) {
    return null
  }

  return (
    <Box
      accessibilityLabel="Sticky bottom commercial section"
      bg="white100"
      pb={safeAreaInsets.bottom}
    >
      <Separator />
      <Box px={2} py={1}>
        <ArtworkPrice artwork={artworkData} mb={1} />
        <ArtworkCommercialButtons artwork={artworkData} me={meData} />
      </Box>
    </Box>
  )
}

const artworkFragment = graphql`
  fragment ArtworkStickyBottomContent_artwork on Artwork {
    isForSale
    isSold
    ...ArtworkPrice_artwork
    ...ArtworkCommercialButtons_artwork
  }
`

const meFragment = graphql`
  fragment ArtworkStickyBottomContent_me on Me {
    ...ArtworkCommercialButtons_me
  }
`
