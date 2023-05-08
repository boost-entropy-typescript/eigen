import { tappedMainArtworkGrid } from "@artsy/cohesion"
import {
  Box,
  Flex,
  HeartFillIcon,
  HeartIcon,
  Spacer,
  Text,
  TextProps,
  Touchable,
} from "@artsy/palette-mobile"
import { ArtworkGridItem_artwork$data } from "__generated__/ArtworkGridItem_artwork.graphql"
import { filterArtworksParams } from "app/Components/ArtworkFilter/ArtworkFilterHelpers"
import { ArtworksFiltersStore } from "app/Components/ArtworkFilter/ArtworkFilterStore"
import { DurationProvider } from "app/Components/Countdown"
import OpaqueImageView from "app/Components/OpaqueImageView/OpaqueImageView"

import { OpaqueImageView as NewOpaqueImageView } from "app/Components/OpaqueImageView2"
import { GlobalStore } from "app/store/GlobalStore"
import { PageableRouteProps } from "app/system/navigation/useNavigateToPageableRoute"
import { useArtworkBidding } from "app/utils/Websockets/auctions/useArtworkBidding"
import { getUrgencyTag } from "app/utils/getUrgencyTag"
import { useFeatureFlag } from "app/utils/hooks/useFeatureFlag"
import { useSaveArtwork } from "app/utils/mutations/useSaveArtwork"
import {
  PlaceholderBox,
  PlaceholderRaggedText,
  RandomNumberGenerator,
} from "app/utils/placeholders"
import {
  ArtworkActionTrackingProps,
  tracks as artworkActionTracks,
} from "app/utils/track/ArtworkActions"
import React, { useRef } from "react"
import { View } from "react-native"
import { createFragmentContainer, graphql } from "react-relay"
import { useTracking } from "react-tracking"
import { LotCloseInfo } from "./LotCloseInfo"
import { LotProgressBar } from "./LotProgressBar"
const SAVE_ICON_SIZE = 22

export interface ArtworkProps extends Partial<PageableRouteProps>, ArtworkActionTrackingProps {
  artwork: ArtworkGridItem_artwork$data
  /** Overrides onPress and prevents the default behaviour. */
  onPress?: (artworkID: string) => void
  trackingFlow?: string
  /** Pass Tap to override generic ing, used for home tracking in rails */
  trackTap?: (artworkSlug: string, index?: number) => void
  itemIndex?: number

  /** Hide urgency tags (3 Days left, 1 hour left) */
  hideUrgencyTags?: boolean
  /** Hide partner name */
  hidePartner?: boolean
  /** Hide sale info */
  hideSaleInfo?: boolean
  hideSaveIcon?: boolean
  height?: number
  /** Show the lot number (Lot 213) */
  showLotLabel?: boolean
  /** styles for each field: allows for customization of each field */
  urgencyTagTextStyle?: TextProps
  lotLabelTextStyle?: TextProps
  artistNamesTextStyle?: TextProps
  titleTextStyle?: TextProps
  saleInfoTextStyle?: TextProps
  partnerNameTextStyle?: TextProps
  /** allows for artwork to be added to recent searches */
  updateRecentSearchesOnTap?: boolean
}

