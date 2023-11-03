import { Spacer, Flex, Text } from "@artsy/palette-mobile"
import { ArtQuizTrendingCollection_collection$key } from "__generated__/ArtQuizTrendingCollection_collection.graphql"
import { ArtQuizTrendingCollections_viewer$data } from "__generated__/ArtQuizTrendingCollections_viewer.graphql"
import { SmallArtworkRail } from "app/Components/ArtworkRail/SmallArtworkRail"
import { ReadMore } from "app/Components/ReadMore"
import { navigate } from "app/system/navigation/navigate"
import { extractNodes } from "app/utils/extractNodes"
import { truncatedTextLimit } from "app/utils/hardware"
import { graphql, useFragment } from "react-relay"

export const ArtQuizTrendingCollection = ({
  collectionData,
}: {
  collectionData: NonNullable<ArtQuizTrendingCollections_viewer$data["marketingCollections"]>[0]
}) => {
  const textLimit = truncatedTextLimit()
  const collection = useFragment<ArtQuizTrendingCollection_collection$key>(
    artQuizTrendingCollectionFragment,
    collectionData
  )

  const artworks = extractNodes(collection?.artworksConnection)

  if (artworks.length === 0) return null

  return (
    <Flex pt={2}>
      <Flex>
        <Text variant="md">{collection?.title}</Text>
        {!!collection?.descriptionMarkdown && (
          <ReadMore
            content={collection.descriptionMarkdown}
            maxChars={textLimit}
            textStyle="new"
            color="black60"
            textVariant="sm"
            linkTextVariant="sm"
          />
        )}
      </Flex>
      <Spacer y={1} />
      <SmallArtworkRail
        artworks={artworks}
        onPress={(artwork) => {
          if (artwork?.href) {
            navigate(artwork.href)
          }
        }}
      />
    </Flex>
  )
}

const artQuizTrendingCollectionFragment = graphql`
  fragment ArtQuizTrendingCollection_collection on MarketingCollection {
    title
    descriptionMarkdown
    artworksConnection(first: 16) {
      edges {
        node {
          ...SmallArtworkRail_artworks
        }
      }
    }
  }
`
