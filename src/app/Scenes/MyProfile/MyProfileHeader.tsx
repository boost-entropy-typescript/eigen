import {
  Avatar,
  Box,
  BriefcaseIcon,
  Flex,
  InstitutionIcon,
  MapPinIcon,
  SettingsIcon,
  Spacer,
  Text,
  Touchable,
  useColor,
} from "@artsy/palette-mobile"
import { MyProfileHeaderQuery } from "__generated__/MyProfileHeaderQuery.graphql"
import { MyProfileHeader_me$key } from "__generated__/MyProfileHeader_me.graphql"
import { navigate } from "app/system/navigation/navigate"
import { useLocalImageStorage } from "app/utils/LocalImageStore"
import { withSuspense } from "app/utils/hooks/withSuspense"
import { PlaceholderBox, PlaceholderText } from "app/utils/placeholders"
import { useRefetch } from "app/utils/relayHelpers"
import { Image, TouchableOpacity } from "react-native"
import { useFragment, useLazyLoadQuery, graphql } from "react-relay"
import { normalizeMyProfileBio } from "./utils"

const ICON_SIZE = 14

export const MyProfileHeader: React.FC<{ me: MyProfileHeader_me$key }> = (props) => {
  const { fetchKey, refetch } = useRefetch()
  const me = useFragment(myProfileHeaderFragment, props.me)

  const color = useColor()

  const localImage = useLocalImageStorage("profile", undefined, undefined, fetchKey)

  const userProfileImagePath = localImage?.path || me?.icon?.url

  return (
    <Flex pt={2}>
      <Flex flexDirection="row" alignItems="center" px={2}>
        <Box height={45} width={45} borderRadius={25} backgroundColor={color("black10")}>
          <TouchableOpacity
            onPress={() => {
              navigate("/my-profile/edit", {
                passProps: {
                  onSuccess: () => {
                    refetch()
                  },
                },
              })
            }}
            testID="profile-image"
            style={{
              height: 45,
              width: 45,
              borderRadius: 25,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {!!userProfileImagePath ? (
              <Avatar src={userProfileImagePath} size="xs" />
            ) : (
              <Image source={require("images/profile_placeholder_avatar.webp")} />
            )}
          </TouchableOpacity>
        </Box>
        <Flex flex={1} px={1}>
          <Text fontSize={20} lineHeight="24px" color="black100">
            {me?.name}
          </Text>
          {!!me?.createdAt && (
            <Text variant="xs" color="black60">{`Member since ${new Date(
              me?.createdAt
            ).getFullYear()}`}</Text>
          )}
        </Flex>
        <Touchable
          haptic
          hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
          onPress={() =>
            navigate("/my-profile/settings", {
              passProps: {
                onSuccess: () => {
                  refetch()
                },
              },
            })
          }
          style={{ height: "100%" }}
        >
          <SettingsIcon height={24} width={24} fill="black100" />
        </Touchable>
      </Flex>

      {!!me?.bio && (
        <Text variant="xs" color={color("black100")} px={2} pt={1}>
          {normalizeMyProfileBio(me?.bio)}
        </Text>
      )}

      <Flex flexDirection="row" flexWrap="wrap" px={2} pt={1}>
        {!!me?.location?.display && (
          <Flex flexDirection="row" alignItems="center" pr={0.5} pb={0.5}>
            <MapPinIcon fill="black60" width={ICON_SIZE} height={ICON_SIZE} />
            <Text variant="xs" color={color("black60")} px={0.5}>
              {me.location.display}
            </Text>
          </Flex>
        )}

        {!!me?.profession && (
          <Flex flexDirection="row" alignItems="center" pr={0.5} pb={0.5}>
            <BriefcaseIcon fill="black60" width={ICON_SIZE} height={ICON_SIZE} />
            <Text variant="xs" color={color("black60")} px={0.5}>
              {me.profession}
            </Text>
          </Flex>
        )}

        {!!me?.otherRelevantPositions && (
          <Flex flexDirection="row" alignItems="center" pr={0.5} pb={0.5}>
            <InstitutionIcon fill="black60" width={ICON_SIZE} height={ICON_SIZE} />
            <Text variant="xs" color={color("black60")} px={0.5}>
              {me?.otherRelevantPositions}
            </Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}

const myProfileHeaderFragment = graphql`
  fragment MyProfileHeader_me on Me
  @refetchable(queryName: "MyProfileHeaderMyProfileHeaderFragmentRefetchQuery") {
    name
    bio
    location {
      display
    }
    otherRelevantPositions
    profession
    icon {
      url(version: "thumbnail")
    }
    createdAt
  }
`

const MyProfileHeaderPlaceholder: React.FC<{}> = () => {
  return (
    <Flex flex={1} px={2}>
      <Spacer y={2} />
      {/* icon, name, time joined */}
      <Flex flexDirection="row">
        <PlaceholderBox width={50} height={50} borderRadius={50} />
        <Flex flex={1} justifyContent="center" ml={2}>
          <PlaceholderText width={80} height={25} />
          <PlaceholderText width={100} height={15} />
        </Flex>
        {/* settings icon */}
        <PlaceholderBox width={20} height={20} />
      </Flex>
      <Spacer y={1} />
    </Flex>
  )
}

const myProfileHeaderQuery = graphql`
  query MyProfileHeaderQuery {
    me {
      ...MyProfileHeader_me
    }
  }
`

export const MyProfileHeaderQueryRenderer = withSuspense(() => {
  const data = useLazyLoadQuery<MyProfileHeaderQuery>(myProfileHeaderQuery, {})

  return <MyProfileHeader me={data.me!} />
}, MyProfileHeaderPlaceholder)
