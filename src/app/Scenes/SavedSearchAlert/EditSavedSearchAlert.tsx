import { OwnerType } from "@artsy/cohesion"
import { NavigationContainer } from "@react-navigation/native"
import { TransitionPresets, createStackNavigator } from "@react-navigation/stack"
import { EditSavedSearchAlertQuery } from "__generated__/EditSavedSearchAlertQuery.graphql"
import { EditSavedSearchAlert_artists$data } from "__generated__/EditSavedSearchAlert_artists.graphql"
import { EditSavedSearchAlert_artworksConnection$data } from "__generated__/EditSavedSearchAlert_artworksConnection.graphql"
import { EditSavedSearchAlert_viewer$data } from "__generated__/EditSavedSearchAlert_viewer.graphql"
import { SavedSearchAlertQuery } from "__generated__/SavedSearchAlertQuery.graphql"
import { Aggregations } from "app/Components/ArtworkFilter/ArtworkFilterHelpers"
import {
  SavedSearchEntity,
  SavedSearchEntityArtist,
  SearchCriteriaAttributes,
} from "app/Components/ArtworkFilter/SavedSearch/types"
import { EditSavedSearchAlertContent } from "app/Scenes/SavedSearchAlert/EditSavedSearchAlertContent"
import {
  EditSavedSearchAlertNavigationStack,
  EditSavedSearchAlertParams,
} from "app/Scenes/SavedSearchAlert/SavedSearchAlertModel"
import { AlertPriceRangeScreen } from "app/Scenes/SavedSearchAlert/screens/AlertPriceRangeScreen"
import { EmailPreferencesScreen } from "app/Scenes/SavedSearchAlert/screens/EmailPreferencesScreen"
import { goBack, GoBackProps, navigationEvents } from "app/system/navigation/navigate"
import { getRelayEnvironment } from "app/system/relay/defaultEnvironment"
import { ArtsyKeyboardAvoidingView } from "app/utils/ArtsyKeyboardAvoidingView"
import { renderWithPlaceholder } from "app/utils/renderWithPlaceholder"
import { ProvideScreenTracking, Schema } from "app/utils/track"
import React, { useCallback, useEffect } from "react"
import { createRefetchContainer, graphql, QueryRenderer, RelayRefetchProp } from "react-relay"
import { EditSavedSearchFormPlaceholder } from "./Components/EditSavedSearchAlertPlaceholder"
import { SavedSearchAlertQueryRenderer } from "./SavedSearchAlert"
import { SavedSearchStoreProvider, savedSearchModel } from "./SavedSearchStore"

interface EditSavedSearchAlertBaseProps {
  savedSearchAlertId: string
}

interface EditSavedSearchAlertProps {
  me: SavedSearchAlertQuery["response"]["me"]
  viewer: EditSavedSearchAlert_viewer$data
  artists: EditSavedSearchAlert_artists$data
  savedSearchAlertId: string
  artworksConnection: EditSavedSearchAlert_artworksConnection$data
  relay: RelayRefetchProp
}

const Stack = createStackNavigator<EditSavedSearchAlertNavigationStack>()