export const Artwork: React.FC<ArtworkProps> = ({
  artwork,
  onPress,
  navigateToPageableRoute,
  trackTap,
  itemIndex,
  height,
  contextModule,
  contextScreenOwnerId,
  contextScreenOwnerSlug,
  contextScreenOwnerType,
  contextScreenQuery,
  contextScreen,
  hideUrgencyTags = false,
  hidePartner = false,
  hideSaleInfo = false,
  hideSaveIcon = false,
  showLotLabel = false,
  urgencyTagTextStyle,
  lotLabelTextStyle,
  artistNamesTextStyle,
  titleTextStyle,
  saleInfoTextStyle,
  partnerNameTextStyle,
  updateRecentSearchesOnTap = false,
}) => {
  const itemRef = useRef<any>()
  const tracking = useTracking()
  const eableArtworkGridSaveIcon = useFeatureFlag("AREnableArtworkGridSaveIcon")
  const enableNewOpaqueImageView = useFeatureFlag("AREnableNewOpaqueImageComponent")

  let filterParams: any = undefined

  // This is needed to make sure the filter context is defined
  if (ArtworksFiltersStore.useStore()) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const appliedFilters = ArtworksFiltersStore.useStoreState((state) => state.appliedFilters)
    filterParams = filterArtworksParams(appliedFilters)
  }

  const extendedBiddingEndAt = artwork.saleArtwork?.extendedBiddingEndAt
  const lotEndAt = artwork.saleArtwork?.endAt
  const biddingEndAt = extendedBiddingEndAt ?? lotEndAt
  const lotID = artwork.saleArtwork?.lotID

  const { currentBiddingEndAt, lotSaleExtended } = useArtworkBidding({
    lotID,
    lotEndAt,
    biddingEndAt,
  })

  const addArtworkToRecentSearches = () => {
    if (updateRecentSearchesOnTap) {
      GlobalStore.actions.search.addRecentSearch({
        type: "AUTOSUGGEST_RESULT_TAPPED",
        props: {
          imageUrl: artwork?.image?.url ?? null,
          href: artwork.href,
          slug: artwork.slug,
          displayLabel: `${artwork.artistNames}, ${artwork.title} (${artwork.date})`,
          __typename: "Artwork",
          displayType: "Artwork",
        },
      })
    }
  }

  const { id, internalID, isSaved } = artwork

  const onArtworkSavedOrUnSaved = (saved: boolean) => {
    const { availability, isAcquireable, isBiddable, isInquireable, isOfferable } = artwork
    const params = {
      acquireable: isAcquireable,
      availability,
      biddable: isBiddable,
      context_module: contextModule,
      context_screen: contextScreen,
      context_screen_owner_id: contextScreenOwnerId,
      context_screen_owner_slug: contextScreenOwnerSlug,
      context_screen_owner_type: contextScreenOwnerType,
      inquireable: isInquireable,
      offerable: isOfferable,
    }
    tracking.trackEvent(artworkActionTracks.saveOrUnsaveArtwork(saved, params))
  }

  const handleArtworkSave = useSaveArtwork({
    id,
    internalID,
    isSaved,
    onCompleted: onArtworkSavedOrUnSaved,
  })

  const handleTap = () => {
    if (onPress) {
      return onPress(artwork.slug)
    }

    addArtworkToRecentSearches()
    trackArtworkTap()
    navigateToPageableRoute?.(artwork.href!)
  }

  const trackArtworkTap = () => {
    // Unless you explicitly pass in a tracking function or provide a contextScreenOwnerType, we won't track
    // taps from the grid.
    if (trackTap || contextScreenOwnerType) {
      const genericTapEvent = tappedMainArtworkGrid({
        contextScreen,
        contextScreenOwnerType: contextScreenOwnerType!,
        contextScreenOwnerId,
        contextScreenOwnerSlug,
        destinationScreenOwnerId: artwork.internalID,
        destinationScreenOwnerSlug: artwork.slug,
        position: itemIndex,
        // This is always a string; types are incorrect
        sort: String(filterParams?.sort),
        query: contextScreenQuery,
      })

      trackTap ? trackTap(artwork.slug, itemIndex) : tracking.trackEvent(genericTapEvent)
    }
  }

  const saleInfo = saleMessageOrBidInfo({ artwork })

  const endsAt = artwork.sale?.cascadingEndTimeIntervalMinutes
    ? currentBiddingEndAt
    : artwork.saleArtwork?.endAt || artwork.sale?.endAt

  const urgencyTag = getUrgencyTag(endsAt)

  const canShowAuctionProgressBar =
    !!artwork.sale?.extendedBiddingPeriodMinutes && !!artwork.sale?.extendedBiddingIntervalMinutes

  return (
    <Touchable onPress={handleTap} testID={`artworkGridItem-${artwork.title}`}>
      <View ref={itemRef}>
        {!!artwork.image && (
          <View>
            {enableNewOpaqueImageView ? (
              <NewOpaqueImageView
                aspectRatio={artwork.image?.aspectRatio ?? 1}
                imageURL={artwork.image?.url}
                height={height}
              />
            ) : (
              <OpaqueImageView
                aspectRatio={artwork.image?.aspectRatio ?? 1}
                imageURL={artwork.image?.url}
              />
            )}
            {Boolean(
              !hideUrgencyTags && urgencyTag && artwork?.sale?.isAuction && !artwork?.sale?.isClosed
            ) && (
              <Flex
                position="absolute"
                bottom="5px"
                left="5px"
                backgroundColor="white"
                px="5px"
                py="3px"
                borderRadius={2}
                alignSelf="flex-start"
              >
                <Text variant="xs" color="black100" numberOfLines={1} {...urgencyTagTextStyle}>
                  {urgencyTag}
                </Text>
              </Flex>
            )}
          </View>
        )}
        {!!canShowAuctionProgressBar && (
          <Box mt={1}>
            <DurationProvider startAt={endsAt ?? undefined}>
              <LotProgressBar
                duration={null}
                startAt={artwork.sale?.startAt}
                extendedBiddingPeriodMinutes={artwork.sale.extendedBiddingPeriodMinutes}
                extendedBiddingIntervalMinutes={artwork.sale.extendedBiddingIntervalMinutes}
                biddingEndAt={endsAt}
                hasBeenExtended={lotSaleExtended}
              />
            </DurationProvider>
          </Box>
        )}
        <Flex flexDirection="row" justifyContent="space-between" mt={1}>
          <Flex flex={1}>
            {!!showLotLabel && !!artwork.saleArtwork?.lotLabel && (
              <>
                <Text variant="xs" numberOfLines={1} caps {...lotLabelTextStyle}>
                  Lot {artwork.saleArtwork.lotLabel}
                </Text>
                {!!artwork.sale?.cascadingEndTimeIntervalMinutes && (
                  <DurationProvider startAt={endsAt ?? undefined}>
                    <LotCloseInfo
                      duration={null}
                      saleArtwork={artwork.saleArtwork}
                      sale={artwork.sale}
                      lotEndAt={endsAt ?? undefined}
                      hasBeenExtended={lotSaleExtended}
                    />
                  </DurationProvider>
                )}
              </>
            )}
            {!!artwork.artistNames && (
              <Text
                lineHeight="18px"
                weight="regular"
                variant="xs"
                numberOfLines={1}
                {...artistNamesTextStyle}
              >
                {artwork.artistNames}
              </Text>
            )}
            {!!artwork.title && (
              <Text
                lineHeight="18px"
                variant="xs"
                weight="regular"
                color="black60"
                numberOfLines={1}
                {...titleTextStyle}
              >
                <Text lineHeight="18px" variant="xs" weight="regular" italic>
                  {artwork.title}
                </Text>
                {artwork.date ? `, ${artwork.date}` : ""}
              </Text>
            )}
            {!hidePartner && !!artwork.partner?.name && (
              <Text
                variant="xs"
                lineHeight="18px"
                color="black60"
                numberOfLines={1}
                {...partnerNameTextStyle}
              >
                {artwork.partner.name}
              </Text>
            )}
            {!!saleInfo && !hideSaleInfo && (
              <Text
                lineHeight="18px"
                variant="xs"
                weight="medium"
                numberOfLines={1}
                {...saleInfoTextStyle}
              >
                {saleInfo}
              </Text>
            )}
          </Flex>
          {!!eableArtworkGridSaveIcon && !hideSaveIcon && (
            <Flex>
              <Touchable haptic onPress={handleArtworkSave} testID="save-artwork-icon">
                {artwork.isSaved ? (
                  <HeartFillIcon
                    testID="filled-heart-icon"
                    height={SAVE_ICON_SIZE}
                    width={SAVE_ICON_SIZE}
                    fill="blue100"
                  />
                ) : (
                  <HeartIcon
                    testID="empty-heart-icon"
                    height={SAVE_ICON_SIZE}
                    width={SAVE_ICON_SIZE}
                  />
                )}
              </Touchable>
            </Flex>
          )}
        </Flex>
      </View>
    </Touchable>
  )
}

