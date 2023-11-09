import { SearchArtworksContainerQuery } from "__generated__/SearchArtworksContainerQuery.graphql"
import { ArtworkFiltersStoreProvider } from "app/Components/ArtworkFilter/ArtworkFilterStore"
import { LoadFailureView } from "app/Components/LoadFailureView"
import { getRelayEnvironment } from "app/system/relay/defaultEnvironment"
import { renderWithPlaceholder } from "app/utils/renderWithPlaceholder"
import { graphql, QueryRenderer } from "react-relay"
import { SearchArtworksGridPaginationContainer } from "./SearchArtworksGrid"
import { SearchArtworksGridPlaceholder } from "./components/placeholders/SearchArtworksGridPlaceholder"

export const SearchArtworksQueryRenderer: React.FC<{ keyword: string }> = ({ keyword }) => {
  return (
    <ArtworkFiltersStoreProvider>
      <QueryRenderer<SearchArtworksContainerQuery>
        environment={getRelayEnvironment()}
        query={graphql`
          query SearchArtworksContainerQuery($count: Int!, $cursor: String, $keyword: String) {
            viewer {
              ...SearchArtworksGrid_viewer
                @arguments(count: $count, cursor: $cursor, keyword: $keyword)
            }
          }
        `}
        render={renderWithPlaceholder({
          Container: SearchArtworksGridPaginationContainer,
          renderPlaceholder: () => <SearchArtworksGridPlaceholder />,
          initialProps: { keyword },
          renderFallback: ({ retry }) => <LoadFailureView onRetry={retry || (() => {})} />,
        })}
        variables={{ count: 10, keyword }}
        cacheConfig={{ force: true }}
      />
    </ArtworkFiltersStoreProvider>
  )
}
