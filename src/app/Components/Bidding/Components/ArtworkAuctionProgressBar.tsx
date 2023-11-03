import { ProgressBar } from "@artsy/palette-mobile"
import { getTimer } from "app/utils/getTimer"

export interface ArtworkAuctionProgressBarProps {
  startAt?: string | null
  extendedBiddingPeriodMinutes: number
  extendedBiddingIntervalMinutes: number
  biddingEndAt?: string | null
  hasBeenExtended: boolean
  height?: number
}

export const ArtworkAuctionProgressBar: React.FC<ArtworkAuctionProgressBarProps> = ({
  startAt,
  extendedBiddingPeriodMinutes,
  extendedBiddingIntervalMinutes,
  biddingEndAt,
  hasBeenExtended,
  height,
}) => {
  if (!biddingEndAt) {
    return null
  }

  const { time } = getTimer(biddingEndAt, startAt ?? "")

  const { days, hours, minutes, seconds } = time

  const parsedDaysUntilEnd = parseInt(days, 10)
  const parsedHoursUntilEnd = parseInt(hours, 10)
  const parsedMinutesUntilEnd = parseInt(minutes, 10)
  const parsedSecondsUntilEnd = parseInt(seconds, 10)

  const isWithinExtendedBiddingPeriod =
    parsedDaysUntilEnd < 1 &&
    parsedHoursUntilEnd < 1 &&
    parsedMinutesUntilEnd < extendedBiddingPeriodMinutes

  const extendedBiddingDuration = hasBeenExtended
    ? extendedBiddingIntervalMinutes
    : extendedBiddingPeriodMinutes

  const percentComplete =
    (parsedSecondsUntilEnd + parsedMinutesUntilEnd * 60) / (extendedBiddingDuration * 60)

  if (!(isWithinExtendedBiddingPeriod || hasBeenExtended)) {
    return null
  }

  return <ProgressBar height={height} trackColor="red100" progress={percentComplete * 100} />
}
