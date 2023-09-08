import { ContextModule, OwnerType } from "@artsy/cohesion"
import {
  ArtsyLogoBlackIcon,
  Box,
  Flex,
  Join,
  Spacer,
  SpacingUnitDSValueNumber,
} from "@artsy/palette-mobile"
import { useFocusEffect } from "@react-navigation/native"
import {
  HomeAboveTheFoldQuery,
  HomeAboveTheFoldQuery$data,
} from "__generated__/HomeAboveTheFoldQuery.graphql"
import { HomeBelowTheFoldQuery } from "__generated__/HomeBelowTheFoldQuery.graphql"
import { Home_articlesConnection$data } from "__generated__/Home_articlesConnection.graphql"
import { Home_emergingPicks$data } from "__generated__/Home_emergingPicks.graphql"
import { Home_featured$data } from "__generated__/Home_featured.graphql"
import { Home_homePageAbove$data } from "__generated__/Home_homePageAbove.graphql"
import { Home_homePageBelow$data } from "__generated__/Home_homePageBelow.graphql"
import { Home_meAbove$data } from "__generated__/Home_meAbove.graphql"
import { Home_meBelow$data } from "__generated__/Home_meBelow.graphql"
import { Home_newWorksForYou$data } from "__generated__/Home_newWorksForYou.graphql"
import { SearchQuery } from "__generated__/SearchQuery.graphql"
import { AboveTheFoldFlatList } from "app/Components/AboveTheFoldFlatList"
import { LargeArtworkRailPlaceholder } from "app/Components/ArtworkRail/LargeArtworkRail"
import { ArtistRailFragmentContainer } from "app/Components/Home/ArtistRails/ArtistRail"
import { RecommendedArtistsRailFragmentContainer } from "app/Components/Home/ArtistRails/RecommendedArtistsRail"
import { LotsByFollowedArtistsRailContainer } from "app/Components/LotsByArtistsYouFollowRail/LotsByFollowedArtistsRail"
import { useDismissSavedArtwork } from "app/Components/ProgressiveOnboarding/useDismissSavedArtwork"
import { ActivityIndicator } from "app/Scenes/Home/Components/ActivityIndicator"
import { ArticlesRailFragmentContainer } from "app/Scenes/Home/Components/ArticlesRail"
import { ArtworkModuleRailFragmentContainer } from "app/Scenes/Home/Components/ArtworkModuleRail"
import { ArtworkRecommendationsRail } from "app/Scenes/Home/Components/ArtworkRecommendationsRail"
import { AuctionResultsRail } from "app/Scenes/Home/Components/AuctionResultsRail"
import { CollectionsRailFragmentContainer } from "app/Scenes/Home/Components/CollectionsRail"
import { EmailConfirmationBannerFragmentContainer } from "app/Scenes/Home/Components/EmailConfirmationBanner"
import { FairsRailFragmentContainer } from "app/Scenes/Home/Components/FairsRail"
import { GalleriesForYouBanner } from "app/Scenes/Home/Components/GalleriesForYouBanner"
import { HomeFeedOnboardingRailFragmentContainer } from "app/Scenes/Home/Components/HomeFeedOnboardingRail"
import { HomeHeader } from "app/Scenes/Home/Components/HomeHeader"
import { MarketingCollectionRail } from "app/Scenes/Home/Components/MarketingCollectionRail"
import { MeetYourNewAdvisorRail } from "app/Scenes/Home/Components/MeetYourNewAdvisorRail"
import { NewWorksForYouRail } from "app/Scenes/Home/Components/NewWorksForYouRail"
import { OldCollectionsRailFragmentContainer } from "app/Scenes/Home/Components/OldCollectionsRail"
import { SalesRailFragmentContainer } from "app/Scenes/Home/Components/SalesRail"
import { ShowsRailContainer } from "app/Scenes/Home/Components/ShowsRail"
import { RailScrollRef } from "app/Scenes/Home/Components/types"
import {
  DEFAULT_RECS_MODEL_VERSION,
  RECOMMENDATION_MODEL_EXPERIMENT_NAME,
} from "app/Scenes/NewWorksForYou/NewWorksForYou"
import { searchQueryDefaultVariables } from "app/Scenes/Search/Search"
import { ViewingRoomsHomeMainRail } from "app/Scenes/ViewingRoom/Components/ViewingRoomsHomeRail"
import { GlobalStore } from "app/store/GlobalStore"
import { getRelayEnvironment } from "app/system/relay/defaultEnvironment"
import { AboveTheFoldQueryRenderer } from "app/utils/AboveTheFoldQueryRenderer"
import { useExperimentVariant } from "app/utils/experiments/hooks"
import { maybeReportExperimentVariant } from "app/utils/experiments/reporter"
import { isPad } from "app/utils/hardware"
import { useFeatureFlag } from "app/utils/hooks/useFeatureFlag"
import {
  PlaceholderBox,
  PlaceholderText,
  ProvidePlaceholderContext,
  RandomWidthPlaceholderText,
  useMemoizedRandom,
} from "app/utils/placeholders"
import { usePrefetch } from "app/utils/queryPrefetching"
import { requestPushNotificationsPermission } from "app/utils/requestPushNotificationsPermission"
import {
  ArtworkActionTrackingProps,
  extractArtworkActionTrackingProps,
} from "app/utils/track/ArtworkActions"
import { useMaybePromptForReview } from "app/utils/useMaybePromptForReview"
import { times } from "lodash"
import React, {
  RefObject,
  createRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  Alert,
  ListRenderItem,
  RefreshControl,
  View,
  ViewProps,
  ViewToken,
  ViewabilityConfig,
} from "react-native"
import { RelayRefetchProp, createRefetchContainer, graphql } from "react-relay"

