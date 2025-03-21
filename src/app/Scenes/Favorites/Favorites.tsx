import { Flex, FollowArtistIcon, HeartIcon, Pill, Screen } from "@artsy/palette-mobile"
import { AlertsTab } from "app/Scenes/Favorites/AlertsTab"
import { FavoritesContextStore, FavoritesTab } from "app/Scenes/Favorites/FavoritesContextStore"
import { FollowsTab } from "app/Scenes/Favorites/FollowsTab"
import { SavesTab } from "app/Scenes/Favorites/SavesTab"

const Content: React.FC = () => {
  const activeTab = FavoritesContextStore.useStoreState((state) => state.activeTab)
  switch (activeTab) {
    case "saves":
      return <SavesTab />
    case "follows":
      return <FollowsTab />
    case "alerts":
      return <AlertsTab />
  }
}

const Pills: {
  Icon: React.FC<{ fill: string }>
  title: string
  key: FavoritesTab
}[] = [
  {
    Icon: HeartIcon,
    title: "Saves",
    key: "saves",
  },
  {
    Icon: HeartIcon,
    title: "Alerts",
    key: "alerts",
  },
  {
    Icon: FollowArtistIcon,
    title: "Follows",
    key: "follows",
  },
]

const FavoritesHeader = () => {
  const setActiveTab = FavoritesContextStore.useStoreActions((actions) => actions.setActiveTab)
  const { activeTab } = FavoritesContextStore.useStoreState((state) => state)

  return (
    <Flex flexDirection="row" gap={0.5} mx={2}>
      {Pills.map(({ Icon, title, key }) => {
        const isActive = activeTab === key
        return (
          <Pill
            selected={isActive}
            onPress={() => setActiveTab(key)}
            Icon={() => (
              <Flex mr={0.5} justifyContent="center" bottom="1px">
                <Icon fill={isActive ? "white100" : "black100"} />
              </Flex>
            )}
            key={key}
          >
            {title}
          </Pill>
        )
      })}
    </Flex>
  )
}

export const FavoritesScreen: React.FC = () => {
  return (
    <Screen>
      <Screen.AnimatedHeader title="Favorites" hideLeftElements />

      <Screen.StickySubHeader title="Favorites" largeTitle separatorComponent={null}>
        <FavoritesHeader />
      </Screen.StickySubHeader>

      <Screen.Body fullwidth>
        <Content />
      </Screen.Body>
    </Screen>
  )
}

export const Favorites: React.FC<any> = (props) => {
  return (
    <FavoritesContextStore.Provider>
      <FavoritesScreen {...props} />
    </FavoritesContextStore.Provider>
  )
}
