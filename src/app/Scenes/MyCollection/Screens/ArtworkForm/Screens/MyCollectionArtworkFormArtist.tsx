import { ContextModule, OwnerType } from "@artsy/cohesion"
import { Spacer } from "@artsy/palette-mobile"
import { StackScreenProps } from "@react-navigation/stack"
import { FancyModalHeader } from "app/Components/FancyModal/FancyModalHeader"
import { ScreenMargin } from "app/Scenes/MyCollection/Components/ScreenMargin"
import { ArtistAutosuggest } from "app/Scenes/MyCollection/Screens/ArtworkForm/Components/ArtistAutosuggest"
import { ArtworkFormScreen } from "app/Scenes/MyCollection/Screens/ArtworkForm/MyCollectionArtworkForm"
import { AutosuggestResult } from "app/Scenes/Search/AutosuggestResults"
import { AutosuggestResultsPlaceholder } from "app/Scenes/Search/components/placeholders/AutosuggestResultsPlaceholder"
import { GlobalStore } from "app/store/GlobalStore"
import { useFeatureFlag } from "app/utils/hooks/useFeatureFlag"
import { PlaceholderBox, PlaceholderText, ProvidePlaceholderContext } from "app/utils/placeholders"
import { Suspense } from "react"
import { useTracking } from "react-tracking"

export const MyCollectionArtworkFormArtist: React.FC<
  StackScreenProps<ArtworkFormScreen, "ArtworkFormArtist">
> = ({ route, navigation }) => {
  const enableCollectedArtists = useFeatureFlag("AREnableMyCollectionCollectedArtists")

  const tracking = useTracking()

  const preferredCurrency = GlobalStore.useAppState((state) => state.userPrefs.currency)
  const preferredMetric = GlobalStore.useAppState((state) => state.userPrefs.metric)

  const handleResultPress = async (result: AutosuggestResult) => {
    tracking.trackEvent(tracks.tappedArtist({ artistSlug: result.slug, artistId: result.slug }))

    GlobalStore.actions.myCollection.artwork.updateFormValues({
      metric: preferredMetric,
      pricePaidCurrency: preferredCurrency,
    })
    await GlobalStore.actions.myCollection.artwork.setArtistSearchResult(result)

    if (result.isPersonalArtist || result.counts?.artworks === 0) {
      navigation.navigate("ArtworkFormMain", { ...route.params })
    } else {
      navigation.navigate("ArtworkFormArtwork", { ...route.params })
    }
  }

  const handleSkipPress = async (artistDisplayName: string) => {
    GlobalStore.actions.myCollection.artwork.resetForm()

    if (enableCollectedArtists) {
      navigation.navigate("AddMyCollectionArtist", { ...route.params })
    } else {
      requestAnimationFrame(() => {
        GlobalStore.actions.myCollection.artwork.updateFormValues({
          artistDisplayName,
          metric: preferredMetric,
          pricePaidCurrency: preferredCurrency,
        })
        navigation.navigate("ArtworkFormMain", { ...route.params })
      })
    }
  }

  return (
    <>
      <FancyModalHeader hideBottomDivider onLeftButtonPress={route.params.onHeaderBackButtonPress}>
        Select an Artist
      </FancyModalHeader>
      <ScreenMargin>
        <Suspense fallback={<Placeholder />}>
          <ArtistAutosuggest onResultPress={handleResultPress} onSkipPress={handleSkipPress} />
        </Suspense>
      </ScreenMargin>
    </>
  )
}

const tracks = {
  tappedArtist: ({ artistId, artistSlug }: { artistId?: string; artistSlug?: string }) => ({
    context_screen: OwnerType.myCollectionAddArtworkArtist,
    context_module: ContextModule.myCollectionAddArtworkAddArtist,
    context_screen_owner_id: artistId,
    context_screen_owner_slug: artistSlug,
  }),
}

const Placeholder: React.FC = () => (
  <ProvidePlaceholderContext>
    <PlaceholderBox height={50} />
    <Spacer y={2} />
    <PlaceholderText width={250} />
    <Spacer y={4} />
    <PlaceholderText width={180} />
    <Spacer y={2} />
    <AutosuggestResultsPlaceholder />
  </ProvidePlaceholderContext>
)
