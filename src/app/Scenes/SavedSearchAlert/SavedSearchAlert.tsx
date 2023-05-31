import { SavedSearchAlertQuery } from "__generated__/SavedSearchAlertQuery.graphql"
import { getRelayEnvironment } from "app/system/relay/defaultEnvironment"
import { graphql, QueryRenderer } from "react-relay"

interface SearchCriteriaAlertBaseProps {
  savedSearchAlertId: string
  render: (renderProps: {
    error: Error | null
    props: SavedSearchAlertQuery["response"] | null
    retry: (() => void) | null
  }) => React.ReactNode
}

export const SavedSearchAlertQueryRenderer: React.FC<SearchCriteriaAlertBaseProps> = (props) => {
  const { savedSearchAlertId, render } = props

  return (
    <QueryRenderer<SavedSearchAlertQuery>
      environment={getRelayEnvironment()}
      query={graphql`
        query SavedSearchAlertQuery($savedSearchAlertId: ID!) {
          me {
            savedSearch(id: $savedSearchAlertId) {
              acquireable
              additionalGeneIDs
              artistIDs
              atAuction
              attributionClass
              colors
              dimensionRange
              sizes
              height
              inquireableOnly
              locationCities
              majorPeriods
              materialsTerms
              offerable
              partnerIDs
              priceRange
              userAlertSettings {
                name
                email
                push
              }
              width
            }
          }
        }
      `}
      render={render}
      variables={{ savedSearchAlertId }}
      cacheConfig={{ force: true }}
    />
  )
}
