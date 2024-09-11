import { ContextModule, OwnerType } from "@artsy/cohesion"
import { Flex } from "@artsy/palette-mobile"
import { HomeViewSectionViewingRooms_section$key } from "__generated__/HomeViewSectionViewingRooms_section.graphql"
import { SectionTitle } from "app/Components/SectionTitle"
import {
  ViewingRoomsHomeRail as LegacyViewingRoomsHomeRail,
  ViewingRoomsRailPlaceholder,
} from "app/Scenes/ViewingRoom/Components/ViewingRoomsHomeRail"
import { navigate } from "app/system/navigation/navigate"
import { Suspense } from "react"
import { graphql, useFragment } from "react-relay"

export const HomeViewSectionViewingRooms: React.FC<{
  section: HomeViewSectionViewingRooms_section$key
}> = ({ section }) => {
  const data = useFragment(viewingRoomsFragment, section)
  const componentHref = data.component?.behaviors?.viewAll?.href

  return (
    <Flex>
      <Flex px={2}>
        <SectionTitle
          title={data.component?.title}
          onPress={
            componentHref
              ? () => {
                  navigate(componentHref)
                }
              : undefined
          }
        />
      </Flex>
      <Suspense fallback={<ViewingRoomsRailPlaceholder />}>
        <LegacyViewingRoomsHomeRail
          trackInfo={{
            screen: OwnerType.home,
            ownerType: OwnerType.home,
            contextModule: data.internalID as ContextModule,
          }}
        />
      </Suspense>
    </Flex>
  )
}

const viewingRoomsFragment = graphql`
  fragment HomeViewSectionViewingRooms_section on HomeViewSectionViewingRooms {
    internalID
    component {
      title
      behaviors {
        viewAll {
          href
        }
      }
    }
  }
`
