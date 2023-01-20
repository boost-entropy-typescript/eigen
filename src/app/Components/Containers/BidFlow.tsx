import { TimeOffsetProvider } from "app/Components/Bidding/Context/TimeOffsetProvider"
import { SelectMaxBidQueryRenderer } from "app/Components/Bidding/Screens/SelectMaxBid"
import NavigatorIOS from "app/utils/__legacy_do_not_use__navigator-ios-shim"
import { Platform, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export const BidFlow: React.FC<
  Omit<React.ComponentProps<typeof SelectMaxBidQueryRenderer>, "navigator">
> = (props) => {
  const insets = useSafeAreaInsets()

  return (
    <View style={{ flex: 1, paddingTop: Platform.OS === "android" ? insets.top : 0 }}>
      <TimeOffsetProvider>
        <NavigatorIOS initialRoute={{ component: SelectMaxBidQueryRenderer, passProps: props }} />
      </TimeOffsetProvider>
    </View>
  )
}
