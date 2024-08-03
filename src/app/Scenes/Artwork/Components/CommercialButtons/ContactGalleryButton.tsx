import { ActionType, OwnerType, TappedContactGallery } from "@artsy/cohesion"
import { ButtonProps, Button } from "@artsy/palette-mobile"
import { ContactGalleryButton_artwork$key } from "__generated__/ContactGalleryButton_artwork.graphql"
import { InquiryModal_me$key } from "__generated__/InquiryModal_me.graphql"
import { InquiryModal } from "app/Scenes/Artwork/Components/CommercialButtons/InquiryModal"
import {
  ArtworkInquiryContext,
  ArtworkInquiryStateProvider,
} from "app/utils/ArtworkInquiry/ArtworkInquiryStore"
import React from "react"
import { graphql, useFragment } from "react-relay"
import { useTracking } from "react-tracking"

type ContactGalleryButtonProps = Omit<ButtonProps, "children"> & {
  artwork: ContactGalleryButton_artwork$key
  me: InquiryModal_me$key
}

export const ContactGalleryButton: React.FC<ContactGalleryButtonProps> = ({
  artwork,
  me,
  ...rest
}) => {
  const artworkData = useFragment(artworkFragment, artwork)

  const { trackEvent } = useTracking()

  return (
    <ArtworkInquiryStateProvider>
      <ArtworkInquiryContext.Consumer>
        {({ dispatch }) => (
          <Button
            onPress={() => {
              trackEvent(tracks.trackTappedContactGallery(artworkData.internalID, artworkData.slug))
              dispatch({ type: "setInquiryModalVisible", payload: true })
            }}
            haptic
            {...rest}
          >
            Contact Gallery
          </Button>
        )}
      </ArtworkInquiryContext.Consumer>
      <InquiryModal artwork={artworkData} me={me} />
    </ArtworkInquiryStateProvider>
  )
}

const tracks = {
  trackTappedContactGallery: (artworkId: string, artworkSlug: string): TappedContactGallery => ({
    action: ActionType.tappedContactGallery,
    context_owner_type: OwnerType.artwork,
    context_owner_id: artworkId,
    context_owner_slug: artworkSlug,
  }),
}

const artworkFragment = graphql`
  fragment ContactGalleryButton_artwork on Artwork {
    internalID
    slug
    ...InquiryModal_artwork
  }
`
