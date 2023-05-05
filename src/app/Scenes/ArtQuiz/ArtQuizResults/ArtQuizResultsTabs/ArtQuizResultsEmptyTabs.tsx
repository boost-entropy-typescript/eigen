import { LegacyScreen } from "@artsy/palette-mobile"
import { ArtQuizResultsEmptyTabsQuery } from "__generated__/ArtQuizResultsEmptyTabsQuery.graphql"
import { StickyTabPage } from "app/Components/StickyTabPage/StickyTabPage"
import { ArtQuizResultsTabsHeader } from "app/Scenes/ArtQuiz/ArtQuizResults/ArtQuizResultsTabs/ArtQuizResultsTabsHeader"
import { ArtQuizTrendingArtists } from "app/Scenes/ArtQuiz/ArtQuizResults/ArtQuizResultsTabs/ArtQuizTrendingArtists"
import { ArtQuizTrendingCollections } from "app/Scenes/ArtQuiz/ArtQuizResults/ArtQuizResultsTabs/ArtQuizTrendingCollections"
import { navigate } from "app/system/navigation/navigate"
import { compact } from "lodash"
import { graphql, useLazyLoadQuery } from "react-relay"

enum Tab {
  trendingCollections = "Trending Collections",
  trendingArtists = "Trending Artists",
}

export const ArtQuizResultsEmptyTabs = () => {
  const queryResult = useLazyLoadQuery<ArtQuizResultsEmptyTabsQuery>(
    artQuizResultsEmptyTabsQuery,
    {}
  )

  return (
    <LegacyScreen>
      <LegacyScreen.Header onBack={() => navigate("/")} />
      <LegacyScreen.Body fullwidth noBottomSafe>
        <StickyTabPage
          disableBackButtonUpdate
          tabs={compact([
            {
              title: Tab.trendingCollections,
              content: <ArtQuizTrendingCollections viewer={queryResult.viewer} />,
              initial: true,
            },
            {
              title: Tab.trendingArtists,
              content: <ArtQuizTrendingArtists viewer={queryResult.viewer} />,
            },
          ])}
          staticHeaderContent={
            <ArtQuizResultsTabsHeader
              title="Explore Your Quiz Results"
              subtitle="There are almost 2 million artworks on Artsy—keep exploring to find something you love."
            />
          }
        />
      </LegacyScreen.Body>
    </LegacyScreen>
  )
}

const artQuizResultsEmptyTabsQuery = graphql`
  query ArtQuizResultsEmptyTabsQuery {
    viewer {
      ...ArtQuizTrendingCollections_viewer
      ...ArtQuizTrendingArtists_viewer
    }
  }
`
