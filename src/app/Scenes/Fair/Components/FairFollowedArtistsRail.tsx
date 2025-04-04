import { ActionType, ContextModule, OwnerType } from "@artsy/cohesion"
import { Flex } from "@artsy/palette-mobile"
import { FairFollowedArtistsRail_fair$data } from "__generated__/FairFollowedArtistsRail_fair.graphql"
import { ArtworkRail } from "app/Components/ArtworkRail/ArtworkRail"
import { SectionTitle } from "app/Components/SectionTitle"
import { extractNodes } from "app/utils/extractNodes"
import {
  CollectorSignals,
  getArtworkSignalTrackingFields,
} from "app/utils/getArtworkSignalTrackingFields"
import { createFragmentContainer, graphql } from "react-relay"
import { useTracking } from "react-tracking"

interface FairFollowedArtistsRailProps {
  fair: FairFollowedArtistsRail_fair$data
}

export const FairFollowedArtistsRail: React.FC<FairFollowedArtistsRailProps> = ({ fair }) => {
  const { trackEvent } = useTracking()
  const artworks = extractNodes(fair?.filterArtworksConnection)

  if (!artworks.length) {
    return null
  }

  return (
    <>
      <Flex>
        <SectionTitle
          title="Works by artists you follow"
          href={artworks.length > 2 ? `/fair/${fair.slug}/followedArtists` : undefined}
          onPress={
            artworks.length > 2
              ? () => {
                  trackEvent(tracks.tappedViewAll(fair))
                }
              : undefined
          }
        />
      </Flex>
      <ArtworkRail
        artworks={artworks}
        onPress={(artwork, position) => {
          trackEvent(
            tracks.tappedArtwork(
              fair,
              artwork?.internalID ?? "",
              artwork?.slug ?? "",
              position,
              artwork.collectorSignals
            )
          )
        }}
      />
    </>
  )
}

export const FairFollowedArtistsRailFragmentContainer = createFragmentContainer(
  FairFollowedArtistsRail,
  {
    fair: graphql`
      fragment FairFollowedArtistsRail_fair on Fair {
        internalID
        slug
        filterArtworksConnection(first: 20, input: { includeArtworksByFollowedArtists: true }) {
          edges {
            node {
              ...ArtworkRail_artworks
            }
          }
        }
      }
    `,
  }
)

const tracks = {
  tappedArtwork: (
    fair: FairFollowedArtistsRail_fair$data,
    artworkID: string,
    artworkSlug: string,
    position: number,
    collectorSignals: CollectorSignals
  ) => ({
    action: ActionType.tappedArtworkGroup,
    context_module: ContextModule.worksByArtistsYouFollowRail,
    context_screen_owner_type: OwnerType.fair,
    context_screen_owner_id: fair.internalID,
    context_screen_owner_slug: fair.slug,
    destination_screen_owner_type: OwnerType.artwork,
    destination_screen_owner_id: artworkID,
    destination_screen_owner_slug: artworkSlug,
    horizontal_slide_position: position,
    type: "thumbnail",
    ...getArtworkSignalTrackingFields(collectorSignals),
  }),
  tappedViewAll: (fair: FairFollowedArtistsRail_fair$data) => ({
    action: ActionType.tappedArtworkGroup,
    context_module: ContextModule.worksByArtistsYouFollowRail,
    context_screen_owner_type: OwnerType.fair,
    context_screen_owner_id: fair.internalID,
    context_screen_owner_slug: fair.slug,
    destination_screen_owner_type: OwnerType.fairArtworks,
    type: "viewAll",
  }),
}
