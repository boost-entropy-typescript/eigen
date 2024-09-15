import { Flex } from "@artsy/palette-mobile"
import { HomeViewSectionArtworks_section$key } from "__generated__/HomeViewSectionArtworks_section.graphql"
import { LargeArtworkRail_artworks$data } from "__generated__/LargeArtworkRail_artworks.graphql"
import { SmallArtworkRail_artworks$data } from "__generated__/SmallArtworkRail_artworks.graphql"
import { LargeArtworkRail } from "app/Components/ArtworkRail/LargeArtworkRail"
import { SectionTitle } from "app/Components/SectionTitle"
import { HOME_VIEW_SECTIONS_SEPARATOR_HEIGHT } from "app/Scenes/HomeView/HomeView"
import { getSectionHref } from "app/Scenes/HomeView/helpers/getSectionHref"
import { useHomeViewTracking } from "app/Scenes/HomeView/useHomeViewTracking"
import { navigate } from "app/system/navigation/navigate"
import { extractNodes } from "app/utils/extractNodes"
import { View } from "react-native"
import { graphql, useFragment } from "react-relay"

interface HomeViewSectionArtworksProps {
  section: HomeViewSectionArtworks_section$key
}

export const HomeViewSectionArtworks: React.FC<HomeViewSectionArtworksProps> = ({ section }) => {
  const tracking = useHomeViewTracking()

  const data = useFragment(fragment, section)
  const title = data.component?.title
  const artworks = extractNodes(data.artworksConnection)
  const componentHref = getSectionHref(data.internalID, data.component?.behaviors?.viewAll?.href)

  if (!artworks || artworks.length === 0) {
    return null
  }

  const handleOnArtworkPress = (
    artwork: LargeArtworkRail_artworks$data[0] | SmallArtworkRail_artworks$data[0],
    position: number
  ) => {
    tracking.tappedArtworkGroup(
      artwork.internalID,
      artwork.slug,
      artwork.collectorSignals,
      data.internalID,
      position
    )

    if (artwork.href) {
      navigate(artwork.href)
    }
  }

  return (
    <Flex my={HOME_VIEW_SECTIONS_SEPARATOR_HEIGHT}>
      <View>
        <Flex pl={2} pr={2}>
          <SectionTitle
            title={title}
            onPress={
              componentHref
                ? () => {
                    navigate(componentHref, {
                      passProps: {
                        sectionType: data.__typename,
                      },
                    })
                  }
                : undefined
            }
          />
        </Flex>
        <LargeArtworkRail
          artworks={artworks}
          onPress={handleOnArtworkPress}
          showSaveIcon
          onMorePress={
            componentHref
              ? () => {
                  navigate(componentHref, {
                    passProps: {
                      sectionType: data.__typename,
                    },
                  })
                }
              : undefined
          }
        />
      </View>
    </Flex>
  )
}

const fragment = graphql`
  fragment HomeViewSectionArtworks_section on HomeViewSectionArtworks {
    __typename
    internalID
    component {
      title
      behaviors {
        viewAll {
          href
        }
      }
    }

    artworksConnection(first: 10) {
      edges {
        node {
          ...LargeArtworkRail_artworks
        }
      }
    }
  }
`
