import {
  Box,
  Flex,
  HeartFillIcon,
  HeartIcon,
  Image,
  Text,
  Touchable,
  useColor,
} from "@artsy/palette-mobile"
import {
  ArtworkRailCard_artwork$data,
  ArtworkRailCard_artwork$key,
} from "__generated__/ArtworkRailCard_artwork.graphql"
import { CreateArtworkAlertModal } from "app/Components/Artist/ArtistArtworks/CreateArtworkAlertModal"
import { ArtworkAuctionTimer } from "app/Components/ArtworkGrids/ArtworkAuctionTimer"
import { ArtworkSocialSignal } from "app/Components/ArtworkGrids/ArtworkSocialSignal"
import { useSaveArtworkToArtworkLists } from "app/Components/ArtworkLists/useSaveArtworkToArtworkLists"
import { ARTWORK_RAIL_IMAGE_WIDTH } from "app/Components/ArtworkRail/ArtworkRail"
import { useExtraLargeWidth } from "app/Components/ArtworkRail/useExtraLargeWidth"
import { ContextMenuArtwork } from "app/Components/ContextMenu/ContextMenuArtwork"
import { HEART_ICON_SIZE } from "app/Components/constants"
import { formattedTimeLeft } from "app/Scenes/Activity/utils/formattedTimeLeft"
import { AnalyticsContextProvider } from "app/system/analytics/AnalyticsContext"
import { saleMessageOrBidInfo as defaultSaleMessageOrBidInfo } from "app/utils/getSaleMessgeOrBidInfo"
import { getTimer } from "app/utils/getTimer"
import { getUrgencyTag } from "app/utils/getUrgencyTag"
import { useFeatureFlag } from "app/utils/hooks/useFeatureFlag"
import {
  ArtworkActionTrackingProps,
  tracks as artworkActionTracks,
} from "app/utils/track/ArtworkActions"
import { sizeToFit } from "app/utils/useSizeToFit"
import { compact } from "lodash"
import { useMemo, useState } from "react"
import { GestureResponderEvent, PixelRatio, TouchableHighlight } from "react-native"
import { graphql, useFragment } from "react-relay"
import { useTracking } from "react-tracking"

export const ARTWORK_RAIL_TEXT_CONTAINER_HEIGHT = 90
export const ARTWORK_RAIL_CARD_IMAGE_HEIGHT = 320
const ARTWORK_LARGE_RAIL_CARD_IMAGE_WIDTH = 295

export interface ArtworkRailCardProps extends ArtworkActionTrackingProps {
  artwork: ArtworkRailCard_artwork$key
  dark?: boolean
  hideArtistName?: boolean
  showPartnerName?: boolean
  isRecentlySoldArtwork?: boolean
  lotLabel?: string | null
  lowEstimateDisplay?: string
  highEstimateDisplay?: string
  metaContainerStyles?: {}
  performanceDisplay?: string
  onPress?: (event: GestureResponderEvent) => void
  onSupressArtwork?: () => void
  priceRealizedDisplay?: string
  showSaveIcon?: boolean
  testID?: string
  hideIncreasedInterestSignal?: boolean
  hideCuratorsPickSignal?: boolean
}

