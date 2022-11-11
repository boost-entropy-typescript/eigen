import { ArtworkTombstone_artwork$data } from "__generated__/ArtworkTombstone_artwork.graphql"
import { useFeatureFlag } from "app/store/GlobalStore"
import { Box, comma, Flex, Spacer, Text } from "palette"
import { createFragmentContainer, graphql } from "react-relay"
import { ArtworkMakerTitleFragmentContainer } from "./ArtworkMakerTitle"
import { CascadingEndTimesBanner } from "./CascadingEndTimesBanner"

export interface ArtworkTombstoneProps {
  artwork: ArtworkTombstone_artwork$data
}

export interface ArtworkTombstoneState {
  showingMoreArtists: boolean
  showAuthenticityCertificateModal: boolean
}

export const ArtworkTombstone: React.FC<ArtworkTombstoneProps> = ({ artwork }) => {
  const enableArtworkRedesign = useFeatureFlag("ARArtworkRedesingPhase2")

  const getArtworkTitleAndMaybeDate = () => {
    if (artwork.date) {
      return `${artwork.title!}${comma} ${artwork.date}`
    }

    return artwork.title!
  }

  const displayAuctionLotLabel =
    artwork.isInAuction &&
    artwork.saleArtwork &&
    artwork.saleArtwork.lotLabel &&
    artwork.sale &&
    !artwork.sale.isClosed

  return (
    <Box textAlign="left">
      {!!displayAuctionLotLabel && (
        <>
          <Spacer mb={1} />
          <Text variant="md" color="black100">
            Lot {artwork.saleArtwork.lotLabel}
          </Text>
        </>
      )}
      <ArtworkMakerTitleFragmentContainer artwork={artwork} />
      <Flex flexDirection="row" flexWrap="wrap">
        <Text variant="lg-display" color="black60">
          {getArtworkTitleAndMaybeDate()}
        </Text>
      </Flex>
      {!!artwork.isInAuction && !artwork.sale?.isClosed && (
        <>
          {!!(artwork.sale?.cascadingEndTimeIntervalMinutes && !enableArtworkRedesign) && (
            <Flex my={2} mx={-2}>
              <CascadingEndTimesBanner
                cascadingEndTimeInterval={artwork.sale.cascadingEndTimeIntervalMinutes}
                extendedBiddingIntervalMinutes={artwork.sale.extendedBiddingIntervalMinutes}
              />
            </Flex>
          )}
          <Spacer mb={1} />
          {!!artwork.partner && (
            <Text variant="sm" color="black100" weight="medium">
              {artwork.partner.name}
            </Text>
          )}
          {!!artwork.saleArtwork && !!artwork.saleArtwork.estimate && (
            <Text variant="sm" color="black60">
              Estimated value: {artwork.saleArtwork.estimate}
            </Text>
          )}
        </>
      )}
    </Box>
  )
}

export const ArtworkTombstoneFragmentContainer = createFragmentContainer(ArtworkTombstone, {
  artwork: graphql`
    fragment ArtworkTombstone_artwork on Artwork {
      title
      isInAuction
      medium
      date
      saleArtwork {
        lotLabel
        estimate
      }
      partner {
        name
      }
      sale {
        isClosed
        cascadingEndTimeIntervalMinutes
        extendedBiddingIntervalMinutes
      }
      ...ArtworkMakerTitle_artwork
    }
  `,
})
