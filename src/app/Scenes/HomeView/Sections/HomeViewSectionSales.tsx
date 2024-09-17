import { ContextModule, ScreenOwnerType } from "@artsy/cohesion"
import { Flex, Join, Skeleton, SkeletonBox, SkeletonText, Spacer } from "@artsy/palette-mobile"
import { HomeViewSectionSalesQuery } from "__generated__/HomeViewSectionSalesQuery.graphql"
import { HomeViewSectionSales_section$key } from "__generated__/HomeViewSectionSales_section.graphql"
import { BrowseMoreRailCard } from "app/Components/BrowseMoreRailCard"
import { CardRailCard, CardRailMetadataContainer } from "app/Components/Home/CardRailCard"
import { CardRailFlatList } from "app/Components/Home/CardRailFlatList"
import { SectionTitle } from "app/Components/SectionTitle"
import { LARGE_IMAGE_SIZE, SMALL_IMAGE_SIZE } from "app/Components/ThreeUpImageLayout"
import { HOME_VIEW_SECTIONS_SEPARATOR_HEIGHT } from "app/Scenes/HomeView/HomeView"
import { HomeViewSectionSalesItem } from "app/Scenes/HomeView/Sections/HomeViewSectionSalesItem"
import {
  HORIZONTAL_FLATLIST_INTIAL_NUMBER_TO_RENDER_DEFAULT,
  HORIZONTAL_FLATLIST_WINDOW_SIZE,
} from "app/Scenes/HomeView/helpers/constants"
import { useHomeViewTracking } from "app/Scenes/HomeView/useHomeViewTracking"
import { navigate } from "app/system/navigation/navigate"
import { extractNodes } from "app/utils/extractNodes"
import { withSuspense } from "app/utils/hooks/withSuspense"
import { useMemoizedRandom } from "app/utils/placeholders"
import { times } from "lodash"
import { useRef } from "react"
import { FlatList } from "react-native-gesture-handler"
import { graphql, useFragment, useLazyLoadQuery } from "react-relay"

interface HomeViewSectionSalesProps {
  section: HomeViewSectionSales_section$key
}

export const HomeViewSectionSales: React.FC<HomeViewSectionSalesProps> = (props) => {
  const tracking = useHomeViewTracking()

  const listRef = useRef<FlatList<any>>()
  const section = useFragment(fragment, props.section)

  const sales = extractNodes(section.salesConnection)
  if (sales.length === 0) return null

  const viewAll = section.component?.behaviors?.viewAll

  const onSectionViewAll = () => {
    if (viewAll?.href) {
      tracking.tappedAuctionResultGroupViewAll(
        section.contextModule as ContextModule,
        viewAll?.ownerType as ScreenOwnerType
      )

      navigate(viewAll.href)
    } else {
      tracking.tappedAuctionResultGroupViewAll(
        section.contextModule as ContextModule,
        "homeViewSection" as ScreenOwnerType
      )

      navigate(`/home-view/sections/${section.internalID}`, {
        passProps: {
          sectionType: section.__typename,
        },
      })
    }
  }

  return (
    <Flex my={HOME_VIEW_SECTIONS_SEPARATOR_HEIGHT}>
      <Flex px={2}>
        <SectionTitle
          title={section.component?.title}
          onPress={viewAll ? onSectionViewAll : undefined}
        />
      </Flex>
      <CardRailFlatList
        prefetchUrlExtractor={(item) => item?.href}
        prefetchVariablesExtractor={(item) => ({ saleSlug: item?.slug })}
        listRef={listRef}
        data={sales}
        initialNumToRender={HORIZONTAL_FLATLIST_INTIAL_NUMBER_TO_RENDER_DEFAULT}
        windowSize={HORIZONTAL_FLATLIST_WINDOW_SIZE}
        renderItem={({ item, index }) => {
          return (
            <HomeViewSectionSalesItem
              sale={item}
              onPress={(sale) => {
                tracking.tappedAuctionGroup(
                  sale.internalID,
                  sale.slug,
                  section.contextModule as ContextModule,
                  index
                )
              }}
            />
          )
        }}
        ListFooterComponent={
          viewAll ? (
            <BrowseMoreRailCard
              onPress={onSectionViewAll}
              text={viewAll.buttonText ?? "Browse All Auctions"}
            />
          ) : undefined
        }
      />
    </Flex>
  )
}

const fragment = graphql`
  fragment HomeViewSectionSales_section on HomeViewSectionSales {
    __typename
    internalID
    contextModule
    component {
      title
      behaviors {
        viewAll {
          buttonText
          href
          ownerType
        }
      }
    }

    salesConnection(first: 10) {
      edges {
        node {
          href
          slug
          ...HomeViewSectionSalesItem_sale
        }
      }
    }
  }
`

const HomeViewSectionSalesPlaceholder: React.FC = () => {
  const randomValue = useMemoizedRandom()
  return (
    <Skeleton>
      <Flex mx={2} my={HOME_VIEW_SECTIONS_SEPARATOR_HEIGHT}>
        <SkeletonText>Auctions</SkeletonText>

        <Spacer y={1} />

        <Flex flexDirection="row">
          <Join separator={<Spacer x="15px" />}>
            {times(2 + randomValue * 10).map((index) => (
              <CardRailCard key={index}>
                <Flex>
                  <Flex flexDirection="row">
                    <SkeletonBox height={LARGE_IMAGE_SIZE} width={LARGE_IMAGE_SIZE} />
                    <Flex>
                      <SkeletonBox
                        height={SMALL_IMAGE_SIZE}
                        width={SMALL_IMAGE_SIZE}
                        borderLeftWidth={2}
                        borderColor="white100"
                        borderBottomWidth={1}
                      />
                      <SkeletonBox
                        height={SMALL_IMAGE_SIZE}
                        width={SMALL_IMAGE_SIZE}
                        borderLeftWidth={2}
                        borderColor="white100"
                        borderTopWidth={1}
                      />
                    </Flex>
                  </Flex>
                  <CardRailMetadataContainer>
                    <SkeletonText variant="lg-display" numberOfLines={2}>
                      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                    </SkeletonText>
                  </CardRailMetadataContainer>
                </Flex>
              </CardRailCard>
            ))}
          </Join>
        </Flex>
      </Flex>
    </Skeleton>
  )
}

const homeViewSectionSalesQuery = graphql`
  query HomeViewSectionSalesQuery($id: String!) {
    homeView {
      section(id: $id) {
        ...HomeViewSectionSales_section
      }
    }
  }
`

export const HomeViewSectionSalesQueryRenderer: React.FC<{
  sectionID: string
}> = withSuspense((props) => {
  const data = useLazyLoadQuery<HomeViewSectionSalesQuery>(homeViewSectionSalesQuery, {
    id: props.sectionID,
  })

  if (!data.homeView.section) {
    return null
  }

  return <HomeViewSectionSales section={data.homeView.section} />
}, HomeViewSectionSalesPlaceholder)
