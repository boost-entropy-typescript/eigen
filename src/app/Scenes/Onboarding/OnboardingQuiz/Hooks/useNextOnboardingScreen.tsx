import {
  OPTION_A_CURATED_SELECTION_OF_ARTWORKS,
  OPTION_ARTISTS_ON_THE_RISE,
  OPTION_FOLLOW_ARTISTS_I_WANT_TO_COLLECT,
  OPTION_FOLLOW_GALLERIES_IM_INTERESTED_IN,
  OPTION_THE_ART_TASTE_QUIZ,
  OPTION_TOP_AUCTION_LOTS,
} from "../config"
import { useOnboardingContext } from "./useOnboardingContext"

const screenNames = {
  OnboardingArtistsOnTheRise: "OnboardingArtistsOnTheRise",
  OnboardingCuratedArtworks: "OnboardingCuratedArtworks",
  OnboardingTopAuctionLots: "OnboardingTopAuctionLots",
  OnboardingArtTasteQuiz: "OnboardingArtTasteQuiz",
  OnboardingFollowArtists: "OnboardingFollowArtists",
  OnboardingFollowGalleries: "OnboardingFollowGalleries",
}

export const useNextOnboardingScreen = () => {
  const { state } = useOnboardingContext()
  switch (state.questionThree) {
    case OPTION_TOP_AUCTION_LOTS:
      return screenNames.OnboardingTopAuctionLots

    case OPTION_A_CURATED_SELECTION_OF_ARTWORKS:
      return screenNames.OnboardingCuratedArtworks

    case OPTION_ARTISTS_ON_THE_RISE:
      return screenNames.OnboardingArtistsOnTheRise

    case OPTION_FOLLOW_ARTISTS_I_WANT_TO_COLLECT:
      return screenNames.OnboardingFollowArtists

    case OPTION_FOLLOW_GALLERIES_IM_INTERESTED_IN:
      return screenNames.OnboardingFollowGalleries

    case OPTION_THE_ART_TASTE_QUIZ:
      return screenNames.OnboardingArtTasteQuiz
  }
}

// Loading screens??
