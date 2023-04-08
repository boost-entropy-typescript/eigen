import { ActionType, ContextModule, OwnerType } from "@artsy/cohesion"
import { Flex, Text, Join } from "@artsy/palette-mobile"
import { ComparableWorks_auctionResult$data } from "__generated__/ComparableWorks_auctionResult.graphql"
import {
  AuctionResultListItemFragmentContainer,
  AuctionResultListSeparator,
} from "app/Components/Lists/AuctionResultListItem"
import { navigate } from "app/system/navigation/navigate"
import { extractNodes } from "app/utils/extractNodes"
import { compact } from "lodash"
import { createFragmentContainer, graphql } from "react-relay"
import { useTracking } from "react-tracking"

interface ComparableWorks {
  auctionResult: ComparableWorks_auctionResult$data
}
const ComparableWorks: React.FC<ComparableWorks> = ({ auctionResult }) => {
  const { trackEvent } = useTracking()

  const comparableAuctionResults = extractNodes(auctionResult.comparableAuctionResults)

  const auctionResults = compact(comparableAuctionResults)

  return (
    <Flex testID="comparableWorks">
      <Text variant="sm-display" my={2}>
        Comparable Works
      </Text>

      {auctionResults.length > 0 ? (
        <Join separator={<AuctionResultListSeparator />}>
          {auctionResults.map((auctionResultRow, index) => (
            <AuctionResultListItemFragmentContainer
              key={auctionResultRow.internalID}
              showArtistName
              withHorizontalPadding={false}
              auctionResult={auctionResultRow}
              onPress={() => {
                trackEvent(tracks.tapAuctionResult(auctionResultRow.internalID, index))
                navigate(
                  `/artist/${auctionResultRow.artistID}/auction-result/${auctionResultRow.internalID}`
                )
              }}
            />
          ))}
        </Join>
      ) : (
        <Text color="black60">No comparable works</Text>
      )}
    </Flex>
  )
}

export const ComparableWorksFragmentContainer = createFragmentContainer(ComparableWorks, {
  auctionResult: graphql`
    fragment ComparableWorks_auctionResult on AuctionResult {
      comparableAuctionResults(first: 3) @optionalField {
        edges {
          cursor
          node {
            ...AuctionResultListItem_auctionResult
            artistID
            internalID
          }
        }
      }
    }
  `,
})

export const tracks = {
  tapAuctionResult: (auctionResultId: string, index: number) => ({
    action: ActionType.tappedAuctionResultGroup,
    context_module: ContextModule.auctionResultComparableWorks,
    context_screen_owner_type: OwnerType.auctionResult,
    destination_screen_owner_type: OwnerType.auctionResult,
    destination_screen_owner_id: auctionResultId,
    horizontal_slide_position: index,
    type: "thumbnail",
  }),
}
