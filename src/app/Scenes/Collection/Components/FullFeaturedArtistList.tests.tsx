import { FullFeaturedArtistListTestsQuery } from "__generated__/FullFeaturedArtistListTestsQuery.graphql"
import { renderWithWrappersTL } from "app/tests/renderWithWrappers"
import { resolveMostRecentRelayOperation } from "app/tests/resolveMostRecentRelayOperation"
import { graphql, QueryRenderer } from "react-relay"
import { createMockEnvironment } from "relay-test-utils"
import { FullFeaturedArtistListCollectionFixture } from "./__fixtures__/CollectionFixture"
import { CollectionFeaturedArtistsContainer as CollectionFeaturedArtists } from "./FullFeaturedArtistList"

jest.unmock("react-relay")

describe("FullFeaturedArtistList", () => {
  let mockEnvironment: ReturnType<typeof createMockEnvironment>

  const TestWrapper = () => {
    return (
      <QueryRenderer<FullFeaturedArtistListTestsQuery>
        environment={mockEnvironment}
        query={graphql`
          query FullFeaturedArtistListTestsQuery @relay_test_operation @raw_response_type {
            marketingCollection(slug: "emerging-photographers") {
              ...FullFeaturedArtistList_collection
            }
          }
        `}
        variables={{}}
        render={({ props }) => {
          if (props?.marketingCollection) {
            return <CollectionFeaturedArtists collection={props.marketingCollection} />
          }

          return null
        }}
      />
    )
  }

  beforeEach(() => {
    mockEnvironment = createMockEnvironment()
  })

  it("renders featured artist", () => {
    const { getByText } = renderWithWrappersTL(<TestWrapper />)

    resolveMostRecentRelayOperation(mockEnvironment, {
      MarketingCollection: () => FullFeaturedArtistListCollectionFixture,
    })

    expect(getByText("Pablo Picasso")).toBeTruthy()
    expect(getByText("Andy Warhol")).toBeTruthy()
    expect(getByText("Joan Miro")).toBeTruthy()
    expect(getByText("Jean-Michel Basquiat")).toBeTruthy()
    expect(getByText("Kenny Scharf")).toBeTruthy()
  })

  it("does not render an EntityHeader for excluded artists", async () => {
    const { getByText, queryByText } = renderWithWrappersTL(<TestWrapper />)

    resolveMostRecentRelayOperation(mockEnvironment, {
      MarketingCollection: () => ({
        ...FullFeaturedArtistListCollectionFixture,
        featuredArtistExclusionIds: ["34534-andy-warhols-id", "2342-pablo-picassos-id"],
      }),
    })

    expect(getByText("Joan Miro")).toBeTruthy()
    expect(getByText("Jean-Michel Basquiat")).toBeTruthy()
    expect(getByText("Kenny Scharf")).toBeTruthy()
    expect(queryByText("Andy Warhol")).toBeFalsy()
    expect(queryByText("Pablo Picasso")).toBeFalsy()
  })

  describe("when artist ids are explicitly requested", () => {
    it("does not render an EntityHeader for any non-requested artists", async () => {
      const { getByText, queryByText } = renderWithWrappersTL(<TestWrapper />)

      resolveMostRecentRelayOperation(mockEnvironment, {
        MarketingCollection: () => ({
          ...FullFeaturedArtistListCollectionFixture,
          query: {
            id: "some-id",
            artistIDs: ["34534-andy-warhols-id"],
          },
        }),
      })

      expect(getByText("Andy Warhol")).toBeTruthy()
      expect(queryByText("Joan Miro")).toBeFalsy()
      expect(queryByText("Pablo Picasso")).toBeFalsy()
    })
  })
})
