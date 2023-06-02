import { FilterParamName } from "app/Components/ArtworkFilter/ArtworkFilterHelpers"
import {
  ArtworkFiltersState,
  ArtworkFiltersStoreProvider,
  getArtworkFiltersModel,
} from "app/Components/ArtworkFilter/ArtworkFilterStore"
import { MockFilterScreen } from "app/Components/ArtworkFilter/FilterTestHelper"
import { renderWithWrappers } from "app/utils/tests/renderWithWrappers"
import { MaterialsTermsOptionsScreen } from "./MaterialsTermsOptions"
import { getEssentialProps } from "./helper"

describe("Materials Options Screen", () => {
  const initialState: ArtworkFiltersState = {
    aggregations: [
      {
        slice: "MATERIALS_TERMS",
        counts: [
          {
            count: 44,
            name: "Acrylic",
            value: "acrylic",
          },
          {
            count: 30,
            name: "Canvas",
            value: "canvas",
          },
          {
            count: 26,
            name: "Metal",
            value: "metal",
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

  const MockMaterialsTermsOptionsScreen = ({
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
        <MaterialsTermsOptionsScreen {...getEssentialProps()} />
      </ArtworkFiltersStoreProvider>
    )
  }

  describe("before any filters are selected", () => {
    it("renders all options present in the aggregation", () => {
      const { getByText } = renderWithWrappers(
        <MockMaterialsTermsOptionsScreen initialData={initialState} />
      )

      expect(getByText("Acrylic")).toBeTruthy()
      expect(getByText("Canvas")).toBeTruthy()
      expect(getByText("Metal")).toBeTruthy()
    })
  })

  describe("when filters are selected", () => {
    const state: ArtworkFiltersState = {
      ...initialState,
      selectedFilters: [
        {
          displayText: "Acrylic",
          paramName: FilterParamName.materialsTerms,
          paramValue: ["acrylic"],
        },
      ],
    }

    it("displays the number of the selected filters on the filter modal screen", () => {
      const { getByText } = renderWithWrappers(<MockFilterScreen initialState={state} />)

      expect(getByText("Material • 1")).toBeTruthy()
    })

    it("toggles selected filters 'ON' and unselected filters 'OFF", async () => {
      const { getAllByA11yState } = renderWithWrappers(
        <MockMaterialsTermsOptionsScreen initialData={state} />
      )
      const options = getAllByA11yState({ checked: true })

      expect(options).toHaveLength(1)
      expect(options[0]).toHaveTextContent("Acrylic")
    })
  })
})