import { useTracking } from "react-tracking"
import RelayModernEnvironment from "relay-runtime/lib/store/RelayModernEnvironment"
import { RelayMockEnvironment } from "relay-test-utils/lib/RelayModernMockEnvironment"
import { HeroUnitsRail } from "./Components/HeroUnitsRail"
import HomeAnalytics from "./homeAnalytics"
import { useHomeModules } from "./useHomeModules"

const MODULE_SEPARATOR_HEIGHT: SpacingUnitDSValueNumber = 6

export interface HomeModule extends ArtworkActionTrackingProps {
  data: any
  hidden?: boolean
  isEmpty: boolean
  prefetchUrl?: string
  prefetchVariables?: object
  key: string
  subtitle?: string
  title: string
  type: string
}

export interface HomeProps extends ViewProps {
  articlesConnection: Home_articlesConnection$data | null
  featured: Home_featured$data | null
  homePageAbove: Home_homePageAbove$data | null
  homePageBelow: Home_homePageBelow$data | null
  newWorksForYou: Home_newWorksForYou$data | null
  loading: boolean
  meAbove: Home_meAbove$data | null
  meBelow: Home_meBelow$data | null
  relay: RelayRefetchProp
  emergingPicks: Home_emergingPicks$data | null
  heroUnits: HomeAboveTheFoldQuery$data["heroUnitsConnection"] | null
}

