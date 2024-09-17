import { Flex, Text } from "@artsy/palette-mobile"
import { HomeViewSectionGeneric_section$data } from "__generated__/HomeViewSectionGeneric_section.graphql"
import { HomeViewSectionActivityQueryRenderer } from "app/Scenes/HomeView/Sections/HomeViewSectionActivity"
import { HomeViewSectionArticlesQueryRenderer } from "app/Scenes/HomeView/Sections/HomeViewSectionArticles"
import { HomeViewSectionArticlesCardsQueryRenderer } from "app/Scenes/HomeView/Sections/HomeViewSectionArticlesCards"
import { HomeViewSectionArtistsQueryRenderer } from "app/Scenes/HomeView/Sections/HomeViewSectionArtists"
import { HomeViewSectionArtworksQueryRenderer } from "app/Scenes/HomeView/Sections/HomeViewSectionArtworks"
import { HomeViewSectionAuctionResultsQueryRenderer } from "app/Scenes/HomeView/Sections/HomeViewSectionAuctionResults"
import { HomeViewSectionFairsQueryRenderer } from "app/Scenes/HomeView/Sections/HomeViewSectionFairs"
import { HomeViewSectionFeaturedCollectionQueryRenderer } from "app/Scenes/HomeView/Sections/HomeViewSectionFeaturedCollection"
import { HomeViewSectionGalleriesQueryRenderer } from "app/Scenes/HomeView/Sections/HomeViewSectionGalleries"
import { HomeViewSectionGeneric } from "app/Scenes/HomeView/Sections/HomeViewSectionGeneric"
import { HomeViewSectionHeroUnitsQueryRenderer } from "app/Scenes/HomeView/Sections/HomeViewSectionHeroUnits"
import { HomeViewSectionMarketingCollectionsQueryRenderer } from "app/Scenes/HomeView/Sections/HomeViewSectionMarketingCollections"
import { HomeViewSectionSalesQueryRenderer } from "app/Scenes/HomeView/Sections/HomeViewSectionSales"
import { HomeViewSectionShowsQueryRenderer } from "app/Scenes/HomeView/Sections/HomeViewSectionShows"
import { HomeViewSectionViewingRoomsQueryRenderer } from "app/Scenes/HomeView/Sections/HomeViewSectionViewingRooms"
import { CleanRelayFragment } from "app/utils/relayHelpers"

export const Section: React.FC<{
  section: CleanRelayFragment<HomeViewSectionGeneric_section$data>
}> = (props) => {
  const { section } = props

  if (!section.internalID) {
    if (__DEV__) {
      throw new Error("Section has no internalID")
    }
    return null
  }

  switch (section.component?.type) {
    case "FeaturedCollection":
      return <HomeViewSectionFeaturedCollectionQueryRenderer sectionID={section.internalID} />
    case "ArticlesCard":
      return <HomeViewSectionArticlesCardsQueryRenderer sectionID={section.internalID} />
  }

  switch (section.__typename) {
    case "HomeViewSectionActivity":
      return <HomeViewSectionActivityQueryRenderer sectionID={section.internalID} />
    case "HomeViewSectionArtworks":
      return <HomeViewSectionArtworksQueryRenderer sectionID={section.internalID} />
    case "HomeViewSectionGalleries":
      return <HomeViewSectionGalleriesQueryRenderer sectionID={section.internalID} />
    case "HomeViewSectionGeneric":
      return <HomeViewSectionGeneric section={section} />
    case "HomeViewSectionArticles":
      return <HomeViewSectionArticlesQueryRenderer sectionID={section.internalID} />
    case "HomeViewSectionArtists":
      return <HomeViewSectionArtistsQueryRenderer sectionID={section.internalID} />
    case "HomeViewSectionAuctionResults":
      return <HomeViewSectionAuctionResultsQueryRenderer sectionID={section.internalID} />
    case "HomeViewSectionHeroUnits":
      return <HomeViewSectionHeroUnitsQueryRenderer sectionID={section.internalID} />
    case "HomeViewSectionFairs":
      return <HomeViewSectionFairsQueryRenderer sectionID={section.internalID} />
    case "HomeViewSectionMarketingCollections":
      return <HomeViewSectionMarketingCollectionsQueryRenderer sectionID={section.internalID} />
    case "HomeViewSectionShows":
      return <HomeViewSectionShowsQueryRenderer sectionID={section.internalID} />
    case "HomeViewSectionViewingRooms":
      return <HomeViewSectionViewingRoomsQueryRenderer sectionID={section.internalID} />
    case "HomeViewSectionSales":
      return <HomeViewSectionSalesQueryRenderer sectionID={section.internalID} />
    default:
      if (__DEV__) {
        return (
          <Flex p={2} backgroundColor="black10">
            <Text>Non supported section:</Text>
            <Text color="devpurple">{section.__typename}</Text>
          </Flex>
        )
      }
      return null
  }
}
