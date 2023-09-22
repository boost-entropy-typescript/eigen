import { ActionType, ContextModule, OwnerType } from "@artsy/cohesion"
import { Spacer, ChevronIcon, Flex, Box, Separator } from "@artsy/palette-mobile"
import { FairQuery } from "__generated__/FairQuery.graphql"
import { Fair_fair$data } from "__generated__/Fair_fair.graphql"
import { ArtworkFilterNavigator, FilterModalMode } from "app/Components/ArtworkFilter"
import { ArtworkFiltersStoreProvider } from "app/Components/ArtworkFilter/ArtworkFilterStore"
import { PlaceholderGrid } from "app/Components/ArtworkGrids/GenericGrid"
import { HeaderArtworksFilterWithTotalArtworks as HeaderArtworksFilter } from "app/Components/HeaderArtworksFilter/HeaderArtworksFilterWithTotalArtworks"
import { HeaderButton } from "app/Components/HeaderButton"
import { NavigationalTabs, TabsType } from "app/Components/LegacyTabs"
import { goBack } from "app/system/navigation/navigate"
import { getRelayEnvironment } from "app/system/relay/defaultEnvironment"
import { useScreenDimensions } from "app/utils/hooks"
import { PlaceholderBox, PlaceholderText } from "app/utils/placeholders"
import { renderWithPlaceholder } from "app/utils/renderWithPlaceholder"
import { ProvideScreenTracking, Schema } from "app/utils/track"
import React, { useRef, useState } from "react"
import { FlatList } from "react-native"
import Animated, { runOnJS, useAnimatedScrollHandler } from "react-native-reanimated"
import { createFragmentContainer, graphql, QueryRenderer } from "react-relay"
import { useTracking } from "react-tracking"
import { FairArtworksFragmentContainer } from "./Components/FairArtworks"
import { FairCollectionsFragmentContainer } from "./Components/FairCollections"
import { FairEditorialFragmentContainer } from "./Components/FairEditorial"
import { FairEmptyStateFragmentContainer } from "./Components/FairEmptyState"
import { FairExhibitorsFragmentContainer } from "./Components/FairExhibitors"
import { FairFollowedArtistsRailFragmentContainer } from "./Components/FairFollowedArtistsRail"
import { FairHeaderFragmentContainer } from "./Components/FairHeader"

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)
const BACK_ICON_SIZE = 21
const HEADER_SCROLL_THRESHOLD = 50

interface FairQueryRendererProps {
  fairID: string
}

interface FairProps {
  fair: Fair_fair$data
}

const tabs: TabsType = [
  {
    label: "Exhibitors",
  },
  {
    label: "Artworks",
  },
]

