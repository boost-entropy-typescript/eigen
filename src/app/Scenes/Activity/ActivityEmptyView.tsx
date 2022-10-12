import { useStickyTabPageContext } from "app/Components/StickyTabPage/StickyTabPageContext"
import { StickyTabPageFlatListContext } from "app/Components/StickyTabPage/StickyTabPageFlatList"
import { Flex, Spacer, Text } from "palette"
import { useContext } from "react"
import Animated from "react-native-reanimated"
import { NotificationType } from "./types"

interface ActivityEmptyViewProps {
  type: NotificationType
}

const entityByType: Record<NotificationType, { title: string; message: string }> = {
  all: {
    title: "You haven’t followed any artists, galleries or fairs yet.",
    message:
      "Follow artists to keep track of their latest work and career highlights. Following artists helps Artsy to recommend works you might like.",
  },
  alerts: {
    title: "You haven’t created any Alerts yet.",
    message:
      "Filter for the artworks you love on an Artist Page and tap ‘Create Alert’ to be notified when new works are added to Artsy.",
  },
}

export const ActivityEmptyView: React.FC<ActivityEmptyViewProps> = ({ type }) => {
  const { staticHeaderHeight } = useStickyTabPageContext()
  const { tabSpecificContentHeight } = useContext(StickyTabPageFlatListContext)
  const headerHeight = Animated.add(staticHeaderHeight ?? 0, tabSpecificContentHeight ?? 0)
  const entity = entityByType[type]

  return (
    <Flex flex={1} accessibilityLabel="Activities are empty">
      <Animated.View
        style={{
          height: headerHeight ?? 0,
        }}
      />
      <Flex flex={1} justifyContent="center" mx={2}>
        <Text textAlign="center">{entity.title}</Text>
        <Spacer mt={2} />
        <Text variant="xs" color="black60" textAlign="center">
          {entity.message}
        </Text>
      </Flex>
    </Flex>
  )
}
