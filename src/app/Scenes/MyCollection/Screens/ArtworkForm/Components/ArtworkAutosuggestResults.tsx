import { Flex } from "@artsy/palette-mobile"
import { ArtworkAutosuggestResultsContainerQuery } from "__generated__/ArtworkAutosuggestResultsContainerQuery.graphql"
import { ArtworkAutosuggestResults_viewer$data } from "__generated__/ArtworkAutosuggestResults_viewer.graphql"
import { GenericGridPlaceholder } from "app/Components/ArtworkGrids/GenericGrid"
import { InfiniteScrollArtworksGridContainer } from "app/Components/ArtworkGrids/InfiniteScrollArtworksGrid"
import { LoadFailureView } from "app/Components/LoadFailureView"
import { getRelayEnvironment } from "app/system/relay/defaultEnvironment"
import { useScreenDimensions } from "app/utils/hooks"
import { renderWithPlaceholder } from "app/utils/renderWithPlaceholder"
import React, { useEffect } from "react"
import { createPaginationContainer, graphql, QueryRenderer, RelayPaginationProp } from "react-relay"

export interface ArtworkAutosuggestResultsProps {
  viewer: ArtworkAutosuggestResults_viewer$data
  relay: RelayPaginationProp
  keyword: string
  onPress?: (artworkID: string) => void
  setShowSkipAheadToAddArtworkLink: (showSkipAheadLink: boolean) => void
}

const ArtworkAutosuggestResults: React.FC<ArtworkAutosuggestResultsProps> = ({
  viewer,
  relay,
  keyword,
  onPress,
  setShowSkipAheadToAddArtworkLink,
}) => {
  const handlePress = (artworkId: string) => {
    // TODO: Tracking
    onPress?.(artworkId)
  }

  useEffect(() => {
    setShowSkipAheadToAddArtworkLink(!!viewer.artworks?.edges?.length)
  }, [viewer.artworks?.edges?.length])

  return (
    <Flex py={2}>
      <InfiniteScrollArtworksGridContainer
        connection={viewer.artworks!}
        loadMore={relay.loadMore}
        hasMore={relay.hasMore}
        contextScreenQuery={keyword}
        useParentAwareScrollView={false}
        itemComponentProps={{ hideSaleInfo: true, hidePartner: true, onPress: handlePress }}
        hideSaveIcon
      />
    </Flex>
  )
}

export const ArtworkAutosuggestResultsPaginationContainer = createPaginationContainer(
  ArtworkAutosuggestResults,
  {
    viewer: graphql`
      fragment ArtworkAutosuggestResults_viewer on Viewer
      @argumentDefinitions(
        count: { type: "Int", defaultValue: 20 }
        cursor: { type: "String" }
        keyword: { type: "String" }
        input: { type: "FilterArtworksInput" }
      ) {
        artworks: artworksConnection(
          first: $count
          after: $cursor
          keyword: $keyword
          input: $input
        ) @connection(key: "ArtworkAutosuggestResults_artworks") {
          edges {
            node {
              title
              id
              slug
              image(includeAll: false) {
                aspectRatio
              }
            }
          }
          ...InfiniteScrollArtworksGrid_connection
        }
      }
    `,
  },
  {
    getConnectionFromProps(props) {
      return props.viewer && props.viewer.artworks
    },
    getVariables(_props, { count, cursor }, fragmentVariables) {
      return {
        ...fragmentVariables,
        count,
        cursor,
      }
    },
    query: graphql`
      query ArtworkAutosuggestResultsQuery(
        $count: Int!
        $cursor: String
        $keyword: String
        $input: FilterArtworksInput
      ) {
        viewer {
          ...ArtworkAutosuggestResults_viewer
            @arguments(count: $count, cursor: $cursor, keyword: $keyword, input: $input)
        }
      }
    `,
  }
)

export const ArtworkAutosuggestResultsQueryRenderer: React.FC<{
  keyword: string
  artistSlug: string
  onPress?: (artworkId: string) => void
  setShowSkipAheadToAddArtworkLink: (showSkipAheadLink: boolean) => void
}> = ({ keyword, artistSlug, onPress, setShowSkipAheadToAddArtworkLink }) => {
  return (
    <QueryRenderer<ArtworkAutosuggestResultsContainerQuery>
      environment={getRelayEnvironment()}
      query={graphql`
        query ArtworkAutosuggestResultsContainerQuery(
          $count: Int!
          $cursor: String
          $keyword: String
          $input: FilterArtworksInput
        ) {
          viewer {
            ...ArtworkAutosuggestResults_viewer
              @arguments(count: $count, cursor: $cursor, keyword: $keyword, input: $input)
          }
        }
      `}
      render={renderWithPlaceholder({
        Container: ArtworkAutosuggestResultsPaginationContainer,
        renderPlaceholder: () => <ArtworkAutosuggestResultsPlaceholder />,
        initialProps: {
          keyword,
          artistSlug,
          onPress,
          setShowSkipAheadToAddArtworkLink,
        },
        renderFallback: ({ retry }) => <LoadFailureView onRetry={retry!} />,
      })}
      variables={{ count: 20, keyword, input: { artistIDs: [artistSlug] } }}
      cacheConfig={{ force: true }}
    />
  )
}

export const ArtworkAutosuggestResultsPlaceholder: React.FC = () => {
  const screen = useScreenDimensions()

  return (
    <Flex accessibilityLabel="Artwork results are loading" mt={2} mr={2}>
      <GenericGridPlaceholder width={screen.width - 40} />
    </Flex>
  )
}
