import { useColor } from "palette/hooks"
import { Icon, IconProps, Path } from "./Icon"

export const ImageIcon: React.FC<IconProps> = (props) => {
  const color = useColor()

  return (
    <Icon {...props} viewBox="0 0 18 18">
      <Path
        d="M16 2H2c-.265 0-.52.098-.707.272A.896.896 0 001 2.929V14.07c0 .247.105.483.293.657.187.174.442.272.707.272h14c.265 0 .52-.098.707-.272a.896.896 0 00.293-.657V2.93a.896.896 0 00-.293-.657A1.04 1.04 0 0016 2zM2 14.071V2.93h14V14.07H2z"
        fill={color(props.fill)}
      />
      <Path
        d="M4.46 6.643c.298 0 .588-.082.834-.235a1.42 1.42 0 00.553-.625 1.3 1.3 0 00.085-.805c-.058-.27-.2-.518-.41-.713a1.539 1.539 0 00-.768-.381 1.608 1.608 0 00-.867.08 1.482 1.482 0 00-.673.512 1.323 1.323 0 00-.253.774c0 .37.158.724.44.985a1.56 1.56 0 001.06.408zm0-2.136c.16 0 .315.042.447.123a.759.759 0 01.297.333.694.694 0 01.047.43.728.728 0 01-.218.38.82.82 0 01-.41.205.857.857 0 01-.462-.041.79.79 0 01-.36-.274.706.706 0 01-.135-.413.717.717 0 01.234-.52.832.832 0 01.56-.218v-.005zM11.39 7.279l-2.7 2.507-2-1.857a.52.52 0 00-.352-.135.52.52 0 00-.352.135L2.96 10.775v1.314l3.395-3.153L8 10.441l-1.875 1.74H7.5l4.225-3.923L15 11.286v-1.31L12.096 7.28a.52.52 0 00-.353-.135.52.52 0 00-.352.135z"
        fill={color(props.fill)}
      />
    </Icon>
  )
}
