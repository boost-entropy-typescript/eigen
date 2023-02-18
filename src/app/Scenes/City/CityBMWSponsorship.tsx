import { Flex, Text } from "@artsy/palette-mobile"
import { navigate } from "app/system/navigation/navigate"
import { Schema } from "app/utils/track"
import { TouchableOpacity } from "react-native"
import { useTracking } from "react-tracking"
import styled from "styled-components/native"

interface BMWSponsorshipProps {
  url?: string
  logoText?: string
  pressable?: boolean
}
export const BMWSponsorship: React.FC<BMWSponsorshipProps> = ({
  logoText = "In Partnership with BMW",
  url,
  pressable = true,
}) => {
  const tracking = useTracking()
  const view = (
    <Flex flexDirection="row" alignItems="center" mb={2}>
      <Logo
        resizeMode="contain"
        source={require("images/bmw-logo.png")}
        style={{ marginRight: 10 }}
      />
      <Text color="black60">{logoText}</Text>
    </Flex>
  )

  if (!pressable) {
    return view
  }

  return (
    <TouchableOpacity
      onPress={() => {
        navigate(url || "https://www.bmw-arts-design.com/bmw_art_guide")

        tracking.trackEvent({
          action_name: Schema.ActionNames.BMWLogo,
          action_type: Schema.ActionTypes.Tap,
        })
      }}
    >
      {view}
    </TouchableOpacity>
  )
}

export const Logo = styled.Image`
  height: 32px;
  width: 32px;
`