export const ArtworkRailCard: React.FC<ArtworkRailCardProps> = ({
  hideArtistName = false,
  showPartnerName = false,
  dark = false,
  isRecentlySoldArtwork = false,
  lotLabel,
  lowEstimateDisplay,
  highEstimateDisplay,
  metaContainerStyles,
  performanceDisplay,
  onPress,
  onSupressArtwork,
  priceRealizedDisplay,
  showSaveIcon = false,
  testID,
  hideIncreasedInterestSignal = false,
  hideCuratorsPickSignal = false,
  ...restProps
}) => {
  const EXTRALARGE_RAIL_CARD_IMAGE_WIDTH = useExtraLargeWidth()

  const { trackEvent } = useTracking()
  const fontScale = PixelRatio.getFontScale()
  const [showCreateArtworkAlertModal, setShowCreateArtworkAlertModal] = useState(false)
  const artwork = useFragment(artworkFragment, restProps.artwork)

  const AREnablePartnerOfferSignals = useFeatureFlag("AREnablePartnerOfferSignals")
  const AREnableAuctionImprovementsSignals = useFeatureFlag("AREnableAuctionImprovementsSignals")
  const AREnableCuratorsPicksAndInterestSignals = useFeatureFlag(
    "AREnableCuratorsPicksAndInterestSignals"
  )

  const {
    artistNames,
    date,
    image,
    partner,
    title,
    sale,
    saleArtwork,
    isUnlisted,
    collectorSignals,
  } = artwork

  const saleMessage = defaultSaleMessageOrBidInfo({
    artwork,
    isSmallTile: true,
    collectorSignals: AREnablePartnerOfferSignals ? collectorSignals : null,
    auctionSignals: AREnableAuctionImprovementsSignals ? collectorSignals?.auction : null,
  })

  const partnerOfferEndAt = collectorSignals?.partnerOffer?.endAt
    ? formattedTimeLeft(getTimer(collectorSignals.partnerOffer.endAt).time).timerCopy
    : ""

  const extendedBiddingEndAt = saleArtwork?.extendedBiddingEndAt
  const lotEndAt = saleArtwork?.endAt
  const endAt = extendedBiddingEndAt ?? lotEndAt ?? sale?.endAt
  const urgencyTag = sale?.isAuction && !sale?.isClosed ? getUrgencyTag(endAt) : null

  const primaryTextColor = dark ? "white100" : "black100"
  const secondaryTextColor = dark ? "black15" : "black60"
  const backgroundColor = dark ? "black100" : "white100"

  const {
    contextModule,
    contextScreenOwnerType,
    contextScreenOwnerId,
    contextScreenOwnerSlug,
    contextScreen,
  } = restProps

  const getTextHeightByArtworkSize = () => {
    return ARTWORK_RAIL_TEXT_CONTAINER_HEIGHT + (isRecentlySoldArtwork ? 50 : 0)
  }

  const containerWidth = useMemo(() => {
    const imageDimensions = sizeToFit(
      {
        width: image?.resized?.width ?? 0,
        height: image?.resized?.height ?? 0,
      },
      {
        width: isRecentlySoldArtwork
          ? EXTRALARGE_RAIL_CARD_IMAGE_WIDTH
          : ARTWORK_LARGE_RAIL_CARD_IMAGE_WIDTH,
        height: ARTWORK_RAIL_CARD_IMAGE_HEIGHT,
      }
    )

    const SMALL_RAIL_IMAGE_WIDTH = 155

    if (imageDimensions.width <= SMALL_RAIL_IMAGE_WIDTH) {
      return SMALL_RAIL_IMAGE_WIDTH
    } else if (imageDimensions.width >= ARTWORK_RAIL_IMAGE_WIDTH) {
      return ARTWORK_RAIL_IMAGE_WIDTH
    } else {
      return imageDimensions.width
    }
  }, [image?.resized?.height, image?.resized?.width])

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
    trackEvent(artworkActionTracks.saveOrUnsaveArtwork(saved, params))
  }

  const supressArtwork = () => {
    onSupressArtwork?.()
  }

  const { isSaved, saveArtworkToLists } = useSaveArtworkToArtworkLists({
    artworkFragmentRef: artwork,
    onCompleted: onArtworkSavedOrUnSaved,
  })

  const displayForRecentlySoldArtwork = !!isRecentlySoldArtwork

  const displayLimitedTimeOfferSignal =
    AREnablePartnerOfferSignals && collectorSignals?.partnerOffer?.isAvailable && !sale?.isAuction

  const displayAuctionSignal = AREnableAuctionImprovementsSignals && sale?.isAuction

  const saleInfoTextColor =
    displayAuctionSignal && collectorSignals?.auction?.liveBiddingStarted
      ? "blue100"
      : primaryTextColor

  const saleInfoTextWeight =
    displayAuctionSignal && collectorSignals?.auction?.liveBiddingStarted ? "normal" : "bold"

  return (
    <AnalyticsContextProvider
      contextScreenOwnerId={contextScreenOwnerId}
      contextScreenOwnerSlug={contextScreenOwnerSlug}
      contextScreenOwnerType={contextScreenOwnerType}
    >
      <ContextMenuArtwork
        contextModule={contextModule}
        contextScreenOwnerType={contextScreenOwnerType}
        onCreateAlertActionPress={() => setShowCreateArtworkAlertModal(true)}
        onSupressArtwork={supressArtwork}
        artwork={artwork}
        artworkDisplayProps={{
          dark,
          showPartnerName,
          hideArtistName,
          isRecentlySoldArtwork,
          lotLabel,
          lowEstimateDisplay,
          highEstimateDisplay,
          performanceDisplay,
          priceRealizedDisplay,
        }}
      >
        <TouchableHighlight
          underlayColor={backgroundColor}
          activeOpacity={0.8}
          onPress={onPress}
          testID={testID}
        >
          <Flex backgroundColor={backgroundColor}>
            <ArtworkRailCardImage
              containerWidth={containerWidth}
              image={image}
              urgencyTag={!displayAuctionSignal ? urgencyTag : null}
              imageHeightExtra={
                displayForRecentlySoldArtwork
                  ? getTextHeightByArtworkSize() - ARTWORK_RAIL_TEXT_CONTAINER_HEIGHT
                  : undefined
              }
            />
            <Flex
              my={1}
              width={containerWidth}
              // Recently sold artworks require more space for the text container
              // to accommodate the estimate and realized price
              style={{
                height: fontScale * getTextHeightByArtworkSize(),
                ...metaContainerStyles,
              }}
              backgroundColor={backgroundColor}
              flexDirection="row"
              justifyContent="space-between"
            >
              <Flex flex={1} backgroundColor={backgroundColor}>
                {!!displayLimitedTimeOfferSignal && (
                  <Box backgroundColor="blue10" px={0.5} alignSelf="flex-start" borderRadius={3}>
                    <Text lineHeight="20px" variant="xs" color="blue100">
                      Limited-Time Offer
                    </Text>
                  </Box>
                )}
                {!sale?.isAuction &&
                  !displayLimitedTimeOfferSignal &&
                  !!collectorSignals &&
                  !!AREnableCuratorsPicksAndInterestSignals && (
                    <ArtworkSocialSignal
                      collectorSignals={collectorSignals}
                      hideCuratorsPick={hideCuratorsPickSignal}
                      hideIncreasedInterest={hideIncreasedInterestSignal}
                      dark={dark}
                    />
                  )}
                {!!lotLabel && (
                  <Text lineHeight="20px" color={secondaryTextColor} numberOfLines={1}>
                    Lot {lotLabel}
                  </Text>
                )}
                {!hideArtistName && !!artistNames && (
                  <Text
                    color={primaryTextColor}
                    numberOfLines={1}
                    lineHeight={displayForRecentlySoldArtwork ? undefined : "20px"}
                    variant={displayForRecentlySoldArtwork ? "md" : "xs"}
                  >
                    {artistNames}
                  </Text>
                )}
                {!!title && (
                  <Text
                    lineHeight={displayForRecentlySoldArtwork ? undefined : "20px"}
                    color={displayForRecentlySoldArtwork ? undefined : secondaryTextColor}
                    numberOfLines={1}
                    variant="xs"
                    fontStyle={displayForRecentlySoldArtwork ? undefined : "italic"}
                  >
                    {title}
                    {!!date && (
                      <Text
                        lineHeight={displayForRecentlySoldArtwork ? undefined : "20px"}
                        color={displayForRecentlySoldArtwork ? undefined : secondaryTextColor}
                        numberOfLines={1}
                        variant="xs"
                      >
                        {title && date ? ", " : ""}
                        {date}
                      </Text>
                    )}
                  </Text>
                )}

                {!!showPartnerName && !!partner?.name && (
                  <Text lineHeight="20px" variant="xs" color={secondaryTextColor} numberOfLines={1}>
                    {partner?.name}
                  </Text>
                )}

                {!!isRecentlySoldArtwork && (
                  <RecentlySoldCardSection
                    priceRealizedDisplay={priceRealizedDisplay}
                    lowEstimateDisplay={lowEstimateDisplay}
                    highEstimateDisplay={highEstimateDisplay}
                    performanceDisplay={performanceDisplay}
                    secondaryTextColor={secondaryTextColor}
                  />
                )}

                {!!saleMessage && !isRecentlySoldArtwork && (
                  <Text
                    lineHeight="20px"
                    variant="xs"
                    color={saleInfoTextColor}
                    numberOfLines={1}
                    fontWeight={saleInfoTextWeight}
                  >
                    {saleMessage}
                    {!!displayLimitedTimeOfferSignal && (
                      <Text
                        lineHeight="20px"
                        variant="xs"
                        fontWeight="normal"
                        color="blue100"
                        numberOfLines={1}
                      >
                        {"  "}
                        Exp. {partnerOfferEndAt}
                      </Text>
                    )}
                  </Text>
                )}

                {!!isUnlisted && (
                  <Text
                    lineHeight="20px"
                    variant="xs"
                    color={primaryTextColor}
                    numberOfLines={1}
                    fontWeight="bold"
                  >
                    Exclusive Access
                  </Text>
                )}

                {!!displayAuctionSignal && !!collectorSignals && (
                  <ArtworkAuctionTimer collectorSignals={collectorSignals} inRailCard />
                )}
              </Flex>
              {!!showSaveIcon && (
                <Flex flexDirection="row" alignItems="flex-start">
                  {!!displayAuctionSignal && !!collectorSignals?.auction?.lotWatcherCount && (
                    <Text lineHeight="20px" variant="xs" numberOfLines={1}>
                      {collectorSignals.auction.lotWatcherCount}
                    </Text>
                  )}
                  <Touchable
                    haptic
                    hitSlop={{ bottom: 5, right: 5, left: 5, top: 5 }}
                    onPress={saveArtworkToLists}
                    testID="save-artwork-icon"
                    underlayColor={backgroundColor}
                  >
                    {isSaved ? (
                      <HeartFillIcon
                        testID="filled-heart-icon"
                        height={HEART_ICON_SIZE}
                        width={HEART_ICON_SIZE}
                        fill="blue100"
                      />
                    ) : (
                      <HeartIcon
                        testID="empty-heart-icon"
                        height={HEART_ICON_SIZE}
                        width={HEART_ICON_SIZE}
                        fill={primaryTextColor}
                      />
                    )}
                  </Touchable>
                </Flex>
              )}
            </Flex>
          </Flex>
        </TouchableHighlight>
      </ContextMenuArtwork>

      <CreateArtworkAlertModal
        artwork={artwork}
        onClose={() => setShowCreateArtworkAlertModal(false)}
        visible={showCreateArtworkAlertModal}
      />
    </AnalyticsContextProvider>
  )
}