const Home = memo((props: HomeProps) => {
  useDismissSavedArtwork(
    props.meAbove?.counts?.savedArtworks != null && props.meAbove.counts.savedArtworks > 0
  )
  const viewedRails = useRef<Set<string>>(new Set()).current

  const [visibleRails, setVisibleRails] = useState<Set<string>>(new Set())
  useMaybePromptForReview({ contextModule: ContextModule.tabBar, contextOwnerType: OwnerType.home })
  const prefetchUrl = usePrefetch()
  const tracking = useTracking()

  const viewabilityConfig = useRef<ViewabilityConfig>({
    // Percent of of the item that is visible for a partially occluded item to count as "viewable"
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 2000,
    waitForInteraction: false,
  }).current

  useEffect(() => {
    prefetchUrl<SearchQuery>("search", searchQueryDefaultVariables)
    prefetchUrl("my-profile")
    prefetchUrl("inbox")
    prefetchUrl("sales")
  }, [])

  useEffect(() => {
    requestPushNotificationsPermission()
  }, [])

  // we cannot rely on mount events for screens in tab views for screen tracking
  // because they can be mounted before the screen is visible
  // do custom screen view instead

  useFocusEffect(
    useCallback(() => {
      tracking.trackEvent(HomeAnalytics.homeScreenViewed())
    }, [])
  )

  const { loading, relay } = props

  const enableNewCollectionsRail = useFeatureFlag("AREnableNewCollectionsRail")
  const enableRailViewsTracking = useFeatureFlag("ARImpressionsTrackingHomeRailViews")
  const enableItemViewsTracking = useFeatureFlag("ARImpressionsTrackingHomeItemViews")
  const enableNewSaleArtworkTileRailCard = useFeatureFlag("AREnableNewAuctionsRailCard")
  const enableShowsForYouLocation = useFeatureFlag("AREnableShowsForYouLocation")
  // Needed to support percentage rollout of the experiment
  const enableRailViewsTrackingExperiment = useExperimentVariant(
    "CX-impressions-tracking-home-rail-views"
  )

  // Make sure to include enough modules in the above-the-fold query to cover the whole screen!.
  const { modules, allModulesKeys } = useHomeModules(props)

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      const newVisibleRails = new Set<string>()

      // Track currently visible rails // needed to enable tracking artwork views
      if (enableItemViewsTracking) {
        viewableItems.forEach(({ item: { title } }: { item: HomeModule }) => {
          newVisibleRails.add(title)
        })

        setVisibleRails(newVisibleRails)
      }

      // Track all viewed rails
      if (enableRailViewsTracking && enableRailViewsTrackingExperiment.enabled) {
        viewableItems.forEach(({ item: { key, contextModule } }: { item: HomeModule }) => {
          if (contextModule && !viewedRails.has(key)) {
            viewedRails.add(key)
            tracking.trackEvent(
              HomeAnalytics.trackRailViewed({
                contextModule: contextModule,
                positionY: allModulesKeys.findIndex((moduleKey) => moduleKey === key),
              })
            )
          }
        })
      }
    }
  ).current

  const { isRefreshing, handleRefresh, scrollRefs } = useHandleRefresh(relay, modules)

  const renderItem: ListRenderItem<HomeModule> | null | undefined = useCallback(
    ({ item, index }: { item: HomeModule; index: number }) => {
      const trackingProps = extractArtworkActionTrackingProps(item)

      if (!item.data) {
        return <></>
      }

      switch (item.type) {
        case "marketingCollection":
          return (
            <MarketingCollectionRail
              {...trackingProps}
              contextModuleKey="curators-picks-emerging"
              home={props.homePageAbove}
              marketingCollection={item.data}
              marketingCollectionSlug="curators-picks-emerging-app"
            />
          )
        case "homeFeedOnboarding":
          return (
            <HomeFeedOnboardingRailFragmentContainer
              title={item.title}
              onboardingModule={item.data}
            />
          )
        case "meetYourNewAdvisor":
          return <MeetYourNewAdvisorRail title={item.title} />
        case "heroUnits":
          return <HeroUnitsRail heroUnits={item.data} />
        case "articles":
          return <ArticlesRailFragmentContainer title={item.title} articlesConnection={item.data} />
        case "artist":
          return (
            <ArtistRailFragmentContainer
              title={item.title}
              rail={item.data}
              scrollRef={scrollRefs.current[index]}
            />
          )
        case "artwork":
          return (
            <ArtworkModuleRailFragmentContainer
              {...trackingProps}
              title={item.title}
              rail={item.data || null}
              scrollRef={scrollRefs.current[index]}
            />
          )
        case "worksByArtistsYouFollow":
          return (
            <ArtworkModuleRailFragmentContainer
              {...trackingProps}
              title={item.title}
              rail={item.data || null}
              scrollRef={scrollRefs.current[index]}
            />
          )
        case "artwork-recommendations":
          return (
            <ArtworkRecommendationsRail
              {...trackingProps}
              title={item.title}
              me={item.data || null}
              isRailVisible={visibleRails.has(item.title)}
              scrollRef={scrollRefs.current[index]}
            />
          )
        case "collections":
          return enableNewCollectionsRail ? (
            <CollectionsRailFragmentContainer
              title={item.title}
              collectionsModule={item.data}
              scrollRef={scrollRefs.current[index]}
            />
          ) : (
            <OldCollectionsRailFragmentContainer
              title={item.title}
              collectionsModule={item.data}
              scrollRef={scrollRefs.current[index]}
            />
          )
        case "fairs":
          return (
            <FairsRailFragmentContainer
              title={item.title}
              subtitle={item.subtitle}
              fairsModule={item.data}
              scrollRef={scrollRefs.current[index]}
            />
          )
        case "galleriesForYouBanner":
          return <GalleriesForYouBanner />
        case "lotsByFollowedArtists":
          return (
            <LotsByFollowedArtistsRailContainer
              title={item.title}
              me={item.data}
              cardSize={enableNewSaleArtworkTileRailCard ? "large" : "small"}
            />
          )
        case "newWorksForYou":
          return (
            <NewWorksForYouRail
              {...trackingProps}
              artworkConnection={item.data}
              isRailVisible={visibleRails.has(item.title)}
              scrollRef={scrollRefs.current[index]}
              title={item.title}
            />
          )
        case "recommended-artists":
          return (
            <RecommendedArtistsRailFragmentContainer
              title={item.title}
              me={item.data}
              scrollRef={scrollRefs.current[index]}
            />
          )
        case "sales":
          return (
            <SalesRailFragmentContainer
              title={item.title}
              salesModule={item.data}
              scrollRef={scrollRefs.current[index]}
            />
          )
        case "shows":
          return (
            <ShowsRailContainer title={item.title} disableLocation={!enableShowsForYouLocation} />
          )
        case "auction-results":
          return (
            <AuctionResultsRail
              title={item.title}
              contextModule={item.contextModule!}
              auctionResults={item.data}
            />
          )
        case "viewing-rooms":
          return <ViewingRoomsHomeMainRail title={item.title} featured={item.data} />
        default:
          return null
      }
    },
    [visibleRails]
  )

  return (
    <View style={{ flex: 1 }}>
      <AboveTheFoldFlatList<HomeModule>
        testID="home-flat-list"
        data={modules}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
        prefetchUrlExtractor={(item) => item?.prefetchUrl}
        prefetchVariablesExtractor={(item) => item?.prefetchVariables}
        renderItem={renderItem}
        ListHeaderComponent={<HomeHeader />}
        ListFooterComponent={() => <Flex mb={4}>{!!loading && <BelowTheFoldPlaceholder />}</Flex>}
        ItemSeparatorComponent={ModuleSeparator}
        keyExtractor={(_item) => _item.key}
      />
      {!!props.meAbove && <EmailConfirmationBannerFragmentContainer me={props.meAbove} />}
    </View>
  )
})

