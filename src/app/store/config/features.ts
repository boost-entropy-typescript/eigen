import { useToast } from "app/Components/Toast/toastHook"
import { GlobalStore } from "app/store/GlobalStore"
import { echoLaunchJson } from "app/utils/jsonFiles"

interface FeatureDescriptorCommonTypes {
  /** Provide a short description for the Dev Menu. */
  readonly description?: string

  /** Whether or not to show the feature flag in the Dev Menu. Consider also providing a description. */
  readonly showInDevMenu?: boolean
}

export interface FeatureDescriptorReadyForRelease {
  /**
   * Set readyForRelease to `true` when the feature is ready to be exposed outside of dev mode.
   * If an echo flag key is specified, the echo flag's value will be used after this
   * is set to `true`.
   */
  readonly readyForRelease: true
  /**
   * Provide an echo feature flag key to allow this feature to be toggled globally via echo.
   * Make sure to add the flag to echo before setting this value. Then run `./scripts/setup/update-echo`.
   */
  readonly echoFlagKey: string
}

interface FeatureDescriptorNotReadyForRelease {
  /**
   * Set readyForRelease to `false` when the feature is still in progress.
   */
  readonly readyForRelease: false

  readonly echoFlagKey?: string
}

export type FeatureDescriptor = (
  | FeatureDescriptorReadyForRelease
  | FeatureDescriptorNotReadyForRelease
) &
  FeatureDescriptorCommonTypes

export type FeatureName = keyof typeof features

export const features = {
  ARDarkModeSupport: {
    readyForRelease: false,
    showInDevMenu: true,
    description: "Support dark mode",
  },
  AREnableArticleSlideShow: {
    readyForRelease: false,
    description: "Enable slideshow elements and route on Article screen",
    echoFlagKey: "AREnableArticleSlideShow",
    showInDevMenu: true,
  },
  // TODO: need to refresh it before releasing to avoid leaking the feature in not ready releases, marked as ready since 15 months ago
  AREnableArtworksConnectionForAuction: {
    readyForRelease: true,
    description: "Use artworksConnection for Auction screen",
    echoFlagKey: "AREnableArtworksConnectionForAuction",
  },
  AREnableCuratorsPickRail: {
    description: "Enable Curators Pick Rail",
    readyForRelease: true,
    echoFlagKey: "AREnableCuratorsPickRail",
  },
  ARImpressionsTrackingHomeRailViews: {
    description: "Enable tracking rail views on home screen",
    readyForRelease: true,
    echoFlagKey: "ARImpressionsTrackingHomeRailViews",
  },
  AREnableSWALandingPageMeetTheSpecialist: {
    description: "Enable MeetTheSpecialist on SWA Landing Page",
    readyForRelease: true,
    echoFlagKey: "AREnableSWALandingPageMeetTheSpecialist",
  },
  AREnableSWALandingPageTestimonials: {
    description: "Enable Testimonials on SWA Landing Page",
    readyForRelease: true,
    echoFlagKey: "AREnableSWALandingPageTestimonials",
  },
  AREnableSkeletonAnimation: {
    description: "Enable Skeleton Animation",
    readyForRelease: true,
    echoFlagKey: "AREnableSkeletonAnimation",
  },
  ARImpressionsTrackingHomeItemViews: {
    description: "Enable Tracking Items views on Home Screen",
    readyForRelease: true,
    echoFlagKey: "ARImpressionsTrackingHomeItemViews",
  },
  AREnableDoMoreOnArtsyRail: {
    description: "Enable Do More on Artsy Rail",
    readyForRelease: true,
    echoFlagKey: "AREnableDoMoreOnArtsyRail",
  },
  AREnableMeetYourNewAdvisorRail: {
    description: "Enable Meet your New Advisor Rail",
    readyForRelease: true,
    echoFlagKey: "AREnableMeetYourNewAdvisorRail",
  },
  AREnableArtworksLists: {
    readyForRelease: true,
    description: "Enable Artwork Lists",
    showInDevMenu: true,
    echoFlagKey: "AREnableArtworksLists",
  },
  AREnableNewAuctionsRailCard: {
    description: "Enable New Auctions Home Rail Card",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableNewAuctionsRailCard",
  },
  AREnableMyCollectionCollectedArtists: {
    description: "Enable Collected Artists in My Collection",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableMyCollectionCollectedArtists",
  },
  // TODO: need to refresh it, not released yet but marked as ready since 3 months
  AREnableLongPressOnArtworkCards: {
    description: "Enable Context Menu on artwork cards",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableLongPressOnArtworkCards",
  },
  AREnableShowsForYouLocation: {
    description: "Enable Shows For You Location",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableShowsForYouLocation",
  },
  AREnableGalleriesForYou: {
    description: "Enable Galleries For You",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableGalleriesForYou",
  },
  AREnableAdditionalSiftAndroidTracking: {
    description: "Send additional events to Sift on Android",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableAdditionalSiftAndroidTracking",
  },
  ARShowCollectedArtistOnboarding: {
    description: "Show Collected Artist Onboarding",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "ARShowCollectedArtistOnboarding",
  },
  AREnableAuctionHeaderAlertCTA: {
    description: "Enable Auction Header Alert CTA",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableAuctionHeaderAlertCTA",
  },
  ARShowCreateAlertInArtistArtworksListFooter: {
    description: "Show create alert in artist artworks list footer",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "ARShowCreateAlertInArtistArtworksListFooter",
  },
  AREnableLatestActivityRail: {
    description: "Enable Latest Activity Rail",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableLatestActivityRail",
  },
  ARShowArtistsAlertsSet: {
    description: "Show Artists Alerts Set in Artist Page",
    readyForRelease: false,
    showInDevMenu: true,
    echoFlagKey: "ARShowArtistsAlertsSet",
  },
  AREnableSingleActivityPanelScreen: {
    description: "Enable Single Activity Panel screen",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableSingleActivityPanelScreen",
  },
  AREnableAlertsFilters: {
    description: "Enable filters in alerts screen",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableAlertsFilters",
  },
  AREnableAlertsFiltersSizeFiltering: {
    description: "Enable size filtering in alerts filters screen",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableAlertsFiltersSizeFiltering",
  },
  AREnableAlertDetailsInput: {
    description: "Enable 'details' text input for alerts",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableAlertDetailsInput",
  },
  AREnableArtistSeriesFilter: {
    description: "Enable artist series filter on Artist screen",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableArtistSeriesFilter",
  },
  AREnableAlertsSuggestedFilters: {
    description: "Enable alerts suggested filters",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableAlertsSuggestedFilters",
  },
  AREnablePartnerOffersNotificationSwitch: {
    description: "Enable partner offers notification switch",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnablePartnerOffersNotificationSwitch",
  },
  AREnableNewWorksForYouScreenFeed: {
    description: "Enable new works for you screen feed",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableNewWorksForYouScreenFeed",
  },
  AREnablePartnerOffer: {
    description: "Enable partner offer content in the app",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnablePartnerOffer",
  },
  AREnableArtistSeriesSuggestions: {
    description: "Enable artist series suggestions",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableArtistSeriesSuggestions",
  },
  AREnableProgressiveOnboardingAlerts: {
    description: "Enable progressive onboarding alerts",
    readyForRelease: false,
    showInDevMenu: true,
    echoFlagKey: "AREnableProgressiveOnboardingAlerts",
  },
  AREnableAlertsFiltersArtistSeriesFiltering: {
    description: 'Enable artist series selection on "More Filters" screen',
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableAlertsFiltersArtistSeriesFiltering",
  },
  AREnableNewActivityPanelManagement: {
    description: "Enable new activity panel management",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableNewActivityPanelManagement",
  },
  AREnableArtworksFeedView: {
    description: "Enable artworks feed view",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "AREnableArtworksFeedView",
  },
  AREnableArtworkListOfferability: {
    description: "Enable Parnter Offer v1.5, edit sharing artwork list with partners for offers",
    readyForRelease: false,
    showInDevMenu: true,
    echoFlagKey: "AREnableArtworkListOfferability",
  },
  ARUsePaletteImage: {
    description: "Use Palette Image Component",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "ARUsePaletteImageComponent",
  },
  ARShowBlurhashImagePlaceholder: {
    description: "Show blurhash image placeholder (works only when using Palette Image Component)",
    readyForRelease: true,
    showInDevMenu: true,
    echoFlagKey: "ARShowBlurhashImagePlaceholder",
  },
} satisfies { [key: string]: FeatureDescriptor }

