import { Touchable } from "@artsy/palette-mobile"
import { ArtistSeriesTestsQuery } from "__generated__/ArtistSeriesTestsQuery.graphql"
import { ArtworkFiltersStoreProvider } from "app/Components/ArtworkFilter/ArtworkFilterStore"
import { ArtistSeries, ArtistSeriesFragmentContainer } from "app/Scenes/ArtistSeries/ArtistSeries"
import { ArtistSeriesArtworks } from "app/Scenes/ArtistSeries/ArtistSeriesArtworks"
import { ArtistSeriesHeader } from "app/Scenes/ArtistSeries/ArtistSeriesHeader"
import { ArtistSeriesMeta } from "app/Scenes/ArtistSeries/ArtistSeriesMeta"
import { ArtistSeriesMoreSeries } from "app/Scenes/ArtistSeries/ArtistSeriesMoreSeries"
import { mockTrackEvent } from "app/utils/tests/globallyMockedStuff"
import { renderWithWrappersLEGACY } from "app/utils/tests/renderWithWrappers"
import { graphql, QueryRenderer } from "react-relay"
import { act } from "react-test-renderer"
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils"
import { ArtistSeriesListItem } from "./ArtistSeriesListItem"

describe("Artist Series Rail", () => {
  let env: ReturnType<typeof createMockEnvironment>

  beforeEach(() => {
    env = createMockEnvironment()
  })

  const TestRenderer = () => (
    <ArtworkFiltersStoreProvider>
      <QueryRenderer<ArtistSeriesTestsQuery>
        environment={env}
        query={graphql`
          query ArtistSeriesTestsQuery @relay_test_operation {
            artistSeries(id: "pumpkins") {
              ...ArtistSeries_artistSeries
            }
          }
        `}
        variables={{}}
        render={({ props, error }) => {
          if (props?.artistSeries) {
            return <ArtistSeriesFragmentContainer artistSeries={props.artistSeries} />
          } else if (error) {
            console.log(error)
          }
        }}
      />
    </ArtworkFiltersStoreProvider>
  )

  const getWrapper = (mockResolvers = {}) => {
    const tree = renderWithWrappersLEGACY(<TestRenderer />)
    act(() => {
      env.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, mockResolvers)
      )
    })
    return tree
  }

  it("renders without throwing an error", () => {
    const wrapper = getWrapper()
    expect(wrapper.root.findAllByType(ArtistSeries)).toHaveLength(1)
  })

  it("renders the necessary subcomponents", () => {
    const wrapper = getWrapper()
    expect(wrapper.root.findAllByType(ArtistSeriesHeader)).toHaveLength(1)
    expect(wrapper.root.findAllByType(ArtistSeriesMeta)).toHaveLength(1)
    expect(wrapper.root.findAllByType(ArtistSeriesArtworks)).toHaveLength(1)
    expect(wrapper.root.findAllByType(ArtistSeriesMoreSeries)).toHaveLength(1)
  })

  it("tracks clicks to the artist series group", () => {
    const wrapper = getWrapper({
      ArtistSeries: () => ({
        internalID: "abc",
        slug: "yayoi-kusama-other-fruits",
      }),
    })
    const artistSeriesButton = wrapper.root.findByType(ArtistSeriesListItem).findByType(Touchable)
    act(() => artistSeriesButton.props.onPress())

    expect(mockTrackEvent).toHaveBeenCalledWith({
      action: "tappedArtistSeriesGroup",
      context_module: "moreSeriesByThisArtist",
      context_screen_owner_id: "abc",
      context_screen_owner_slug: "yayoi-kusama-other-fruits",
      context_screen_owner_type: "artistSeries",
      destination_screen_owner_id: "abc",
      destination_screen_owner_slug: "yayoi-kusama-other-fruits",
      destination_screen_owner_type: "artistSeries",
      horizontal_slide_position: 0,
      curation_boost: false,
      type: "thumbnail",
    })
  })

  describe("with an artist series without an artist", () => {
    it("does not render ArtistSeriesMoreSeries", () => {
      const wrapper = getWrapper({
        ArtistSeries: () => ({
          artist: null,
        }),
      })
      expect(wrapper.root.findAllByType(ArtistSeriesMoreSeries)).toHaveLength(0)
    })
  })

  describe("with an artist series artist without an artistSeriesConnection", () => {
    it("does not render ArtistSeriesMoreSeries", () => {
      const wrapper = getWrapper({
        ArtistSeries: () => ({
          artist: [
            {
              artistSeriesConnection: {
                totalCount: 0,
              },
            },
          ],
        }),
      })
      expect(wrapper.root.findAllByType(ArtistSeriesMoreSeries)).toHaveLength(0)
    })
  })
})