export interface ArtworkRailCardImageProps {
  image: ArtworkRailCard_artwork$data["image"]
  urgencyTag?: string | null
  containerWidth?: number | null
  isRecentlySoldArtwork?: boolean
  /** imageHeightExtra is an optional padding value you might want to add to image height
   * When using large width like with RecentlySold, image appears cropped
   * TODO: - Investigate why
   */
  imageHeightExtra?: number
}

const ArtworkRailCardImage: React.FC<ArtworkRailCardImageProps> = ({
  image,
  urgencyTag = null,
  containerWidth,
  isRecentlySoldArtwork,
  imageHeightExtra = 0,
}) => {
  const color = useColor()
  const EXTRALARGE_RAIL_CARD_IMAGE_WIDTH = useExtraLargeWidth()
  const showBlurhash = useFeatureFlag("ARShowBlurhashImagePlaceholder")

  if (!containerWidth) {
    return null
  }

  const { width, height, src } = image?.resized || {}

  if (!src) {
    return (
      <Flex
        bg={color("black30")}
        width={width}
        height={ARTWORK_RAIL_CARD_IMAGE_HEIGHT}
        style={{ borderRadius: 2 }}
      />
    )
  }

  const containerDimensions = isRecentlySoldArtwork
    ? {
        width: EXTRALARGE_RAIL_CARD_IMAGE_WIDTH,
        height: ARTWORK_RAIL_CARD_IMAGE_HEIGHT,
      }
    : {
        width: ARTWORK_LARGE_RAIL_CARD_IMAGE_WIDTH,
        height: ARTWORK_RAIL_CARD_IMAGE_HEIGHT,
      }

  const imageDimensions = sizeToFit(
    {
      width: width ?? 0,
      height: height ?? 0,
    },
    containerDimensions
  )

  const imageHeight = imageDimensions.height
    ? imageDimensions.height + imageHeightExtra
    : ARTWORK_RAIL_CARD_IMAGE_HEIGHT

  return (
    <Flex>
      <Image
        src={src}
        width={containerWidth}
        height={imageHeight}
        blurhash={showBlurhash ? image?.blurhash : undefined}
      />

      {!!urgencyTag && (
        <Flex
          testID="auction-urgency-tag"
          backgroundColor={color("white100")}
          position="absolute"
          px="5px"
          py="3px"
          bottom="5px"
          left="5px"
          borderRadius={2}
          alignSelf="flex-start"
        >
          <Text variant="xs" color={color("black100")} numberOfLines={1}>
            {urgencyTag}
          </Text>
        </Flex>
      )}
    </Flex>
  )
}