const useHandleRefresh = (relay: RelayRefetchProp, modules: any[]) => {
  const scrollRefs = useRef<Array<RefObject<RailScrollRef>>>(modules.map((_) => createRef()))
  const [isRefreshing, setIsRefreshing] = useState(false)
  return useMemo(() => {
    const scrollRailsToTop = () => scrollRefs.current.forEach((r) => r.current?.scrollToTop())

    const handleRefresh = async () => {
      setIsRefreshing(true)

      relay.refetch(
        { heroImageVersion: isPad() ? "WIDE" : "NARROW" },
        {},
        (error) => {
          if (error) {
            console.error("Home.tsx - Error refreshing ForYou rails:", error.message)
          }
          setIsRefreshing(false)
          scrollRailsToTop()
        },
        { force: true }
      )
    }

    return { scrollRefs, isRefreshing, handleRefresh }
  }, [modules.join(""), relay])
}

export const HomeFragmentContainer = memo(
  createRefetchContainer(
    Home,
    {
      // Make sure not to include modules that are part of "homePageBelow"
      homePageAbove: graphql`
        fragment Home_homePageAbove on HomePage {
          ...MarketingCollectionRail_home
          activeBidsArtworkModule: artworkModule(key: ACTIVE_BIDS) {
            results {
              id
            }
            ...ArtworkModuleRail_rail
          }
          salesModule {
            ...SalesRail_salesModule
          }
          recommendedArtistsArtistModule: artistModule(key: SUGGESTED) {
            ...ArtistRail_rail
          }
        }
      `,
      // Make sure to exclude all modules that are part of "homePageAbove"
      homePageBelow: graphql`
        fragment Home_homePageBelow on HomePage @argumentDefinitions {
          recentlyViewedWorksArtworkModule: artworkModule(key: RECENTLY_VIEWED_WORKS) {
            results {
              id
            }
            ...ArtworkModuleRail_rail
          }
          similarToRecentlyViewedArtworkModule: artworkModule(key: SIMILAR_TO_RECENTLY_VIEWED) {
            results {
              id
            }
            ...ArtworkModuleRail_rail
          }
          worksFromGalleriesYouFollowArtworkModule: artworkModule(key: FOLLOWED_GALLERIES) {
            results {
              id
            }
            ...ArtworkModuleRail_rail
          }
          popularArtistsArtistModule: artistModule(key: CURATED_TRENDING) {
            ...ArtistRail_rail
          }
          fairsModule {
            ...FairsRail_fairsModule
          }
          marketingCollectionsModule {
            ...OldCollectionsRail_collectionsModule
            ...CollectionsRail_collectionsModule
          }
          _onboardingModule: onboardingModule @optionalField {
            showMyCollectionCard
            showSWACard
          }

          onboardingModule @optionalField {
            ...HomeFeedOnboardingRail_onboardingModule
          }
        }
      `,
      meAbove: graphql`
        fragment Home_meAbove on Me {
          counts {
            savedArtworks
          }
          ...EmailConfirmationBanner_me
          lotsByFollowedArtistsConnectionCount: lotsByFollowedArtistsConnection(
            first: 1
            includeArtworksByFollowedArtists: true
            isAuction: true
            liveSale: true
          ) {
            edges {
              node {
                id
              }
            }
          }
          ...LotsByFollowedArtistsRail_me
        }
      `,
      meBelow: graphql`
        fragment Home_meBelow on Me {
          artistRecommendationsCounts: artistRecommendations(first: 1) {
            totalCount
          }
          ...RecommendedArtistsRail_me

          artworkRecommendationsCounts: artworkRecommendations(first: 1) {
            totalCount
          }

          ...ArtworkRecommendationsRail_me

          auctionResultsByFollowedArtistsPast: auctionResultsByFollowedArtists(
            first: 12
            state: PAST
          ) {
            ...AuctionResultsRail_auctionResults
            edges {
              node {
                internalID
              }
            }
          }
        }
      `,
      articlesConnection: graphql`
        fragment Home_articlesConnection on ArticleConnection {
          ...ArticlesRail_articlesConnection
        }
      `,
      featured: graphql`
        fragment Home_featured on ViewingRoomConnection {
          ...ViewingRoomsListFeatured_featured
        }
      `,
      newWorksForYou: graphql`
        fragment Home_newWorksForYou on Viewer {
          ...NewWorksForYouRail_artworkConnection
        }
      `,
      heroUnits: graphql`
        fragment Home_heroUnits on HeroUnitConnection {
          ...HeroUnitsRail_heroUnitsConnection
        }
      `,
      emergingPicks: graphql`
        fragment Home_emergingPicks on MarketingCollection {
          ...MarketingCollectionRail_marketingCollection
            @arguments(input: { sort: "-decayed_merch" })
        }
      `,
    },
    graphql`
      query HomeRefetchQuery($version: String) {
        homePage @optionalField {
          ...Home_homePageAbove
        }
        homePageBelow: homePage @optionalField {
          ...Home_homePageBelow
        }
        me @optionalField {
          ...Home_meAbove
          ...RecommendedArtistsRail_me
        }
        meBelow: me @optionalField {
          ...Home_meBelow
        }
        featured: viewingRooms(featured: true) @optionalField {
          ...Home_featured
        }
        articlesConnection(first: 10, sort: PUBLISHED_AT_DESC, inEditorialFeed: true)
          @optionalField {
          ...Home_articlesConnection
        }
        newWorksForYou: viewer {
          ...Home_newWorksForYou
        }
        emergingPicks: marketingCollection(slug: "curators-picks-emerging") @optionalField {
          ...Home_emergingPicks
        }
      }
    `
  )
)