/**
 * Get sale message or bid info
 * @example
 * "$1,000 (Starting price)"
 * @example
 * "Bidding closed"
 *  @example
 * "$1,750 (2 bids)"
 */
export const saleMessageOrBidInfo = ({
  artwork,
  isSmallTile = false,
}: {
  artwork: Readonly<{
    sale: { isAuction: boolean | null; isClosed: boolean | null } | null
    saleArtwork: {
      counts: { bidderPositions: number | null } | null | null
      currentBid: { display: string | null } | null
    } | null
    saleMessage: string | null
    realizedPrice: string | null
  }>
  isSmallTile?: boolean
}): string | null | undefined => {
  const { sale, saleArtwork, realizedPrice } = artwork

  // Price which an artwork was sold for.
  if (realizedPrice) {
    return `Sold for ${realizedPrice}`
  }

  // Auction specs are available at https://artsyproduct.atlassian.net/browse/MX-482
  if (sale?.isAuction) {
    // The auction is closed
    if (sale.isClosed) {
      return "Bidding closed"
    }

    // The auction is open
    const bidderPositions = saleArtwork?.counts?.bidderPositions
    const currentBid = saleArtwork?.currentBid?.display
    // If there are no current bids we show the starting price with an indication that it's a new bid
    if (!bidderPositions) {
      if (isSmallTile) {
        return `${currentBid} (Bid)`
      }
      return `${currentBid} (Starting bid)`
    }

    // If there are bids we show the current bid price and the number of bids
    const numberOfBidsString = bidderPositions === 1 ? "1 bid" : `${bidderPositions} bids`
    return `${currentBid} (${numberOfBidsString})`
  }

  if (artwork.saleMessage === "Contact For Price") {
    return "Price on request"
  }

  return artwork.saleMessage
}

