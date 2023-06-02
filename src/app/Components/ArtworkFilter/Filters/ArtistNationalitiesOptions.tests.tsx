import { fireEvent } from "@testing-library/react-native"
import { Aggregations, FilterParamName } from "app/Components/ArtworkFilter/ArtworkFilterHelpers"
import {
  ArtworkFiltersState,
  ArtworkFiltersStoreProvider,
  getArtworkFiltersModel,
} from "app/Components/ArtworkFilter/ArtworkFilterStore"
import { renderWithWrappers } from "app/utils/tests/renderWithWrappers"
import { ArtistNationalitiesOptionsScreen } from "./ArtistNationalitiesOptions"
import { getEssentialProps } from "./helper"

const MOCK_AGGREGATIONS: Aggregations = [
  {
    slice: "ARTIST_NATIONALITY",
    counts: [
      { count: 1254, name: "American", value: "American" },
      { count: 373, name: "British", value: "British" },
      { count: 191, name: "German", value: "German" },
      { count: 103, name: "Italian", value: "Italian" },
      { count: 65, name: "Japanese", value: "Japanese" },
    ],
  },
]

describe("ArtistNationalitiesOptionsScreen", () => {
  const INITIAL_DATA: ArtworkFiltersState = {
    selectedFilters: [],
    appliedFilters: [],
    previouslyAppliedFilters: [],
    applyFilters: false,
    aggregations: MOCK_AGGREGATIONS,
    filterType: "artwork",
    counts: {
      total: null,
      followedArtists: null,
    },
    showFilterArtworksModal: false,
    sizeMetric: "cm",
  }

  const TestWrapper = ({ initialData = INITIAL_DATA }) => {
    return (
      <ArtworkFiltersStoreProvider
        runtimeModel={{
          ...getArtworkFiltersModel(),
          ...initialData,
        }}
      >
        <ArtistNationalitiesOptionsScreen {...getEssentialProps()} />
      </ArtworkFiltersStoreProvider>
    )
  }

  it("renders the options", () => {
    const { getByText } = renderWithWrappers(<TestWrapper />)

    expect(getByText("American")).toBeTruthy()
    expect(getByText("British")).toBeTruthy()
    expect(getByText("German")).toBeTruthy()
    expect(getByText("Italian")).toBeTruthy()
    expect(getByText("Japanese")).toBeTruthy()
  })

  it("toggles selected filters 'ON' and unselected filters 'OFF", () => {
    const initialData: ArtworkFiltersState = {
      ...INITIAL_DATA,
      selectedFilters: [
        {
          displayText: "British, American",
          paramName: FilterParamName.artistNationalities,
          paramValue: ["British", "American"],
        },
      ],
    }

    const { getAllByA11yState } = renderWithWrappers(<TestWrapper initialData={initialData} />)

    expect(getAllByA11yState({ checked: true })).toHaveLength(2)
    expect(getAllByA11yState({ checked: false })).toHaveLength(3)
  })

  it("clears all when `Clear` button is tapped", () => {
    const initialData: ArtworkFiltersState = {
      ...INITIAL_DATA,
      selectedFilters: [
        {
          displayText: "British, American",
          paramName: FilterParamName.artistNationalities,
          paramValue: ["British", "American"],
        },
      ],
    }

    const { getByText, queryAllByA11yState } = renderWithWrappers(
      <TestWrapper initialData={initialData} />
    )

    expect(queryAllByA11yState({ checked: true })).toHaveLength(2)
    fireEvent.press(getByText("Clear"))
    expect(queryAllByA11yState({ checked: true })).toHaveLength(0)
  })
})