const ModuleSeparator = () => <Spacer y={MODULE_SEPARATOR_HEIGHT} />

const BelowTheFoldPlaceholder: React.FC = () => {
  return (
    <ProvidePlaceholderContext>
      <Flex>
        <Flex ml={2} mt={4}>
          <RandomWidthPlaceholderText minWidth={100} maxWidth={200} marginBottom={20} />
          <Flex flexDirection="row">
            {times(4).map((i) => (
              <PlaceholderBox key={i} width={280} height={370} marginRight={15} />
            ))}
          </Flex>
        </Flex>

        {times(2).map((r) => (
          <Box key={r}>
            <ModuleSeparator />
            <Box ml={2} mr={2}>
              <RandomWidthPlaceholderText minWidth={100} maxWidth={200} />
              <Flex flexDirection="row">
                <Join separator={<Spacer x="15px" />}>
                  {times(10).map((index) => (
                    <PlaceholderBox key={index} height={270} width={270} />
                  ))}
                </Join>
                <Spacer y={2} />
              </Flex>
            </Box>
          </Box>
        ))}
      </Flex>
    </ProvidePlaceholderContext>
  )
}

const HomePlaceholder: React.FC = () => {
  const randomValue = useMemoizedRandom()

  return (
    <Flex>
      <Box mb={1} mt={2}>
        <Flex alignItems="center">
          <ArtsyLogoBlackIcon scale={0.75} />
          <ActivityIndicator hasUnseenNotifications={false} />
        </Flex>
      </Box>
      <Spacer y={4} />

      {
        // Small tiles to mimic the artwork rails
        <Box ml={2} mr={2}>
          <RandomWidthPlaceholderText minWidth={100} maxWidth={200} />
          <Spacer y={0.5} />
          <Flex flexDirection="row">
            <LargeArtworkRailPlaceholder />
          </Flex>
        </Box>
      }

      <ModuleSeparator />

      {/* Larger tiles to mimic the artist rails */}
      <Box ml={2} mr={2}>
        <RandomWidthPlaceholderText minWidth={100} maxWidth={200} />
        <Spacer y={0.5} />
        <Flex flexDirection="row" mt={0.5}>
          <Join separator={<Spacer x="15px" />}>
            {times(3 + randomValue * 10).map((index) => (
              <Flex key={index}>
                <PlaceholderBox key={index} height={180} width={295} />
                <Spacer y={1} />
                <PlaceholderText width={120} />
                <RandomWidthPlaceholderText minWidth={30} maxWidth={90} />
              </Flex>
            ))}
          </Join>
          <ModuleSeparator />
        </Flex>
      </Box>

      <Flex ml={2} mt={4}>
        <RandomWidthPlaceholderText minWidth={100} maxWidth={200} marginBottom={20} />
        <Flex flexDirection="row">
          {times(4).map((i) => (
            <PlaceholderBox key={i} width={280} height={370} marginRight={15} />
          ))}
        </Flex>
      </Flex>
    </Flex>
  )
}