export const RecentlySoldCardSection: React.FC<
  Pick<
    ArtworkRailCardProps,
    "priceRealizedDisplay" | "lowEstimateDisplay" | "highEstimateDisplay" | "performanceDisplay"
  > & { secondaryTextColor: string }
> = ({ priceRealizedDisplay, lowEstimateDisplay, highEstimateDisplay, performanceDisplay }) => {
  return (
    <Flex>
      <Flex flexDirection="row" justifyContent="space-between" mt={1}>
        <Text variant="lg-display" numberOfLines={1}>
          {priceRealizedDisplay}
        </Text>
        {!!performanceDisplay && (
          <Text variant="lg-display" color="green" numberOfLines={1}>
            {`+${performanceDisplay}`}
          </Text>
        )}
      </Flex>
      <Text variant="xs" color="black60" lineHeight="20px">
        Estimate {compact([lowEstimateDisplay, highEstimateDisplay]).join("—")}
      </Text>
    </Flex>
  )
}

const artworkFragment = graphql`
  fragment ArtworkRailCard_artwork on Artwork @argumentDefinitions(width: { type: "Int" }) {
    ...CreateArtworkAlertModal_artwork
    id
    internalID
    availability
    slug
    isAcquireable
    isBiddable
    isInquireable
    isOfferable
    href
    artistNames
    artists(shallow: true) {
      name
    }
    widthCm
    heightCm
    isHangable
    date
    image {
      blurhash
      url(version: "large")
      resized(width: $width) {
        src
        srcSet
        width
        height
      }
      aspectRatio
    }
    isUnlisted
    sale {
      isAuction
      isClosed
      endAt
    }
    saleMessage
    saleArtwork {
      counts {
        bidderPositions
      }
      currentBid {
        display
      }
      endAt
      extendedBiddingEndAt
    }
    partner {
      name
    }
    title
    realizedPrice
    collectorSignals {
      primaryLabel
      partnerOffer {
        isAvailable
        endAt
        priceWithDiscount {
          display
        }
      }
      auction {
        lotWatcherCount
        bidCount
        liveBiddingStarted
        lotClosesAt
      }
      ...ArtworkAuctionTimer_collectorSignals
      ...ArtworkSocialSignal_collectorSignals
    }
    ...useSaveArtworkToArtworkLists_artwork
  }
`
