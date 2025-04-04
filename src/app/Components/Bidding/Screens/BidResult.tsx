import { Button, Flex, Text } from "@artsy/palette-mobile"
import { StackActions } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Timer } from "app/Components/Bidding/Components/Timer"
import { BidFlowContextStore } from "app/Components/Bidding/Context/BidFlowContextProvider"
import { Markdown } from "app/Components/Markdown"
import { NavigationHeader } from "app/Components/NavigationHeader"
import { BiddingNavigationStackParams } from "app/Navigation/AuthenticatedRoutes/BiddingNavigator"
import { unsafe__getEnvironment } from "app/store/GlobalStore"
import { dismissModal, navigate } from "app/system/navigation/navigate"
import { useBackHandler } from "app/utils/hooks/useBackHandler"
import React from "react"
import { Image, ImageRequireSource } from "react-native"
import { graphql, useFragment } from "react-relay"

const SHOW_TIMER_STATUSES = ["WINNING", "OUTBID", "RESERVE_NOT_MET"]

type BidResultProps = NativeStackScreenProps<BiddingNavigationStackParams, "BidResult">

const POLLING_TIMEOUT_MESSAGES = {
  title: "Bid processing",
  description:
    "We’re receiving a high volume of traffic\n" +
    "and your bid is still processing.\n\n" +
    "If you don’t receive an update soon,\n" +
    "please contact [support@artsy.net](mailto:support@artsy.net).",
}

const ICONS: Record<string, ImageRequireSource> = {
  WINNING: require("images/circle-check-green.webp"),
  PENDING: require("images/circle-exclamation.webp"),
}

export const BidResult: React.FC<BidResultProps> = ({
  navigation,
  route: {
    params: { bidderPositionResult, saleArtwork, refreshBidderInfo, refreshSaleArtwork },
  },
}) => {
  const biddingEndAt = BidFlowContextStore.useStoreState((state) => state.biddingEndAt)
  const setSelectedBidIndex = BidFlowContextStore.useStoreActions(
    (actions) => actions.setSelectedBidIndex
  )
  const saleArtworkData = useFragment(bidResultFragment, saleArtwork)
  const { status, messageHeader, messageDescriptionMD } = bidderPositionResult

  const shouldDisplayTimer = SHOW_TIMER_STATUSES.includes(status)
  const canBidAgain = status === "OUTBID" || status === "RESERVE_NOT_MET"

  const backHandler = () => {
    if (canBidAgain) {
      return false
    }
    dismissModal()
    return true
  }

  useBackHandler(backHandler)

  const onBidAgain = () => {
    if (refreshBidderInfo) {
      refreshBidderInfo()
    }

    if (refreshSaleArtwork) {
      refreshSaleArtwork()
    }

    setSelectedBidIndex(0)
    navigation.dispatch(StackActions.popToTop())
  }

  const onContinue = () => {
    if (status === "LIVE_BIDDING_STARTED") {
      const saleSlug = saleArtworkData.sale?.slug
      const url = `${unsafe__getEnvironment().predictionURL}/${saleSlug}`
      navigate(url, { modal: true })
    } else {
      dismissModal()
    }
  }

  return (
    <Flex flex={1}>
      <NavigationHeader useXButton onLeftButtonPress={() => dismissModal()} />

      <Flex flex={1} mx={2} mt={6} justifyContent="space-between">
        <Flex alignItems="center">
          <Image
            height={20}
            width={20}
            source={ICONS[status] || require("images/circle-x-red.webp")}
          />

          <Text variant="sm-display" weight="medium" mt={2} mb={6} textAlign="center">
            {status === "PENDING"
              ? POLLING_TIMEOUT_MESSAGES.title
              : messageHeader || "You’re the highest bidder"}
          </Text>

          {status !== "WINNING" && (
            <Markdown mb={6}>
              {status === "PENDING"
                ? POLLING_TIMEOUT_MESSAGES.description
                : messageDescriptionMD ?? ""}
            </Markdown>
          )}

          {!!shouldDisplayTimer && (
            <Timer
              liveStartsAt={saleArtworkData.sale?.liveStartAt ?? undefined}
              lotEndAt={saleArtworkData.endAt}
              biddingEndAt={biddingEndAt}
            />
          )}
        </Flex>

        {!!canBidAgain ? (
          <Button block width={100} onPress={onBidAgain}>
            Bid again
          </Button>
        ) : (
          <Button variant="outline" block width={100} onPress={onContinue}>
            Continue
          </Button>
        )}
      </Flex>
    </Flex>
  )
}

const bidResultFragment = graphql`
  fragment BidResult_saleArtwork on SaleArtwork {
    endAt
    sale {
      liveStartAt
      endAt
      slug
      cascadingEndTimeIntervalMinutes
    }
  }
`
