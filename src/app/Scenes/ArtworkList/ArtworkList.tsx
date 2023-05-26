import { OwnerType } from "@artsy/cohesion"
import { Flex, Separator, useScreenDimensions, useSpace } from "@artsy/palette-mobile"
import { ArtworkListQuery, CollectionArtworkSorts } from "__generated__/ArtworkListQuery.graphql"
import { ArtworkList_artworksConnection$key } from "__generated__/ArtworkList_artworksConnection.graphql"
import { GenericGridPlaceholder } from "app/Components/ArtworkGrids/GenericGrid"
import { InfiniteScrollArtworksGridContainer } from "app/Components/ArtworkGrids/InfiniteScrollArtworksGrid"
import { ArtworkListProvider } from "app/Components/ArtworkLists/ArtworkListContext"
import { SortOption, SortByModal } from "app/Components/SortByModal/SortByModal"
import { PAGE_SIZE } from "app/Components/constants"
import { ArtworkListArtworksGridHeader } from "app/Scenes/ArtworkList/ArtworkListArtworksGridHeader"
import { ArtworkListEmptyState } from "app/Scenes/ArtworkList/ArtworkListEmptyState"
import { ArtworkListHeader } from "app/Scenes/ArtworkList/ArtworkListHeader"
import { PlaceholderText, ProvidePlaceholderContext } from "app/utils/placeholders"
import { useRefreshControl } from "app/utils/refreshHelpers"
import { ProvideScreenTrackingWithCohesionSchema } from "app/utils/track"
import { screen } from "app/utils/track/helpers"
import { FC, Suspense, useState } from "react"
import { graphql, useLazyLoadQuery, usePaginationFragment } from "react-relay"
import usePrevious from "react-use/lib/usePrevious"

interface ArtworkListScreenProps {
  listID: string
}

const SORT_OPTIONS: SortOption[] = [
  { value: "SAVED_AT_DESC", text: "Recently Added" },
  { value: "SAVED_AT_ASC", text: "First Added" },
]

const DEFAULT_SORT_OPTION = SORT_OPTIONS[0].value as CollectionArtworkSorts

export const ArtworkList: FC<ArtworkListScreenProps> = ({ listID }) => {
  const [sortModalVisible, setSortModalVisible] = useState(false)
  const [selectedSortValue, setSelectedSortValue] = useState(DEFAULT_SORT_OPTION)
  const prevSelectedSortValue = usePrevious(selectedSortValue)

  const queryData = useLazyLoadQuery<ArtworkListQuery>(
    artworkListScreenQuery,
    {
      listID,
      count: PAGE_SIZE,
      sort: DEFAULT_SORT_OPTION,
    },
    { fetchPolicy: "store-and-network" }
  )

  const { data, loadNext, hasNext, isLoadingNext, refetch } = usePaginationFragment<
    ArtworkListQuery,
    ArtworkList_artworksConnection$key
  >(artworkListFragment, queryData.me)

  const RefreshControl = useRefreshControl(refetch, { sort: selectedSortValue })

  const handleSortByModalClosed = () => {
    if (selectedSortValue === prevSelectedSortValue) {
      return
    }
    refetch(
      { sort: selectedSortValue },
      {
        fetchPolicy: "store-and-network",
      }
    )
  }

  const closeSortModal = () => {
    setSortModalVisible(false)
  }

  const handleSelectOption = (option: SortOption) => {
    setSelectedSortValue(option.value as CollectionArtworkSorts)
    closeSortModal()
  }

  const openSortModal = () => {
    setSortModalVisible(true)
  }

  const artworkList = data?.artworkList!
  const artworksCount = artworkList.artworks?.totalCount ?? 0

  if (artworksCount === 0) {
    return <ArtworkListEmptyState me={queryData.me!} refreshControl={RefreshControl} />
  }

  return (
    <ArtworkListProvider artworkListID={listID}>
      <ArtworkListHeader me={queryData.me} />
      <InfiniteScrollArtworksGridContainer
        connection={data?.artworkList?.artworks}
        loadMore={(pageSize, onComplete) => loadNext(pageSize, { onComplete } as any)}
        hasMore={() => hasNext}
        isLoading={() => isLoadingNext}
        HeaderComponent={
          <ArtworkListArtworksGridHeader
            title={artworkList.name}
            artworksCount={artworksCount}
            onSortButtonPress={openSortModal}
          />
        }
        shouldAddPadding
        refreshControl={RefreshControl}
      />
      <SortByModal
        visible={sortModalVisible}
        options={SORT_OPTIONS}
        selectedValue={selectedSortValue}
        onCloseModal={closeSortModal}
        onSelectOption={handleSelectOption}
        onModalFinishedClosing={handleSortByModalClosed}
      />
    </ArtworkListProvider>
  )
}

export const artworkListScreenQuery = graphql`
  query ArtworkListQuery(
    $listID: String!
    $count: Int
    $after: String
    $sort: CollectionArtworkSorts
  ) {
    me {
      ...ArtworkList_artworksConnection
        @arguments(listID: $listID, count: $count, after: $after, sort: $sort)
      ...ArtworkListEmptyState_me @arguments(listID: $listID)
      ...ArtworkListHeader_me @arguments(listID: $listID)
    }
  }
`

const artworkListFragment = graphql`
  fragment ArtworkList_artworksConnection on Me
  @refetchable(queryName: "ArtworkList_artworksConnectionRefetch")
  @argumentDefinitions(
    listID: { type: "String!" }
    count: { type: "Int", defaultValue: 10 }
    after: { type: "String" }
    sort: { type: "CollectionArtworkSorts" }
  ) {
    artworkList: collection(id: $listID) {
      internalID
      name
      default

      artworks: artworksConnection(first: $count, after: $after, sort: $sort)
        @connection(key: "ArtworkList_artworks") {
        totalCount
        edges {
          node {
            internalID
          }
        }
        ...InfiniteScrollArtworksGrid_connection
      }
    }
  }
`

export const ArtworkListScreen: FC<ArtworkListScreenProps> = (props) => {
  return (
    <ProvideScreenTrackingWithCohesionSchema
      info={screen({
        context_screen_owner_type: OwnerType.saves,
        context_screen_owner_id: props.listID,
      })}
    >
      <Suspense fallback={<ArtworkListPlaceholder />}>
        <ArtworkList {...props} />
      </Suspense>
    </ProvideScreenTrackingWithCohesionSchema>
  )
}

const ArtworkListPlaceholder = () => {
  const screen = useScreenDimensions()
  const space = useSpace()
  return (
    <ProvidePlaceholderContext>
      <ArtworkListHeader me={null} />

      <Flex px={2}>
        <PlaceholderText height={20} width={200} marginVertical={space(2)} />
        <Separator borderColor="black10" mt={1} mb={2} />
        <Flex justifyContent="space-between" flexDirection="row" mb={2}>
          <PlaceholderText width={120} height={22} />
          <PlaceholderText width={80} height={22} />
        </Flex>
        <GenericGridPlaceholder width={screen.width - space(4)} />
      </Flex>
    </ProvidePlaceholderContext>
  )
}