export default createFragmentContainer(Artwork, {
  artwork: graphql`
    fragment ArtworkGridItem_artwork on Artwork
    @argumentDefinitions(includeAllImages: { type: "Boolean", defaultValue: false }) {
      availability
      title
      date
      saleMessage
      slug
      id
      internalID
      isAcquireable
      isBiddable
      isInquireable
      isOfferable
      isSaved
      artistNames
      href
      sale {
        isAuction
        isClosed
        displayTimelyAt
        cascadingEndTimeIntervalMinutes
        extendedBiddingPeriodMinutes
        extendedBiddingIntervalMinutes
        endAt
        startAt
      }
      saleArtwork {
        counts {
          bidderPositions
        }
        formattedEndDateTime
        currentBid {
          display
        }
        lotID
        lotLabel
        endAt
        extendedBiddingEndAt
      }
      partner {
        name
      }
      image(includeAll: $includeAllImages) {
        url(version: "large")
        aspectRatio
      }
      realizedPrice
    }
  `,
})

export const ArtworkGridItemPlaceholder: React.FC<{ seed?: number }> = ({
  seed = Math.random(),
}) => {
  const rng = new RandomNumberGenerator(seed)
  return (
    <Flex>
      <PlaceholderBox height={rng.next({ from: 50, to: 150 })} width="100%" />
      <Spacer y={1} />
      <PlaceholderRaggedText seed={rng.next()} numLines={2} />
    </Flex>
  )
}
