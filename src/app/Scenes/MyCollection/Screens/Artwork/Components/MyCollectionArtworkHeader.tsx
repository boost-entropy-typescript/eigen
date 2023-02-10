import { tappedCollectedArtworkImages } from "@artsy/cohesion"
import { useColor, Join, Spacer, Flex, NoImageIcon, Text } from "@artsy/palette-mobile"
import { MyCollectionArtworkHeader_artwork$key } from "__generated__/MyCollectionArtworkHeader_artwork.graphql"
import { ImageCarouselFragmentContainer } from "app/Scenes/Artwork/Components/ImageCarousel/ImageCarousel"
import { navigate } from "app/system/navigation/navigate"
import { TouchableOpacity } from "react-native"
import { graphql, useFragment } from "react-relay"
import { useTracking } from "react-tracking"
import { useScreenDimensions } from "shared/hooks"
import { MyCollectionArtworkSubmissionStatus } from "./MyCollectionArtworkSubmissionStatus"

const NO_ARTIST_NAMES_TEXT = "-"

interface MyCollectionArtworkHeaderProps {
  artwork: MyCollectionArtworkHeader_artwork$key
}

export const MyCollectionArtworkHeader: React.FC<MyCollectionArtworkHeaderProps> = (props) => {
  const artwork = useFragment(myCollectionArtworkHeaderFragment, props.artwork)
  const { artistNames, date, internalID, title, slug, consignmentSubmission } = artwork

  const dimensions = useScreenDimensions()

  const color = useColor()

  const { trackEvent } = useTracking()

  const hasImages = artwork?.figures?.length > 0

  return (
    <Join separator={<Spacer y={1} />}>
      {hasImages ? (
        <ImageCarouselFragmentContainer
          figures={artwork?.figures}
          cardHeight={dimensions.height / 3.5}
          onImagePressed={() => trackEvent(tracks.tappedCollectedArtworkImages(internalID, slug))}
        />
      ) : (
        <Flex
          testID="MyCollectionArtworkHeaderFallback"
          bg={color("black5")}
          height={dimensions.height / 3.5}
          justifyContent="center"
          mx={20}
        >
          <NoImageIcon fill="black60" mx="auto" />
        </Flex>
      )}

      {/* Image Meta */}

      <Flex px={2}>
        {artwork?.artist?.isPersonalArtist ? (
          <Text variant="lg-display">{artistNames ?? NO_ARTIST_NAMES_TEXT}</Text>
        ) : (
          <TouchableOpacity onPress={() => navigate(artwork?.artist?.href!)}>
            <Text variant="lg-display">{artistNames ?? NO_ARTIST_NAMES_TEXT}</Text>
          </TouchableOpacity>
        )}
        <Text variant="lg-display" color="black60">
          <Text variant="lg-display" color="black60" italic>
            {title}
          </Text>
          {!!date && `, ${date}`}
        </Text>
      </Flex>

      {!!consignmentSubmission?.displayText && (
        <Flex px={2} mt={2}>
          <MyCollectionArtworkSubmissionStatus displayText={consignmentSubmission?.displayText} />
        </Flex>
      )}

      {/* Extra Bottom Space */}
      <></>
    </Join>
  )
}

const myCollectionArtworkHeaderFragment = graphql`
  fragment MyCollectionArtworkHeader_artwork on Artwork {
    artist {
      href
      isPersonalArtist
    }
    artistNames
    date
    figures(includeAll: true) {
      ...ImageCarousel_figures
    }
    internalID
    slug
    title
    consignmentSubmission {
      displayText
    }
    submissionId
  }
`

const tracks = {
  tappedCollectedArtworkImages: (internalID: string, slug: string) => {
    return tappedCollectedArtworkImages({ contextOwnerId: internalID, contextOwnerSlug: slug })
  },
}
