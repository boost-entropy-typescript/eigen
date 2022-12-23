import { graphql } from "react-relay"
import {
  AuctionResultsScreenScreenWrapperQueryQueryRenderer,
  AuctionResultsState,
} from "./AuctionResultsScreenWrapper"

export const AuctionResultsForArtistsYouFollowQueryRenderer = () => {
  return <AuctionResultsScreenScreenWrapperQueryQueryRenderer state={AuctionResultsState.PAST} />
}

export const AuctionResultsForArtistsYouFollowPrefetchQuery = graphql`
  query AuctionResultsForArtistsYouFollowPrefetchQuery {
    me {
      ...AuctionResultsScreenWrapper_me @arguments(state: PAST)
    }
  }
`