export interface DevToggleDescriptor {
  /**
   * Provide a short description for the Dev Menu.
   */
  readonly description: string
  /**
   * Provide some action/thunk to run when the toggle value is changed.
   */
  readonly onChange?: (value: boolean, { toast }: { toast: ReturnType<typeof useToast> }) => void
}

export type DevToggleName = keyof typeof devToggles

export const devToggles: { [key: string]: DevToggleDescriptor } = {
  DTShowPlayground: {
    description: "Show Playground",
  },
  DTShowQuickAccessInfo: {
    description: "Quick Access Info",
  },
  DTDisableEchoRemoteFetch: {
    description: "Disable fetching remote echo",
    onChange: (value, { toast }) => {
      if (value) {
        GlobalStore.actions.artsyPrefs.echo.setEchoState(echoLaunchJson())
        toast.show("Loaded bundled echo config", "middle")
      } else {
        GlobalStore.actions.artsyPrefs.echo.fetchRemoteEcho()
        toast.show("Fetched remote echo config", "middle")
      }
    },
  },
  DTShowAnalyticsVisualiser: {
    description: "Analytics visualiser",
  },
  DTLocationDetectionVisialiser: {
    description: "Location detection visualiser",
  },
  DTShowNavigationVisualiser: {
    description: "Navigation visualiser",
  },
  DTEasyMyCollectionArtworkCreation: {
    description: "MyCollection artworks easy add",
  },
  DTMyCollectionDeleteAllArtworks: {
    description: "MyCollection delete all artworks",
  },
  DTShowWebviewIndicator: {
    description: "Webview indicator",
  },
  DTShowInstagramShot: {
    description: "Instagram viewshot debug",
  },
  DTCaptureExceptionsInSentryOnDev: {
    description: "Capture exceptions in Sentry on DEV",
  },
  DTFPSCounter: {
    description: "FPS counter",
  },
  DTUseProductionUnleash: {
    description: "Use Production Unleash",
  },
  DTShowErrorInLoadFailureView: {
    description: "Show error in load failure view",
  },
  DTEnableNewImageLabel: {
    description: "Show a label on new OpaqueImageView",
  },
  DTForceShowNewWorksForYouScreenFeed: {
    description: "Force show new works for you feed",
  },
}

export const isDevToggle = (name: FeatureName | DevToggleName): name is DevToggleName => {
  return Object.keys(devToggles).includes(name as string)
}
