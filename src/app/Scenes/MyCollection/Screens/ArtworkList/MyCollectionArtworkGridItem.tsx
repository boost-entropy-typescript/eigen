import { tappedCollectedArtwork } from "@artsy/cohesion"
import { Flex, Box, Text, Popover } from "@artsy/palette-mobile"
import { themeGet } from "@styled-system/theme-get"
import { MyCollectionArtworkGridItem_artwork$data } from "__generated__/MyCollectionArtworkGridItem_artwork.graphql"
import { DEFAULT_SECTION_MARGIN } from "app/Components/ArtworkGrids/InfiniteScrollArtworksGrid"
import HighDemandIcon from "app/Components/Icons/HighDemandIcon"
import { useSetActivePopover } from "app/Components/ProgressiveOnboarding/useSetActivePopover"
import { MyCollectionImageView } from "app/Scenes/MyCollection/Components/MyCollectionImageView"
import { GlobalStore } from "app/store/GlobalStore"
import { PROGRESSIVE_ONBOARDING_MY_COLLECTION_SELL_THIS_WORK } from "app/store/ProgressiveOnboardingModel"
import { navigate } from "app/system/navigation/navigate"
import { useLocalImage } from "app/utils/LocalImageStore"
import { useScreenDimensions } from "app/utils/hooks"
import { useFeatureFlag } from "app/utils/hooks/useFeatureFlag"
import { View } from "react-native"
import { isTablet } from "react-native-device-info"
import { createFragmentContainer, graphql } from "react-relay"
import { useTracking } from "react-tracking"
import styled from "styled-components/native"

interface MyCollectionArtworkGridItemProps {
  artwork: MyCollectionArtworkGridItem_artwork$data
  displayToolTip?: boolean
}

const MyCollectionArtworkGridItem: React.FC<MyCollectionArtworkGridItemProps> = ({
  artwork,
  displayToolTip,
}) => {
  const { trackEvent } = useTracking()
  const displayImage = artwork.images?.find((i: any) => i?.isDefault) || artwork.images?.[0]
  const { width } = useScreenDimensions()
  const showBlurhash = useFeatureFlag("ARShowBlurhashImagePlaceholder")

  const localImage = useLocalImage(displayImage)

  const {
    artist,
    artistNames,
    internalID,
    medium,
    mediumType,
    slug,
    title,
    image,
    date,
    submissionId,
  } = artwork

  // consistent with how sections are derived in InfiniteScrollArtworksGrid
  const screen = useScreenDimensions()
  const sectionCount = isTablet() ? 3 : 2
  const imageWidth = (screen.width - DEFAULT_SECTION_MARGIN * (sectionCount + 1)) / sectionCount

  const isP1Artist = artwork.artist?.targetSupply?.isP1
  const isHighDemand = Number((artwork.marketPriceInsights?.demandRank || 0) * 10) >= 9

  const showHighDemandIcon = isP1Artist && isHighDemand

  const { dismiss } = GlobalStore.actions.progressiveOnboarding
  const { isActive, clearActivePopover } = useSetActivePopover(!!displayToolTip)

  const handleDismissPopover = () => {
    dismiss(PROGRESSIVE_ONBOARDING_MY_COLLECTION_SELL_THIS_WORK)
  }

  return (
    <TouchElement
      accessibilityLabel="Go to artwork details"
      accessibilityRole="link"
      onPress={() => {
        if (!!artist) {
          trackEvent(tracks.tappedCollectedArtwork(internalID, slug))
          navigate("/my-collection/artwork/" + slug, {
            passProps: {
              medium,
              category: mediumType?.name,
              artistInternalID: artist.internalID,
            },
          })
        } else {
          console.warn("MyCollectionArtworkGridItem: Error: Missing artist.artistID")
        }
      }}
    >
      <Popover
        visible={!!displayToolTip && isActive}
        onDismiss={handleDismissPopover}
        onPressOutside={handleDismissPopover}
        onCloseComplete={clearActivePopover}
        placement="top"
        title={
          <Text variant="xs" color="white100" fontWeight="500">
            Interested in Selling This Work?
          </Text>
        }
        content={
          <Text variant="xs" color="white100">
            Let our experts find the best sales option for you.
          </Text>
        }
      >
        <View>
          <MyCollectionImageView
            imageWidth={imageWidth}
            imageURL={(localImage?.path || displayImage?.url) ?? undefined}
            aspectRatio={localImage?.aspectRatio || image?.aspectRatio}
            artworkSlug={slug}
            artworkSubmissionId={submissionId}
            useRawURL={!!localImage}
            blurhash={showBlurhash ? image?.blurhash : undefined}
          />
          <Box maxWidth={width} mt={1} style={{ flex: 1 }}>
            <Text lineHeight="18px" weight="regular" variant="xs" numberOfLines={2}>
              {artistNames}
              {!!showHighDemandIcon && (
                <Flex testID="test-high-demand-icon">
                  <HighDemandIcon style={{ marginLeft: 2, marginBottom: -2 }} />
                </Flex>
              )}
            </Text>
            {!!title ? (
              <Text
                lineHeight="18px"
                variant="xs"
                weight="regular"
                numberOfLines={1}
                color="black60"
              >
                <Text lineHeight="18px" variant="xs" weight="regular" italic>
                  {title}
                </Text>
                {date ? `, ${date}` : ""}
              </Text>
            ) : null}
          </Box>
        </View>
      </Popover>
    </TouchElement>
  )
}

export const MyCollectionArtworkGridItemFragmentContainer = createFragmentContainer(
  MyCollectionArtworkGridItem,
  {
    artwork: graphql`
      fragment MyCollectionArtworkGridItem_artwork on Artwork
      @argumentDefinitions(includeAllImages: { type: "Boolean", defaultValue: false }) {
        internalID
        artist {
          internalID
          targetSupply {
            isP1
          }
        }
        mediumType {
          name
        }
        images(includeAll: $includeAllImages) {
          url
          isDefault
          internalID
          versions
          blurhash
        }
        image(includeAll: $includeAllImages) {
          internalID
          aspectRatio
          versions
          blurhash
        }
        artistNames
        medium
        slug
        submissionId
        title
        date
        marketPriceInsights {
          demandRank
        }
      }
    `,
  }
)

const TouchElement = styled.TouchableHighlight.attrs(() => ({
  underlayColor: themeGet("colors.white100"),
  activeOpacity: 0.8,
}))``

export const tests = {
  TouchElement,
}

const tracks = {
  tappedCollectedArtwork: (targetID: string, targetSlug: string) => {
    return tappedCollectedArtwork({
      destinationOwnerId: targetID,
      destinationOwnerSlug: targetSlug,
    })
  },
}
