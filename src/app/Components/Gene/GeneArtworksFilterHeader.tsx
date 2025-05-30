import { Box } from "@artsy/palette-mobile"
import { useSelectedFiltersCount } from "app/Components/ArtworkFilter/useArtworkFilters"
import { ArtworksFilterHeader } from "app/Components/ArtworkGrids/ArtworksFilterHeader"

interface GeneArtworksFilterProps {
  openFilterArtworksModal: (mode: "sortAndFilter") => void
}

export const GeneArtworksFilterHeader: React.FC<GeneArtworksFilterProps> = ({
  openFilterArtworksModal,
}) => {
  const appliedFiltersCount = useSelectedFiltersCount()

  return (
    <Box backgroundColor="mono0">
      <ArtworksFilterHeader
        onFilterPress={() => openFilterArtworksModal("sortAndFilter")}
        selectedFiltersCount={appliedFiltersCount}
      />
    </Box>
  )
}
