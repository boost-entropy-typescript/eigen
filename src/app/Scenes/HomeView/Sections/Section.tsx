import { HomeViewSectionsConnection_viewer$data } from "__generated__/HomeViewSectionsConnection_viewer.graphql"
import { ArtworksRailHomeViewSection } from "app/Scenes/HomeView/Sections/ArtworksRailHomeViewSection"
import { GenericHomeViewSection } from "app/Scenes/HomeView/Sections/GenericHomeViewSection"
import { ExtractNodeType } from "app/utils/relayHelpers"
import { Text } from "react-native-svg"

type SectionsConnection = NonNullable<
  HomeViewSectionsConnection_viewer$data["homeView"]["sectionsConnection"]
>

type SectionT = ExtractNodeType<SectionsConnection>

export const Section: React.FC<{ section: SectionT }> = (props) => {
  const { section } = props

  switch (section.__typename) {
    case "ArtworksRailHomeViewSection":
      return <ArtworksRailHomeViewSection section={section} />
    case "GenericHomeViewSection":
      return <GenericHomeViewSection section={section} />
    default:
      if (__DEV__) {
        return <Text>Non supported section: {section.__typename}</Text>
      }
      return null
  }
}
