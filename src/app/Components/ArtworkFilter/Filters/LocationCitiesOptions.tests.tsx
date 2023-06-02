import { FilterParamName } from "app/Components/ArtworkFilter/ArtworkFilterHelpers"
import {
  ArtworkFiltersState,
  ArtworkFiltersStoreProvider,
  getArtworkFiltersModel,
} from "app/Components/ArtworkFilter/ArtworkFilterStore"
import { MockFilterScreen } from "app/Components/ArtworkFilter/FilterTestHelper"
import { renderWithWrappers } from "app/utils/tests/renderWithWrappers"
import { LocationCitiesOptionsScreen } from "./LocationCitiesOptions"
import { getEssentialProps } from "./helper"

describe(LocationCitiesOptionsScreen, () => {
  const initialState: ArtworkFiltersState = {
    aggregations: [
      {
        slice: "LOCATION_CITY",
        counts: [
          {
            count: 44,
            name: "Paris, France",
            value: "Paris, France",
          },
          {
            count: 30,
            name: "London, United Kingdom",
            value: "London, United Kingdom",
          },
          {
            count: 26,
            name: "Milan, Italy",
            value: "Milan, Italy",
          },
        ],
      },
    ],
    appliedFilters: [],
    applyFilters: false,
    counts: {
      total: null,
      followedArtists: null,
    },
    showFilterArtworksModal: false,
    sizeMetric: "cm",
    filterType: "artwork",
    previouslyAppliedFilters: [],
    selectedFilters: [],
  }

  const MockLocationCitiesOptionsScreen = ({
    initialData = initialState,
  }: {
    initialData?: ArtworkFiltersState
  }) => {
    return (
      <ArtworkFiltersStoreProvider
        runtimeModel={{
          ...getArtworkFiltersModel(),
          ...initialData,
        }}
      >
        <LocationCitiesOptionsScreen {...getEssentialProps()} />
      </ArtworkFiltersStoreProvider>
    )
  }

  describe("no filters are selected", () => {
    it("renders all options present in the aggregation", () => {
      const { getByText } = renderWithWrappers(
        <MockLocationCitiesOptionsScreen initialData={initialState} />
      )

      expect(getByText("Paris, France")).toBeTruthy()
      expect(getByText("London, United Kingdom")).toBeTruthy()
      expect(getByText("Milan, Italy")).toBeTruthy()
    })
  })

  describe("a filter is selected", () => {
    const state: ArtworkFiltersState = {
      ...initialState,
      selectedFilters: [
        {
          displayText: "Paris, France, Milan, Italy",
          paramName: FilterParamName.locationCities,
          paramValue: ["Paris, France", "Milan, Italy"],
        },
      ],
    }

    it("displays the number of the selected filters on the filter modal screen", () => {
      const { getByText } = renderWithWrappers(<MockFilterScreen initialState={state} />)

      expect(getByText("Artwork Location • 2")).toBeTruthy()
    })

    it("toggles selected filters 'ON' and unselected filters 'OFF", async () => {
      const { getAllByA11yState } = renderWithWrappers(
        <MockLocationCitiesOptionsScreen initialData={state} />
      )

      const options = getAllByA11yState({ checked: true })

      expect(options).toHaveLength(2)
      expect(options[0]).toHaveTextContent("Paris, France")
      expect(options[1]).toHaveTextContent("Milan, Italy")
    })
  })
})
