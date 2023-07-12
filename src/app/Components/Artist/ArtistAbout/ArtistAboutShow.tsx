import { Flex, Image, Text, Touchable } from "@artsy/palette-mobile"
import { ArtistAboutShow_show$key } from "__generated__/ArtistAboutShow_show.graphql"
import { navigate } from "app/system/navigation/navigate"
import { hrefForPartialShow } from "app/utils/router"
import { graphql, useFragment } from "react-relay"

const DEFAULT_CELL_WIDTH = 335

interface ArtistAboutShowProps {
  show: ArtistAboutShow_show$key
}

export const ArtistAboutShow: React.FC<ArtistAboutShowProps> = ({ show }) => {
  const data = useFragment(showGraphql, show)

  if (!data) {
    return null
  }

  const handleOnPress = () => {
    navigate(
      hrefForPartialShow({
        href: data.href,
        is_fair_booth: data.isFairBooth,
        slug: data.slug,
      })
    )
  }

  return (
    <Touchable onPress={handleOnPress}>
      <Image
        testID="show-cover"
        src={data.coverImage?.url ?? ""}
        aspectRatio={1.3}
        width={DEFAULT_CELL_WIDTH}
      />

      <Flex width={DEFAULT_CELL_WIDTH}>
        <Text variant="lg-display" mt={1}>
          {data.name}
        </Text>
        <Text variant="sm-display">{data.partner?.name}</Text>
        {!!data.exhibitionPeriod && (
          <Text variant="sm-display" color="black60">
            {data.exhibitionPeriod}
          </Text>
        )}
      </Flex>
    </Touchable>
  )
}

const showGraphql = graphql`
  fragment ArtistAboutShow_show on Show {
    slug
    href
    name
    isFairBooth
    partner {
      ... on Partner {
        name
      }
      ... on ExternalPartner {
        name
      }
    }
    exhibitionPeriod(format: SHORT)
    coverImage {
      url(version: "large")
    }
  }
`
