import { FilterParamName } from "app/Components/ArtworkFilter/ArtworkFilterHelpers"
import {
  ArtworkFiltersState,
  ArtworkFiltersStoreProvider,
  getArtworkFiltersModel,
} from "app/Components/ArtworkFilter/ArtworkFilterStore"
import { MockFilterScreen } from "app/Components/ArtworkFilter/FilterTestHelper"
import { renderWithWrappers } from "app/utils/tests/renderWithWrappers"
import { GalleriesAndInstitutionsOptionsScreen } from "./GalleriesAndInstitutionsOptions"
import { getEssentialProps } from "./helper"

describe("Galleries and Institutions Options Screen", () => {
  const initialState: ArtworkFiltersState = {
    aggregations: [
      {
        slice: "PARTNER",
        counts: [
          {
            name: "Musée Picasso Paris",
            count: 36,
            value: "musee-picasso-paris",
          },
          {
            name: "Gagosian",
            count: 33,
            value: "gagosian",
          },
          {
            name: "Tate",
            count: 11,
            value: "tate",
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
    filterType: "artwork",
    previouslyAppliedFilters: [],
    selectedFilters: [],
    showFilterArtworksModal: false,
    sizeMetric: "cm",
  }

  const MockGalleriesAndInstitutionsScreen = ({
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
        <GalleriesAndInstitutionsOptionsScreen {...getEssentialProps()} />
      </ArtworkFiltersStoreProvider>
    )
  }

  describe("before any filters are selected", () => {
    it("renders all options present in the aggregation", () => {
      const { getByText } = renderWithWrappers(
        <MockGalleriesAndInstitutionsScreen initialData={initialState} />
      )

      expect(getByText("Musée Picasso Paris"))
      expect(getByText("Gagosian"))
      expect(getByText("Tate"))
    })
  })

  describe("when filters are selected", () => {
    const state: ArtworkFiltersState = {
      ...initialState,
      selectedFilters: [
        {
          displayText: "Musée Picasso Paris",
          paramName: FilterParamName.partnerIDs,
          paramValue: ["musee-picasso-paris"],
        },
      ],
    }

    it("displays the number of the selected filters on the filter modal screen", () => {
      const { getByText } = renderWithWrappers(<MockFilterScreen initialState={state} />)

      expect(getByText("Galleries & Institutions • 1")).toBeTruthy()
    })

    it("toggles selected filters 'ON' and unselected filters 'OFF", async () => {
      const { getAllByA11yState } = renderWithWrappers(
        <MockGalleriesAndInstitutionsScreen initialData={state} />
      )

      const options = getAllByA11yState({ checked: true })

      expect(options).toHaveLength(1)
      expect(options[0]).toHaveTextContent("Musée Picasso Paris")
    })
  })
})
