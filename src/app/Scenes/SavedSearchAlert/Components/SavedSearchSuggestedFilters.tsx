import { ChevronIcon, Flex, Skeleton, SkeletonBox, Text, Touchable } from "@artsy/palette-mobile"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { SavedSearchSuggestedFiltersFetchQuery } from "__generated__/SavedSearchSuggestedFiltersFetchQuery.graphql"
import { SearchCriteria } from "app/Components/ArtworkFilter/SavedSearch/types"
import { SavedSearchFilterPill } from "app/Scenes/SavedSearchAlert/Components/SavedSearchFilterPill"
import { CreateSavedSearchAlertNavigationStack } from "app/Scenes/SavedSearchAlert/SavedSearchAlertModel"
import { SavedSearchStore } from "app/Scenes/SavedSearchAlert/SavedSearchStore"
import { isValueSelected, useSavedSearchFilter } from "app/Scenes/SavedSearchAlert/helpers"
import { Suspense } from "react"
import { graphql, useLazyLoadQuery } from "react-relay"

const SUPPORTED_SEARCH_CRITERIA = [
  SearchCriteria.additionalGeneIDs,
  SearchCriteria.attributionClass,
  SearchCriteria.priceRange,
]

export const SavedSearchSuggestedFilters: React.FC<{}> = () => {
  const attributes = SavedSearchStore.useStoreState((state) => state.attributes)

  const data = useLazyLoadQuery<SavedSearchSuggestedFiltersFetchQuery>(
    savedSearchSuggestedFiltersFetchQuery,
    { attributes: { artistIDs: attributes.artistIDs } }
  )

  const { handlePress: handleAttributionClassPress } = useSavedSearchFilter({
    criterion: SearchCriteria.attributionClass,
  })
  const { handlePress: handleAdditionalGeneIDsPress } = useSavedSearchFilter({
    criterion: SearchCriteria.additionalGeneIDs,
  })

  const { handlePress: handlePriceRangePress } = useSavedSearchFilter({
    criterion: SearchCriteria.priceRange,
  })

  if (!data?.previewSavedSearch?.suggestedFilters) {
    return (
      <Flex py={1}>
        <Flex flexDirection="row" alignItems="center" flexWrap="wrap">
          <Text color="black60">
            There are no suggested filters for this artist, set your own filters manually.
            <MoreFiltersButton text="Add Filters" />
          </Text>
        </Flex>
      </Flex>
    )
  }

  const suggestedFilters = data.previewSavedSearch.suggestedFilters.filter((filter) => {
    // Adding this check to make sure we don't add a filter type that's not
    // supported in the app
    return SUPPORTED_SEARCH_CRITERIA.indexOf(filter.field as SearchCriteria) > -1
  })

  const handlePress = (field: SearchCriteria, value: string) => {
    switch (field) {
      // These are all array values
      case SearchCriteria.attributionClass:
        handleAttributionClassPress(value)
        break
      case SearchCriteria.additionalGeneIDs:
        handleAdditionalGeneIDsPress(value)
        break

      // These are all string values
      case SearchCriteria.priceRange:
        handlePriceRangePress(value)
        break

      default:
        break
    }
  }

  return (
    <Flex flexDirection="row" flexWrap="wrap" mt={1} mx={-0.5} alignItems="center">
      {suggestedFilters.map((pill) => (
        <SavedSearchFilterPill
          key={pill.name + pill.value}
          m={0.5}
          accessibilityLabel={"Select " + pill.displayValue + " as a " + pill.name}
          selected={isValueSelected({
            selectedAttributes: attributes[pill.field as SearchCriteria] || [],
            value: pill.value,
          })}
          onPress={() => {
            handlePress(pill.field as SearchCriteria, pill.value)
          }}
        >
          {pill.displayValue}
        </SavedSearchFilterPill>
      ))}

      <MoreFiltersButton text="More Filters" />
    </Flex>
  )
}

const MoreFiltersButton: React.FC<{ text: string }> = ({ text }) => {
  const navigation =
    useNavigation<NavigationProp<CreateSavedSearchAlertNavigationStack, "CreateSavedSearchAlert">>()

  return (
    <Touchable
      onPress={() => {
        navigation.navigate("SavedSearchFilterScreen")
      }}
    >
      <Flex px={1} flexDirection="row" alignItems="center">
        <Text color="blue" variant="xs">
          {text}
        </Text>
        <ChevronIcon
          height={14}
          width={14}
          direction="right"
          fill="blue100"
          ml={0.5}
          // More filters has no characters that extend below the baseline,
          // adding one pixel here for more visually appealing vertical centering that matches the design
          top="1px"
        />
      </Flex>
    </Touchable>
  )
}

export const SavedSearchSuggestedFiltersQueryRenderer = () => {
  return (
    <Suspense fallback={<SavedSearchSuggestedFiltersPlaceholder />}>
      <SavedSearchSuggestedFilters />
    </Suspense>
  )
}

const SavedSearchSuggestedFiltersPlaceholder: React.FC = ({}) => {
  return (
    <Skeleton>
      <Flex p={2} justifyContent="center">
        <Flex flexDirection="row">
          <SkeletonBox mr={1} mb={1} width={100} height={30} borderRadius={15} />
          <SkeletonBox mr={1} mb={1} width={140} height={30} borderRadius={15} />
        </Flex>
      </Flex>
    </Skeleton>
  )
}

const savedSearchSuggestedFiltersFetchQuery = graphql`
  query SavedSearchSuggestedFiltersFetchQuery($attributes: PreviewSavedSearchAttributes!) {
    previewSavedSearch(attributes: $attributes) @optionalField {
      suggestedFilters {
        displayValue
        field
        name
        value
      }
    }
  }
`
