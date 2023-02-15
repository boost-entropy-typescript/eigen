import { useColor } from "@artsy/palette-mobile"
import { themeGet } from "@styled-system/theme-get"
import { Text } from "palette"
import React from "react"
import {
  Animated,
  Dimensions,
  LayoutRectangle,
  ScrollView,
  ScrollViewProps,
  TouchableNativeFeedbackProps,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import styled from "styled-components/native"

export interface Tab {
  id: string
  text: string
}

interface ScrollableTabBarProps {
  goToPage?: () => null
  activeTab?: number
  tabs?: Tab[]
  containerWidth?: number
  scrollValue?: Animated.AnimatedInterpolation
}
const Button = (props: TouchableNativeFeedbackProps) => (
  <TouchableWithoutFeedback {...props} style={{ flex: 1, height: 50 }} />
)

const Tabs = (props: ScrollViewProps) => {
  const color = useColor()
  return (
    <ScrollView
      {...props}
      style={{
        height: 50,
        borderColor: color("black10"),
        borderBottomWidth: 1,
      }}
    />
  )
}

const TabButton = styled(View)<{ active: boolean }>`
  align-items: center;
  justify-content: center;
  height: 50px;
  padding-left: 20px;
  padding-right: 20px;
  flex-grow: 1;
  ${(p) =>
    p.active &&
    `
    border-color: ${themeGet("colors.black100")};
    border-bottom-width: 2px;
  `};
`

interface ScrollableTabProps {
  tabLabel: string
}

export const ScrollableTab: React.FC<ScrollableTabProps> = ({ children }) => (
  <View style={{ flex: 1, overflow: "hidden" }}>{children}</View>
)

export interface ScrollableTabBarState {
  activeTab: number
}
export default class ScrollableTabBar extends React.Component<
  ScrollableTabBarProps,
  ScrollableTabBarState
> {
  // @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
  scrollView: ScrollView = null
  // Default to screen width under first render
  scrollViewWidth: number = Dimensions.get("window").width
  delayPressTimeout: any
  els: LayoutRectangle[] = []

  state = {
    activeTab: this.props.activeTab || 0,
  }

  UNSAFE_componentWillReceiveProps(newProps: ScrollableTabBarProps) {
    // @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
    this.centerOnTab(newProps.activeTab)
  }

  // @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
  renderTab = (name, page, isTabActive, onPressHandler) => {
    return (
      <Button
        key={name}
        accessible
        accessibilityLabel={name}
        accessibilityRole="button"
        onLayout={(e) => {
          const layout = e.nativeEvent.layout
          this.els[page] = layout
        }}
        onPress={() => {
          this.setState({
            activeTab: page,
          })

          clearTimeout(this.delayPressTimeout)
          this.delayPressTimeout = setTimeout(() => {
            onPressHandler(page)
          }, 500)
        }}
      >
        <TabButton active={isTabActive}>
          <Text variant="sm" color={isTabActive ? "black100" : "black30"}>
            {name}
          </Text>
        </TabButton>
      </Button>
    )
  }

  centerOnTab = (index: number) => {
    if (!this.els[index] || !this.scrollView) {
      return
    }

    const { width: screenWidth } = Dimensions.get("window")
    // If the scrollview doesn't need to scroll, don't try to scroll it!
    if (this.scrollViewWidth < screenWidth) {
      return
    }

    const { x, width } = this.els[index]
    const maxOffset = this.scrollViewWidth - screenWidth
    const xOffset = x + width / 2 - screenWidth / 2

    if (xOffset < 0) {
      this.scrollView.scrollTo({ x: 0, y: 0 })
    } else if (xOffset > maxOffset) {
      this.scrollView.scrollTo({ x: maxOffset, y: 0 })
    } else {
      this.scrollView.scrollTo({ x: xOffset, y: 0 })
    }
  }

  render() {
    return (
      <Tabs
        // @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
        ref={(r: any) => {
          if (r) {
            this.scrollView = r.root
          }
        }}
        alwaysBounceVertical={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: "row", justifyContent: "space-between" }}
        onContentSizeChange={(width) => (this.scrollViewWidth = width)}
        horizontal
      >
        {this.props.tabs?.map((name, page) => {
          const isTabActive = this.props.activeTab === page
          return this.renderTab(name, page, isTabActive, this.props.goToPage)
        })}
      </Tabs>
    )
  }
}
