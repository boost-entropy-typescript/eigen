import { ArrowRightIcon, Flex, Text } from "@artsy/palette-mobile"
import { navigate } from "app/system/navigation/navigate"
import { Schema, track } from "app/utils/track"
import React from "react"
import { TouchableWithoutFeedback } from "react-native"

interface ContextGridCTAProps {
  href?: string
  contextModule?: string
  label: string
}

@track()
export class ContextGridCTA extends React.Component<ContextGridCTAProps> {
  @track((props) => ({
    action_name: Schema.ActionNames.ViewAll,
    action_type: Schema.ActionTypes.Tap,
    flow: Schema.Flow.RecommendedArtworks,
    context_module: props.contextModule,
  }))
  openLink() {
    const { href } = this.props
    // @ts-expect-error STRICTNESS_MIGRATION --- 🚨 Unsafe legacy code 🚨 Please delete this and fix any type errors if you have time 🙏
    navigate(href)
  }

  render() {
    const { href, label } = this.props

    if (href && label) {
      return (
        <TouchableWithoutFeedback
          onPress={() => this.openLink()}
          accessibilityLabel="Context Grid CTA"
        >
          <Flex flexDirection="row" alignContent="center">
            <Text variant="sm" textAlign="left" weight="medium">
              {label}
            </Text>
            <Flex alignSelf="center">
              <ArrowRightIcon fill="black30" ml={1} />
            </Flex>
          </Flex>
        </TouchableWithoutFeedback>
      )
    } else {
      return null
    }
  }
}