const messages = {
  confirmed: {
    title: "Email Confirmed",
    message: "Your email has been confirmed.",
  },
  already_confirmed: {
    title: "Already Confirmed",
    message: "You have already confirmed your email.",
  },
  invalid_token: {
    title: "Error",
    message: "An error has occurred. Please contact supportartsy.net.",
  },
  blank_token: {
    title: "Error",
    message: "An error has occurred. Please contact supportartsy.net.",
  },
  expired_token: {
    title: "Link Expired",
    message: "Link expired. Please request a new verification email below.",
  },
}

interface HomeQRProps {
  environment?: RelayModernEnvironment | RelayMockEnvironment
}

export const HomeQueryRenderer: React.FC<HomeQRProps> = ({ environment }) => {
  const { flash_message } = GlobalStore.useAppState(
    (state) => state.bottomTabs.sessionState.tabProps.home ?? {}
  ) as {
    flash_message?: string
  }

  const worksForYouRecommendationsModel = useExperimentVariant(RECOMMENDATION_MODEL_EXPERIMENT_NAME)

  useEffect(() => {
    // We would like to trigger the tracking only if the experiment is enabled
    if (worksForYouRecommendationsModel.enabled) {
      maybeReportExperimentVariant({
        experimentName: RECOMMENDATION_MODEL_EXPERIMENT_NAME,
        enabled: worksForYouRecommendationsModel.enabled,
        variantName: worksForYouRecommendationsModel.variant,
        payload: worksForYouRecommendationsModel.payload,
        context_module: ContextModule.newWorksForYouRail,
        context_owner_type: OwnerType.home,
        context_owner_screen: OwnerType.home,
        storeContext: true,
      })
    }
  }, [worksForYouRecommendationsModel.enabled])

  useEffect(() => {
    if (flash_message) {
      const message = messages[flash_message as keyof typeof messages]

      if (!message) {
        console.error(`Invalid flash_message type ${JSON.stringify(flash_message)}`)
        return
      }

      Alert.alert(message.title, message.message, [{ text: "Ok" }])
      // reset the tab props because we don't want this message to show again
      // if the home screen remounts for whatever reason.
      GlobalStore.actions.bottomTabs.setTabProps({ tab: "home", props: {} })
    }
  }, [flash_message])

  return (
    <AboveTheFoldQueryRenderer<HomeAboveTheFoldQuery, HomeBelowTheFoldQuery>
      environment={environment || getRelayEnvironment()}
      above={{
        query: graphql`
          query HomeAboveTheFoldQuery($version: String!) {
            homePage @optionalField {
              ...Home_homePageAbove
            }
            me @optionalField {
              ...Home_meAbove
            }
            newWorksForYou: viewer @optionalField {
              ...Home_newWorksForYou
            }
            heroUnitsConnection(first: 10, private: false) @optionalField {
              ...Home_heroUnits
              ...HeroUnitsRail_heroUnitsConnection
            }
          }
        `,
        variables: {
          version: worksForYouRecommendationsModel.payload || DEFAULT_RECS_MODEL_VERSION,
        },
      }}
      below={{
        query: graphql`
          query HomeBelowTheFoldQuery {
            homePage @optionalField {
              ...Home_homePageBelow
            }
            emergingPicks: marketingCollection(slug: "curators-picks-emerging") @optionalField {
              ...Home_emergingPicks
            }
            featured: viewingRooms(featured: true) @optionalField {
              ...Home_featured
            }
            me @optionalField {
              ...Home_meBelow
              ...RecommendedArtistsRail_me
            }
            articlesConnection(first: 10, sort: PUBLISHED_AT_DESC, inEditorialFeed: true)
              @optionalField {
              ...Home_articlesConnection
            }
          }
        `,
        variables: {
          version: worksForYouRecommendationsModel.payload || "B",
        },
      }}
      render={{
        renderComponent: ({ above, below }) => {
          if (!above) {
            throw new Error("no data")
          }

          return (
            <HomeFragmentContainer
              articlesConnection={below?.articlesConnection ?? null}
              emergingPicks={below?.emergingPicks ?? null}
              featured={below ? below.featured : null}
              homePageAbove={above.homePage}
              homePageBelow={below ? below.homePage : null}
              newWorksForYou={above.newWorksForYou}
              meAbove={above.me}
              meBelow={below ? below.me : null}
              loading={!below}
              heroUnits={above ? above.heroUnitsConnection : null}
            />
          )
        },
        renderPlaceholder: () => <HomePlaceholder />,
      }}
      cacheConfig={{ force: true }}
      belowTheFoldTimeout={100}
    />
  )
}
