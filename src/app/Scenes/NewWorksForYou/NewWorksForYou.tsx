import { OwnerType } from "@artsy/cohesion"
import { Spacer } from "@artsy/palette-mobile"
import { NewWorksForYouQuery } from "__generated__/NewWorksForYouQuery.graphql"
import { NewWorksForYou_viewer$data } from "__generated__/NewWorksForYou_viewer.graphql"
import { InfiniteScrollArtworksGridContainer } from "app/Components/ArtworkGrids/InfiniteScrollArtworksGrid"
import { PageWithSimpleHeader } from "app/Components/PageWithSimpleHeader"
import { defaultEnvironment } from "app/system/relay/createEnvironment"
import { useExperimentVariant } from "app/utils/experiments/hooks"
import { maybeReportExperimentVariant } from "app/utils/experiments/reporter"
import { PlaceholderGrid, ProvidePlaceholderContext } from "app/utils/placeholders"
import { renderWithPlaceholder } from "app/utils/renderWithPlaceholder"
import { ProvideScreenTrackingWithCohesionSchema } from "app/utils/track"
import { screen } from "app/utils/track/helpers"
import { Box, SimpleMessage } from "palette"
import { useEffect } from "react"
import { createPaginationContainer, graphql, QueryRenderer, RelayPaginationProp } from "react-relay"

const SCREEN_TITLE = "New Works for You"
const PAGE_SIZE = 100
export const RECOMMENDATION_MODEL_EXPERIMENT_NAME = "eigen-new-works-for-you-recommendations-model"
export const DEFAULT_RECS_MODEL_VERSION = "B"

interface NewWorksForYouProps {
  relay: RelayPaginationProp
  viewer: NewWorksForYou_viewer$data
}

const NewWorksForYou: React.FC<NewWorksForYouProps> = ({ viewer }) => {
  return (
    <ProvideScreenTrackingWithCohesionSchema
      info={screen({ context_screen_owner_type: OwnerType.newWorksForYou })}
    >
      <PageWithSimpleHeader title={SCREEN_TITLE}>
        <Box>
          {!!viewer.artworks?.edges?.length ? (
            <InfiniteScrollArtworksGridContainer
              connection={viewer.artworks!}
              loadMore={() => null}
              hasMore={() => false}
              pageSize={PAGE_SIZE}
              contextScreenOwnerType={OwnerType.newWorksForYou}
              HeaderComponent={<Spacer mt={2} />}
              shouldAddPadding
              showLoadingSpinner
              useParentAwareScrollView={false}
            />
          ) : (
            <SimpleMessage m={2}>Nothing yet. Please check back later.</SimpleMessage>
          )}
        </Box>
      </PageWithSimpleHeader>
    </ProvideScreenTrackingWithCohesionSchema>
  )
}

export const NewWorksForYouFragmentContainer = createPaginationContainer(
  NewWorksForYou,
  {
    viewer: graphql`
      fragment NewWorksForYou_viewer on Viewer
      @argumentDefinitions(count: { type: "Int", defaultValue: 100 }, cursor: { type: "String" }) {
        artworks: artworksForUser(
          after: $cursor
          first: $count
          includeBackfill: true
          maxWorksPerArtist: 3
          version: $worksForYouRecommendationsModelVariant
        ) @connection(key: "NewWorksForYou_artworks") {
          edges {
            node {
              id
            }
          }
          ...InfiniteScrollArtworksGrid_connection
        }
      }
    `,
  },
  {
    getConnectionFromProps(props) {
      return props?.viewer?.artworks
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      }
    },
    getVariables(_props, { count, cursor }, fragmentVariables) {
      return {
        ...fragmentVariables,
        cursor,
        count,
      }
    },
    query: graphql`
      query NewWorksForYouRefetchQuery(
        $cursor: String
        $count: Int!
        $worksForYouRecommendationsModelVariant: String!
      ) {
        viewer {
          ...NewWorksForYou_viewer @arguments(cursor: $cursor, count: $count)
        }
      }
    `,
  }
)

export const NewWorksForYouScreenQuery = graphql`
  query NewWorksForYouQuery($worksForYouRecommendationsModelVariant: String!) {
    viewer {
      ...NewWorksForYou_viewer
    }
  }
`

export const NewWorksForYouQueryRenderer: React.FC = () => {
  const worksForYouRecommendationsModel = useExperimentVariant(RECOMMENDATION_MODEL_EXPERIMENT_NAME)

  useEffect(() => {
    maybeReportExperimentVariant({
      experimentName: RECOMMENDATION_MODEL_EXPERIMENT_NAME,
      enabled: worksForYouRecommendationsModel.enabled,
      variantName: worksForYouRecommendationsModel.variant,
      payload: worksForYouRecommendationsModel.payload,
      context_owner_type: OwnerType.newWorksForYou,
      context_owner_screen: OwnerType.newWorksForYou,
      storeContext: true,
    })
  }, [])

  return (
    <QueryRenderer<NewWorksForYouQuery>
      environment={defaultEnvironment}
      query={NewWorksForYouScreenQuery}
      variables={{
        worksForYouRecommendationsModelVariant:
          worksForYouRecommendationsModel.payload || DEFAULT_RECS_MODEL_VERSION,
      }}
      render={renderWithPlaceholder({
        Container: NewWorksForYouFragmentContainer,
        renderPlaceholder: Placeholder,
        renderFallback: () => null,
      })}
    />
  )
}

const Placeholder = () => {
  return (
    <ProvidePlaceholderContext>
      <PageWithSimpleHeader title={SCREEN_TITLE}>
        <Spacer mt={2} />
        <PlaceholderGrid />
      </PageWithSimpleHeader>
    </ProvidePlaceholderContext>
  )
}
