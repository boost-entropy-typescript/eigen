import { Spacer } from "@artsy/palette-mobile"
import { ArtworkCommercialButtons_artwork$key } from "__generated__/ArtworkCommercialButtons_artwork.graphql"
import { ArtworkCommercialButtons_me$key } from "__generated__/ArtworkCommercialButtons_me.graphql"
import { AuctionTimerState } from "app/Components/Bidding/Components/Timer"
import { ArtworkStore } from "app/Scenes/Artwork/ArtworkStore"
import { Flex, Join } from "palette"
import { Children } from "react"
import { useFragment } from "react-relay"
import { graphql } from "relay-runtime"
import { BidButtonFragmentContainer } from "./CommercialButtons/BidButton"
import { BuyNowButton } from "./CommercialButtons/BuyNowButton"
import { InquiryButtonsFragmentContainer } from "./CommercialButtons/InquiryButtons"
import { MakeOfferButtonFragmentContainer } from "./CommercialButtons/MakeOfferButton"

interface ArtworkCommercialButtonsProps {
  artwork: ArtworkCommercialButtons_artwork$key
  me: ArtworkCommercialButtons_me$key
}

const RowContainer: React.FC = ({ children }) => {
  const childArray = Children.map(children, (child) => {
    return <Flex flex={1}>{child}</Flex>
  })

  return (
    <Flex flexDirection="row" alignItems="center">
      <Join separator={<Spacer ml={1} />}>{childArray}</Join>
    </Flex>
  )
}

export const ArtworkCommercialButtons: React.FC<ArtworkCommercialButtonsProps> = ({
  artwork,
  me,
}) => {
  const artworkData = useFragment(artworkFragment, artwork)
  const meData = useFragment(meFragment, me)
  const selectedEditionId = ArtworkStore.useStoreState((state) => state.selectedEditionId)
  const auctionState = ArtworkStore.useStoreState((state) => state.auctionState)
  const isBiddableInAuction = artworkData.isInAuction && artworkData.sale
  const canTakeCommercialAction =
    artworkData.isAcquireable ||
    artworkData.isOfferable ||
    artworkData.isInquireable ||
    isBiddableInAuction
  const noEditions = !artworkData.editionSets || artworkData.editionSets.length === 0

  if (!canTakeCommercialAction) {
    return null
  }

  if (artworkData.isInAuction && artworkData.sale) {
    if (artworkData.isBuyNowable && noEditions) {
      return (
        <RowContainer>
          <BidButtonFragmentContainer
            artwork={artworkData}
            me={meData}
            auctionState={auctionState as AuctionTimerState}
            variant="outline"
          />
          <BuyNowButton artwork={artworkData} editionSetID={selectedEditionId} renderSaleMessage />
        </RowContainer>
      )
    }

    return (
      <BidButtonFragmentContainer
        artwork={artworkData}
        me={meData}
        auctionState={auctionState as AuctionTimerState}
      />
    )
  }

  if (artworkData.isOfferable && artworkData.isAcquireable) {
    return (
      <RowContainer>
        <MakeOfferButtonFragmentContainer
          artwork={artworkData}
          editionSetID={selectedEditionId}
          variant="outline"
        />
        <BuyNowButton artwork={artworkData} editionSetID={selectedEditionId} />
      </RowContainer>
    )
  }

  if (artworkData.isAcquireable) {
    return <BuyNowButton artwork={artworkData} editionSetID={selectedEditionId} />
  }

  if (artworkData.isInquireable && artworkData.isOfferable) {
    return (
      <RowContainer>
        <InquiryButtonsFragmentContainer artwork={artworkData} variant="outline" block />
        <MakeOfferButtonFragmentContainer artwork={artworkData} editionSetID={selectedEditionId} />
      </RowContainer>
    )
  }

  if (artworkData.isOfferable) {
    return (
      <MakeOfferButtonFragmentContainer artwork={artworkData} editionSetID={selectedEditionId} />
    )
  }

  if (artworkData.isInquireable) {
    return <InquiryButtonsFragmentContainer artwork={artworkData} block />
  }

  return null
}

const artworkFragment = graphql`
  fragment ArtworkCommercialButtons_artwork on Artwork {
    isInAuction
    isOfferable
    isAcquireable
    isInquireable
    isBuyNowable
    sale {
      internalID
    }
    editionSets {
      internalID
    }
    ...BuyNowButton_artwork
    ...MakeOfferButton_artwork
    ...InquiryButtons_artwork
    ...BidButton_artwork
  }
`

const meFragment = graphql`
  fragment ArtworkCommercialButtons_me on Me {
    ...BidButton_me
  }
`
