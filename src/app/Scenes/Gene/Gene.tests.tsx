import { TouchableHighlightColor } from "@artsy/palette-mobile"
import { fireEvent, waitFor } from "@testing-library/react-native"
import { GeneTestsQuery } from "__generated__/GeneTestsQuery.graphql"
import { ArtworkFilterOptionsScreen } from "app/Components/ArtworkFilter"
import About from "app/Components/Gene/About"
import { GeneArtworks } from "app/Components/Gene/GeneArtworks"
import { getMockRelayEnvironment } from "app/system/relay/defaultEnvironment"
import { renderWithWrappers, renderWithWrappersLEGACY } from "app/utils/tests/renderWithWrappers"
import { resolveMostRecentRelayOperation } from "app/utils/tests/resolveMostRecentRelayOperation"
import { graphql, QueryRenderer } from "react-relay"
import { Gene } from "./Gene"

describe("Gene", () => {
  const geneID = "gene-id"
  const environment = getMockRelayEnvironment()

  const TestRenderer = () => {
    return (
      <QueryRenderer<GeneTestsQuery>
        environment={environment}
        query={graphql`
          query GeneTestsQuery($geneID: String!, $input: FilterArtworksInput)
          @relay_test_operation {
            gene(id: $geneID) {
              displayName
              name
              slug
              ...Header_gene
              ...About_gene
              ...GeneArtworks_gene @arguments(input: $input)
            }
          }
        `}
        render={({ props }) => {
          if (!props?.gene) {
            return null
          }
          return <Gene geneID={geneID} gene={props.gene!} />
        }}
        variables={{
          geneID,
          input: {
            medium: "*",
            priceRange: "*-*",
          },
        }}
      />
    )
  }

  it("renders without throwing an error", () => {
    renderWithWrappersLEGACY(<TestRenderer />)
    resolveMostRecentRelayOperation(environment)
  })

  it("returns all tabs", async () => {
    const tree = renderWithWrappersLEGACY(<TestRenderer />)
    resolveMostRecentRelayOperation(environment)

    expect(tree.root.findAllByType(GeneArtworks)).toHaveLength(1)
    expect(tree.root.findAllByType(About)).toHaveLength(1)
  })

  it("renders filter modal", async () => {
    const { UNSAFE_getByType, UNSAFE_getAllByType } = renderWithWrappers(<TestRenderer />)
    resolveMostRecentRelayOperation(environment)

    await waitFor(() => expect(UNSAFE_getByType(TouchableHighlightColor)).toBeTruthy())
    fireEvent.press(UNSAFE_getByType(TouchableHighlightColor))

    expect(UNSAFE_getAllByType(ArtworkFilterOptionsScreen)).toHaveLength(1)
  })
})
