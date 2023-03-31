import { Flex, FlexProps } from "@artsy/palette-mobile"
import { themeGet } from "@styled-system/theme-get"
import styled from "styled-components/native"
import { border, BorderProps, space as styledSpace } from "styled-system"

export interface BorderBoxProps extends FlexProps, BorderProps {
  hover?: boolean
}

/**
 * A `View` or `div` (depending on the platform) that has a common border
 * and padding set by default
 */
export const BorderBox = styled(Flex)<BorderBoxProps>`
  border: 1px solid ${themeGet("colors.black10")};
  border-radius: 2px;
  padding: 20px;
  ${border}
  ${styledSpace}
`