export const EditSavedSearchAlert: React.FC<EditSavedSearchAlertProps> = (props) => {
  const { me, viewer, artists, artworksConnection, savedSearchAlertId, relay } = props
  const aggregations = (artworksConnection.aggregations ?? []) as Aggregations
  const { userAlertSettings, ...attributes } = me?.savedSearch ?? {}
  const isCustomAlertsNotificationsEnabled = viewer.notificationPreferences.some((preference) => {
    return (
      preference.channel === "email" &&
      preference.name === "custom_alerts" &&
      preference.status === "SUBSCRIBED"
    )
  })
  const userAllowsEmails = isCustomAlertsNotificationsEnabled ?? false

  const formattedArtists: SavedSearchEntityArtist[] = artists.map((artist) => ({
    id: artist.internalID,
    name: artist.name!,
  }))
  const entity: SavedSearchEntity = {
    placeholder: formattedArtists[0].name ?? "",
    artists: formattedArtists,
    owner: {
      type: OwnerType.savedSearch,
      id: savedSearchAlertId,
      slug: "",
    },
  }

  const onComplete = () => {
    goBack({
      previousScreen: "EditSavedSearchAlert",
    })
  }

  const refetch = useCallback(
    (backProps?: GoBackProps) => {
      if (backProps?.previousScreen === "Unsubscribe") {
        relay.refetch({}, null, null, { force: true })
      }
    },
    [relay]
  )

  useEffect(() => {
    navigationEvents.addListener("goBack", refetch)

    return () => {
      navigationEvents.removeListener("goBack", refetch)
    }
  }, [])

  const params: EditSavedSearchAlertParams = {
    userAlertSettings,
    savedSearchAlertId,
    userAllowsEmails,
    onComplete,
    onDeleteComplete: onComplete,
  }

  return (
    <ProvideScreenTracking
      info={{
        context_screen: Schema.PageNames.SavedSearchEdit,
        context_screen_owner_id: savedSearchAlertId,
        context_screen_owner_type: OwnerType.savedSearch,
      }}
    >
      <ArtsyKeyboardAvoidingView>
        <SavedSearchStoreProvider
          runtimeModel={{
            ...savedSearchModel,
            attributes: attributes as SearchCriteriaAttributes,
            aggregations,
            entity,
          }}
        >
          <NavigationContainer independent>
            <Stack.Navigator
              // force it to not use react-native-screens, which is broken inside a react-native Modal for some reason
              detachInactiveScreens={false}
              screenOptions={{
                ...TransitionPresets.SlideFromRightIOS,
                headerShown: false,
                cardStyle: { backgroundColor: "white" },
              }}
            >
              <Stack.Screen
                name="EditSavedSearchAlertContent"
                component={EditSavedSearchAlertContent}
                initialParams={params}
              />
              <Stack.Screen name="EmailPreferences" component={EmailPreferencesScreen} />
              <Stack.Screen name="AlertPriceRange" component={AlertPriceRangeScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </SavedSearchStoreProvider>
      </ArtsyKeyboardAvoidingView>
    </ProvideScreenTracking>
  )
}

export const EditSavedSearchAlertRefetchContainer = createRefetchContainer(
  EditSavedSearchAlert,
  {
    viewer: graphql`
      fragment EditSavedSearchAlert_viewer on Viewer {
        notificationPreferences {
          status
          name
          channel
        }
      }
    `,
    artists: graphql`
      fragment EditSavedSearchAlert_artists on Artist @relay(plural: true) {
        internalID
        name
      }
    `,
    artworksConnection: graphql`
      fragment EditSavedSearchAlert_artworksConnection on FilterArtworksConnection {
        aggregations {
          slice
          counts {
            count
            name
            value
          }
        }
      }
    `,
  },
  graphql`
    query EditSavedSearchAlertRefetchQuery {
      viewer {
        ...EditSavedSearchAlert_viewer
      }
    }
  `
)

export const EditSavedSearchAlertQueryRenderer: React.FC<EditSavedSearchAlertBaseProps> = (
  props
) => {
  const { savedSearchAlertId } = props

  return (
    <SavedSearchAlertQueryRenderer
      savedSearchAlertId={savedSearchAlertId}
      render={renderWithPlaceholder({
        render: (relayProps: SavedSearchAlertQuery["response"]) => (
          <QueryRenderer<EditSavedSearchAlertQuery>
            environment={getRelayEnvironment()}
            query={graphql`
              query EditSavedSearchAlertQuery($artistIDs: [String]) {
                viewer {
                  ...EditSavedSearchAlert_viewer
                }
                artists(ids: $artistIDs) {
                  ...EditSavedSearchAlert_artists
                }
                artworksConnection(
                  first: 0
                  artistIDs: $artistIDs
                  aggregations: [ARTIST, LOCATION_CITY, MATERIALS_TERMS, MEDIUM, PARTNER, COLOR]
                ) {
                  ...EditSavedSearchAlert_artworksConnection
                }
              }
            `}
            variables={{ artistIDs: relayProps.me?.savedSearch?.artistIDs as string[] }}
            render={renderWithPlaceholder({
              Container: EditSavedSearchAlertRefetchContainer,
              renderPlaceholder: () => <EditSavedSearchFormPlaceholder />,
              initialProps: { savedSearchAlertId, ...relayProps },
            })}
            cacheConfig={{ force: true }}
          />
        ),
        renderPlaceholder: () => <EditSavedSearchFormPlaceholder />,
      })}
    />
  )
}
