import { Spacer, SpacingUnit, Flex, Join } from "@artsy/palette-mobile"

export const Stack: React.FC<
  { spacing?: SpacingUnit; horizontal?: boolean } & React.ComponentPropsWithoutRef<typeof Flex>
> = ({ children, spacing = 2, horizontal, ...others }) => {
  return (
    <Flex flexDirection={horizontal ? "row" : "column"} {...others}>
      <Join
        separator={
          <Spacer y={horizontal ? undefined : spacing} x={horizontal ? spacing : undefined} />
        }
      >
        {children}
      </Join>
    </Flex>
  )
}
