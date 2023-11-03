import { Flex, Spinner } from "@artsy/palette-mobile"
import { MyCollectionArtworkList_myCollectionConnection$key } from "__generated__/MyCollectionArtworkList_myCollectionConnection.graphql"
import { PrefetchFlatList, PrefetchFlatListProps } from "app/Components/PrefetchFlatList"
import { PAGE_SIZE } from "app/Components/constants"
import { extractNodes } from "app/utils/extractNodes"
import React, { useState } from "react"
import { Platform } from "react-native"
import { RelayPaginationProp, useFragment, graphql } from "react-relay"
import { MyCollectionArtworkListItem } from "./MyCollectionArtworkListItem"

export const MyCollectionArtworkList: React.FC<{
  myCollectionConnection: MyCollectionArtworkList_myCollectionConnection$key | null | undefined
  localSortAndFilterArtworks?: (artworks: any[]) => any[]
  loadMore: RelayPaginationProp["loadMore"]
  hasMore: RelayPaginationProp["hasMore"]
  isLoading: RelayPaginationProp["isLoading"]
  onScroll?: PrefetchFlatListProps<any>["onScroll"]
  scrollEventThrottle?: PrefetchFlatListProps<any>["scrollEventThrottle"]
}> = ({
  localSortAndFilterArtworks,
  isLoading,
  loadMore,
  hasMore,
  onScroll,
  scrollEventThrottle,
  ...restProps
}) => {
  const artworkConnection = useFragment(artworkConnectionFragment, restProps.myCollectionConnection)

  const artworks = extractNodes(artworkConnection)
  const preprocessedArtworks = localSortAndFilterArtworks?.(artworks) ?? artworks

  const [loadingMoreData, setLoadingMoreData] = useState(false)

  const loadMoreArtworks = () => {
    if (!hasMore() || isLoading()) {
      return
    }

    setLoadingMoreData(true)

    loadMore(PAGE_SIZE, (error) => {
      if (error) {
        console.log(error.message)
      }

      setLoadingMoreData(false)
    })
  }

  return (
    <Flex pb={Platform.OS === "android" ? 6 : 0}>
      <PrefetchFlatList
        data={preprocessedArtworks}
        renderItem={({ item }) => <MyCollectionArtworkListItem artwork={item} />}
        prefetchUrlExtractor={(artwork) => `/my-collection/artwork/${artwork.slug}`}
        prefetchVariablesExtractor={(artwork) => ({
          artworkSlug: artwork.slug,
          medium: artwork.medium,
          category: artwork.mediumType?.name,
          artistInternalID: artwork.artist?.internalID,
        })}
        onEndReached={loadMoreArtworks}
        keyExtractor={(item, index) => String(item.slug || index)}
        ListFooterComponent={
          loadingMoreData ? (
            <Flex mx="auto" mb="15px" mt="15px">
              <Spinner />
            </Flex>
          ) : null
        }
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      />
    </Flex>
  )
}

const artworkConnectionFragment = graphql`
  fragment MyCollectionArtworkList_myCollectionConnection on MyCollectionConnection {
    pageInfo {
      hasNextPage
      startCursor
      endCursor
    }
    edges {
      node {
        ...MyCollectionArtworkListItem_artwork
        ...MyCollectionArtworks_filterProps @relay(mask: false)
      }
    }
  }
`
