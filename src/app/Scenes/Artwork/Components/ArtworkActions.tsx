import {
  BellIcon,
  BellFillIcon,
  HeartFillIcon,
  HeartIcon,
  EyeOpenedIcon,
  ShareIcon,
  Flex,
  Box,
  ClassTheme,
} from "@artsy/palette-mobile"
import { ArtworkActionsSaveMutation } from "__generated__/ArtworkActionsSaveMutation.graphql"
import { ArtworkActions_artwork$data } from "__generated__/ArtworkActions_artwork.graphql"
import { LegacyNativeModules } from "app/NativeModules/LegacyNativeModules"
import { unsafe__getEnvironment, unsafe_getFeatureFlag } from "app/store/GlobalStore"
import { cm2in } from "app/utils/conversions"
import { refreshFavoriteArtworks } from "app/utils/refreshHelpers"
import { Schema, track } from "app/utils/track"
import { take } from "lodash"
import { Text, Touchable } from "palette"
import React from "react"
import { StyleSheet, TouchableWithoutFeedback } from "react-native"
import { commitMutation, createFragmentContainer, graphql, RelayProp } from "react-relay"
import styled from "styled-components/native"

interface ArtworkActionsProps {
  artwork: ArtworkActions_artwork$data
  relay?: RelayProp
  shareOnPress: () => void
}

export const shareContent = (
  title: string,
  href: string,
  artists: ArtworkActions_artwork$data["artists"]
) => {
  let computedTitle: string | null = null

  if (artists && artists.length) {
    const names = take(artists, 3).map((artist) => artist?.name)
    computedTitle = `${title} by ${names.join(", ")} on Artsy`
  } else if (title) {
    computedTitle = `${title} on Artsy`
  }

  return {
    title: computedTitle,
    message: computedTitle,
    url: `${unsafe__getEnvironment().webURL}${href}?utm_content=artwork-share`,
  }
}

@track()
export class ArtworkActions extends React.Component<ArtworkActionsProps> {
  @track((props: ArtworkActionsProps) => {
    return {
      action_name: props.artwork.is_saved
        ? Schema.ActionNames.ArtworkUnsave
        : Schema.ActionNames.ArtworkSave,
      action_type: Schema.ActionTypes.Success,
      context_module: Schema.ContextModules.ArtworkActions,
    }
  })
  handleArtworkSave() {
    const { artwork, relay } = this.props
    commitMutation<ArtworkActionsSaveMutation>(relay?.environment!, {
      mutation: graphql`
        mutation ArtworkActionsSaveMutation($input: SaveArtworkInput!) {
          saveArtwork(input: $input) {
            artwork {
              id
              is_saved: isSaved
            }
          }
        }
      `,
      variables: { input: { artworkID: artwork.internalID, remove: artwork.is_saved } },
      // @ts-ignore RELAY 12 MIGRATION
      optimisticResponse: {
        saveArtwork: { artwork: { id: artwork.id, is_saved: !artwork.is_saved } },
      },
      onCompleted: () => {
        refreshFavoriteArtworks()
      },
      onError: () => {
        refreshFavoriteArtworks()
      },
    })
  }

  @track(() => ({
    action_name: Schema.ActionNames.ViewInRoom,
    action_type: Schema.ActionTypes.Tap,
    context_module: Schema.ContextModules.ArtworkActions,
  }))
  openViewInRoom() {
    const {
      artwork: { image, id, slug, heightCm, widthCm },
    } = this.props
    const heightIn = cm2in(heightCm!)
    const widthIn = cm2in(widthCm!)

    LegacyNativeModules.ARTNativeScreenPresenterModule.presentAugmentedRealityVIR(
      image?.url!,
      widthIn,
      heightIn,
      slug,
      id
    )
  }

  render() {
    const {
      artwork: { is_saved, is_hangable, sale },
    } = this.props

    const isOpenSale = sale && sale.isAuction && !sale.isClosed
    const enableArtworkRedesign = unsafe_getFeatureFlag("ARArtworkRedesingPhase2")
    return (
      <Flex justifyContent="center" flexDirection="row" width="100%">
        {!!enableArtworkRedesign ? null : isOpenSale ? (
          <Touchable haptic onPress={() => this.handleArtworkSave()}>
            <UtilButton pr={2}>
              {is_saved ? (
                <BellFillIcon accessibilityLabel="unwatch lot icon" mr={0.5} fill="blue100" />
              ) : (
                <BellIcon accessibilityLabel="watch lot icon" mr={0.5} />
              )}
              <ClassTheme>
                {({ color }) => (
                  <Text variant="sm" color={is_saved ? color("blue100") : color("black100")}>
                    Watch lot
                  </Text>
                )}
              </ClassTheme>
            </UtilButton>
          </Touchable>
        ) : (
          <Touchable haptic onPress={() => this.handleArtworkSave()}>
            <UtilButton pr={2}>
              {is_saved ? <HeartFillIcon mr={0.5} fill="blue100" /> : <HeartIcon mr={0.5} />}
              <Box position="relative">
                {/* Longest text transparent to prevent changing text pushing elements on the right */}
                {/* Hiding it in the testing environment since it is not visible to the users */}
                {!__TEST__ && (
                  <Text variant="sm" color="transparent">
                    Saved
                  </Text>
                )}

                <Box {...StyleSheet.absoluteFillObject}>
                  <ClassTheme>
                    {({ color }) => (
                      <Text variant="sm" color={is_saved ? color("blue100") : color("black100")}>
                        {is_saved ? "Saved" : "Save"}
                      </Text>
                    )}
                  </ClassTheme>
                </Box>
              </Box>
            </UtilButton>
          </Touchable>
        )}

        {!!(LegacyNativeModules.ARCocoaConstantsModule.AREnabled && is_hangable) && (
          <TouchableWithoutFeedback onPress={() => this.openViewInRoom()}>
            <UtilButton pr={2}>
              <EyeOpenedIcon mr={0.5} />
              <Text variant="sm">View in Room</Text>
            </UtilButton>
          </TouchableWithoutFeedback>
        )}
        <Touchable haptic onPress={() => this.props.shareOnPress()}>
          <UtilButton>
            <ShareIcon mr={0.5} />
            <Text variant="sm">Share</Text>
          </UtilButton>
        </Touchable>
      </Flex>
    )
  }
}

const UtilButton = styled(Flex)`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`

export const ArtworkActionsFragmentContainer = createFragmentContainer(ArtworkActions, {
  artwork: graphql`
    fragment ArtworkActions_artwork on Artwork {
      id
      internalID
      slug
      title
      href
      is_saved: isSaved
      is_hangable: isHangable
      artists {
        name
      }
      image {
        url
      }
      sale {
        isAuction
        isClosed
      }
      widthCm
      heightCm
    }
  `,
})
