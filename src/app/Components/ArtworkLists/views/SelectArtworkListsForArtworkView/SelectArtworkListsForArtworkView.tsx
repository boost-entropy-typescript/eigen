import { Flex } from "@artsy/palette-mobile"
import { useArtworkListsContext } from "app/Components/ArtworkLists/ArtworkListsContext"
import { AutomountedBottomSheetModal } from "app/Components/ArtworkLists/components/AutomountedBottomSheetModal"
import { SelectArtworkListsForArtwork } from "app/Components/ArtworkLists/views/SelectArtworkListsForArtworkView/components/SelectArtworkListsForArtwork"
import { SelectArtworkListsForArtworkHeader } from "app/Components/ArtworkLists/views/SelectArtworkListsForArtworkView/components/SelectArtworkListsForArtworkHeader"
import {
  StickyBottomContent,
  StickyBottomContentPlaceholder,
} from "app/Components/ArtworkLists/views/SelectArtworkListsForArtworkView/components/StickyBottomContent"
import { ArtworkListsViewName } from "app/Components/ArtworkLists/views/constants"

const SNAP_POINTS = ["50%", "95%"]

export const SelectArtworkListsForArtworkView = () => {
  const { reset } = useArtworkListsContext()

  return (
    <AutomountedBottomSheetModal
      visible
      name={ArtworkListsViewName.SelectArtworkListsForArtwork}
      snapPoints={SNAP_POINTS}
      onDismiss={reset}
      footerComponent={StickyBottomContent}
    >
      <SelectArtworkListsForArtworkHeader />

      <Flex flex={1} overflow="hidden">
        <SelectArtworkListsForArtwork />
      </Flex>

      <StickyBottomContentPlaceholder />
    </AutomountedBottomSheetModal>
  )
}
