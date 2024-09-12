import { Flex } from "@artsy/palette-mobile"
import { HomeViewSectionFairs_section$key } from "__generated__/HomeViewSectionFairs_section.graphql"
import { CardRailFlatList } from "app/Components/Home/CardRailFlatList"
import { SectionTitle } from "app/Components/SectionTitle"
import { HomeViewSectionFairsFairItem } from "app/Scenes/HomeView/Sections/HomeViewSectionFairsFairItem"
import { useHomeViewTracking } from "app/Scenes/HomeView/useHomeViewTracking"
import { navigate } from "app/system/navigation/navigate"
import { extractNodes } from "app/utils/extractNodes"
import { graphql, useFragment } from "react-relay"

interface HomeViewSectionFairsProps {
  section: HomeViewSectionFairs_section$key
}

export const HomeViewSectionFairs: React.FC<HomeViewSectionFairsProps> = ({ section }) => {
  const tracking = useHomeViewTracking()

  const data = useFragment(fragment, section)
  const component = data.component
  const componentHref = component?.behaviors?.viewAll?.href

  if (!component) return null

  const fairs = extractNodes(data.fairsConnection)
  if (!fairs || fairs.length === 0) return null

  return (
    <Flex>
      <Flex pl={2} pr={2}>
        <SectionTitle
          title={component.title}
          subtitle={component.description}
          onPress={
            componentHref
              ? () => {
                  navigate(componentHref)
                }
              : undefined
          }
        />
      </Flex>

      <CardRailFlatList<any>
        data={fairs}
        initialNumToRender={3}
        renderItem={({ item, index }) => {
          return (
            <HomeViewSectionFairsFairItem
              key={item.internalID}
              fair={item}
              onPress={(fair) => {
                tracking.tappedFairGroup(fair.internalID, fair.slug, data.internalID, index)
              }}
            />
          )
        }}
      />
    </Flex>
  )
}

const fragment = graphql`
  fragment HomeViewSectionFairs_section on HomeViewSectionFairs {
    internalID
    component {
      title
      description
      behaviors {
        viewAll {
          href
        }
      }
    }

    fairsConnection(first: 10) {
      edges {
        node {
          internalID
          ...HomeViewSectionFairsFairItem_fair
        }
      }
    }
  }
`