export const Fair: React.FC<FairProps> = ({ fair }) => {
  const { isActive } = fair
  const hasArticles = !!fair.articles?.edges?.length
  const hasCollections = !!fair.marketingCollections.length
  const hasArtworks = !!(fair.counts?.artworks ?? 0 > 0)
  const hasExhibitors = !!(fair.counts?.partnerShows ?? 0 > 0)
  const hasFollowedArtistArtworks = !!(fair.followedArtistArtworks?.edges?.length ?? 0 > 0)

  const tracking = useTracking()
  const [activeTab, setActiveTab] = useState(0)

  const flatListRef = useRef<FlatList>(null)
  const [isFilterArtworksModalVisible, setFilterArtworkModalVisible] = useState(false)
  const [shouldHideButtons, setShouldHideButtons] = useState(false)

  const sections = isActive
    ? [
        "fairHeader",
        ...(hasArticles ? ["fairEditorial"] : []),
        ...(hasCollections ? ["fairCollections"] : []),
        ...(hasFollowedArtistArtworks ? ["fairFollowedArtistsRail"] : []),
        ...(hasArtworks && hasExhibitors ? ["fairTabsAndFilter", "fairTabChildContent"] : []),
      ]
    : ["fairHeader", ...(hasArticles ? ["fairEditorial"] : []), "notActive"]

  const stickyIndex = sections.indexOf("fairTabsAndFilter")

  const { safeAreaInsets } = useScreenDimensions()

  const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 30 })

  const handleFilterArtworksModal = () => {
    setFilterArtworkModalVisible(!isFilterArtworksModalVisible)
  }

  const trackTappedNavigationTab = (destinationTab: number) => {
    const trackTappedArtworkTabProps = {
      action: ActionType.tappedNavigationTab,
      context_screen_owner_type: OwnerType.fair,
      context_screen_owner_id: fair.internalID,
      context_screen_owner_slug: fair.slug,
      context_module: ContextModule.exhibitorsTab,
      subject: "Artworks",
    }
    const trackTappedExhibitorsTabProps = {
      action: ActionType.tappedNavigationTab,
      context_screen_owner_type: OwnerType.fair,
      context_screen_owner_id: fair.internalID,
      context_screen_owner_slug: fair.slug,
      context_module: ContextModule.artworksTab,
      subject: "Exhibitors",
    }

    if (activeTab !== destinationTab) {
      if (tabs[destinationTab].label === "Artworks") {
        tracking.trackEvent(trackTappedArtworkTabProps)
      } else {
        tracking.trackEvent(trackTappedExhibitorsTabProps)
      }
    }
  }

  const openFilterArtworksModal = () => {
    tracking.trackEvent({
      action_name: "filter",
      context_screen_owner_type: Schema.OwnerEntityTypes.Fair,
      context_screen: Schema.PageNames.FairPage,
      context_screen_owner_id: fair.internalID,
      context_screen_owner_slug: fair.slug,
      action_type: Schema.ActionTypes.Tap,
    })
    handleFilterArtworksModal()
  }

  const closeFilterArtworksModal = () => {
    tracking.trackEvent({
      action_name: "closeFilterWindow",
      context_screen_owner_type: Schema.OwnerEntityTypes.Fair,
      context_screen: Schema.PageNames.FairPage,
      context_screen_owner_id: fair.internalID,
      context_screen_owner_slug: fair.slug,
      action_type: Schema.ActionTypes.Tap,
    })
    handleFilterArtworksModal()
  }

  const scrollHandler = useAnimatedScrollHandler((event) => {
    const hideButtons = event.contentOffset.y > HEADER_SCROLL_THRESHOLD
    return runOnJS(setShouldHideButtons)(hideButtons)
  })

  return (
    <ProvideScreenTracking
      info={{
        context_screen: Schema.PageNames.FairPage,
        context_screen_owner_type: Schema.OwnerEntityTypes.Fair,
        context_screen_owner_id: fair.internalID,
        context_screen_owner_slug: fair.slug,
      }}
    >
      <ArtworkFiltersStoreProvider>
        <AnimatedFlatList
          data={sections}
          ref={flatListRef}
          viewabilityConfig={viewConfigRef.current}
          ItemSeparatorComponent={() => <Spacer y={4} />}
          ListFooterComponent={<Spacer y={4} />}
          keyExtractor={(_item, index) => String(index)}
          stickyHeaderIndices={[stickyIndex]}
          onScroll={scrollHandler}
          scrollEventThrottle={100}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }): null | any => {
            switch (item) {
              case "fairHeader": {
                return (
                  <>
                    <FairHeaderFragmentContainer fair={fair} />
                    <Separator mt={4} />
                  </>
                )
              }
              case "notActive": {
                return <FairEmptyStateFragmentContainer fair={fair} />
              }
              case "fairFollowedArtistsRail": {
                return <FairFollowedArtistsRailFragmentContainer fair={fair} />
              }
              case "fairEditorial": {
                return <FairEditorialFragmentContainer fair={fair} />
              }
              case "fairCollections": {
                return <FairCollectionsFragmentContainer fair={fair} />
              }
              case "fairTabsAndFilter": {
                const tabToShow = tabs ? tabs[activeTab] : null
                return (
                  <Box pt={`${safeAreaInsets.top}px`} backgroundColor="white">
                    <NavigationalTabs
                      onTabPress={(_, index) => {
                        trackTappedNavigationTab(index as number)
                        setActiveTab(index)
                      }}
                      activeTab={activeTab}
                      tabs={tabs}
                    />
                    {tabToShow?.label === "Artworks" && (
                      <HeaderArtworksFilter onPress={openFilterArtworksModal} />
                    )}
                  </Box>
                )
              }
              case "fairTabChildContent": {
                const tabToShow = tabs ? tabs[activeTab] : null

                if (!tabToShow) {
                  return null
                }

                if (tabToShow.label === "Exhibitors") {
                  return <FairExhibitorsFragmentContainer fair={fair} />
                }

                if (tabToShow.label === "Artworks") {
                  return (
                    <Box px={2}>
                      <FairArtworksFragmentContainer fair={fair} />
                      <ArtworkFilterNavigator
                        visible={isFilterArtworksModalVisible}
                        id={fair.internalID}
                        slug={fair.slug}
                        mode={FilterModalMode.Fair}
                        exitModal={handleFilterArtworksModal}
                        closeModal={closeFilterArtworksModal}
                      />
                    </Box>
                  )
                }
              }
            }
          }}
        />
      </ArtworkFiltersStoreProvider>

      <HeaderButton shouldHide={shouldHideButtons} onPress={() => goBack()} position="left">
        <ChevronIcon direction="left" width={BACK_ICON_SIZE} height={BACK_ICON_SIZE} />
      </HeaderButton>
    </ProvideScreenTracking>
  )
}

export const FairFragmentContainer = createFragmentContainer(Fair, {
  fair: graphql`
    fragment Fair_fair on Fair {
      internalID
      slug
      isActive
      articles: articlesConnection(first: 5, sort: PUBLISHED_AT_DESC) {
        edges {
          __typename
        }
      }
      marketingCollections(size: 5) {
        __typename
      }
      counts {
        artworks
        partnerShows
      }
      followedArtistArtworks: filterArtworksConnection(
        first: 20
        input: { includeArtworksByFollowedArtists: true }
      ) {
        edges {
          __typename
        }
      }
      ...FairHeader_fair
      ...FairEmptyState_fair
      ...FairEditorial_fair
      ...FairCollections_fair
      ...FairArtworks_fair @arguments(input: { sort: "-decayed_merch" })
      ...FairExhibitors_fair
      ...FairFollowedArtistsRail_fair
    }
  `,
})

export const FairQueryRenderer: React.FC<FairQueryRendererProps> = ({ fairID }) => {
  return (
    <QueryRenderer<FairQuery>
      environment={getRelayEnvironment()}
      query={graphql`
        query FairQuery($fairID: String!) {
          fair(id: $fairID) @principalField {
            ...Fair_fair
          }
        }
      `}
      variables={{ fairID }}
      render={renderWithPlaceholder({
        Container: FairFragmentContainer,
        renderPlaceholder: () => <FairPlaceholder />,
      })}
    />
  )
}

export const FairPlaceholder: React.FC = () => (
  <Flex>
    <PlaceholderBox height={400} />
    <Flex flexDirection="row" justifyContent="space-between" alignItems="center" px={2}>
      <Flex>
        <Spacer y={2} />
        {/* Fair name */}
        <PlaceholderText width={220} />
        {/* Fair info */}
        <PlaceholderText width={190} />
        <PlaceholderText width={190} />
      </Flex>
    </Flex>
    <Spacer y={2} />
    <Separator />
    <Spacer y={2} />
    {/* masonry grid */}
    <PlaceholderGrid />
  </Flex>
)
