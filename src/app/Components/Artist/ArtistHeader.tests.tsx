import { screen } from "@testing-library/react-native"
import { ArtistHeaderFragmentContainer } from "app/Components/Artist/ArtistHeader"
import { setupTestWrapperTL } from "app/tests/setupTestWrapper"
import { graphql } from "react-relay"

jest.unmock("react-relay")

describe("ArtistHeader", () => {
  const { renderWithRelay } = setupTestWrapperTL({
    Component: (props) => <ArtistHeaderFragmentContainer artist={props.artist} />,
    query: graphql`
      query ArtistHeaderTestsQuery($artistID: String!) @relay_test_operation {
        artist(id: $artistID) {
          ...ArtistHeader_artist
        }
      }
    `,
    variables: { artistID: "artist-id" },
  })

  it("renders properly", () => {
    renderWithRelay({
      Artist: () => mockArtist,
    })

    expect(screen.queryByText("Marcel Duchamp")).toBeTruthy()
  })

  it("displays follow button for artist", () => {
    renderWithRelay({
      Artist: () => mockArtist,
    })

    expect(screen.queryByText("Follow")).toBeTruthy()
  })

  it("does not show followers count when it is < 2", () => {
    mockArtist.counts.follows = 1

    renderWithRelay({
      Artist: () => mockArtist,
    })

    expect(screen.queryByText("1 followers")).toBeFalsy()
  })
})

const mockArtist = {
  internalID: "some-id",
  id: "marcel-duchamp",
  name: "Marcel Duchamp",
  nationality: "French",
  birthday: "11/17/1992",
  counts: {
    follows: 22,
  },
}
