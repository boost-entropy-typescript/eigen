import { fireEvent, screen, waitFor } from "@testing-library/react-native"
import { ContactGalleryButtonTestsQuery } from "__generated__/ContactGalleryButtonTestsQuery.graphql"
import { ContactGalleryButton } from "app/Scenes/Artwork/Components/CommercialButtons/ContactGalleryButton"
import { __globalStoreTestUtils__ } from "app/store/GlobalStore"
import { mockTrackEvent } from "app/utils/tests/globallyMockedStuff"
import { setupTestWrapper } from "app/utils/tests/setupTestWrapper"
import { graphql } from "react-relay"

describe("ContactGalleryButton", () => {
  it("opens the inquiry modal when the 'contact gallery' button is pressed", async () => {
    renderWithRelay()

    fireEvent.press(screen.getByText("Contact Gallery"))

    await waitFor(() => {
      expect(screen.getByText("What information are you looking for?")).toBeVisible()
    })
  })

  it("tracks an event when the 'contact gallery' button is pressed", async () => {
    renderWithRelay({
      Artwork: () => ({
        internalID: "artwork-id",
        slug: "artwork-slug",
        collectorSignals: null,
      }),
    })

    fireEvent.press(screen.getByText("Contact Gallery"))

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith({
        action: "tappedContactGallery",
        context_owner_id: "artwork-id",
        context_owner_slug: "artwork-slug",
        context_owner_type: "artwork",
      })
    })
  })

  it("tracks an event when the 'contact gallery' button is pressed on an artwork with a partner offer", async () => {
    renderWithRelay({
      Artwork: () => ({
        internalID: "artwork-id",
        slug: "artwork-slug",
        collectorSignals: { partnerOffer: { isAvailable: true } },
      }),
    })

    fireEvent.press(screen.getByText("Contact Gallery"))

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith({
        action: "tappedContactGallery",
        context_owner_id: "artwork-id",
        context_owner_slug: "artwork-slug",
        context_owner_type: "artwork",
        signal_label: "Limited-Time Offer",
      })
    })
  })

  it("tracks an event when the 'contact gallery' button is pressed on an artwork with auction signals", async () => {
    __globalStoreTestUtils__?.injectFeatureFlags({ AREnableAuctionImprovementsSignals: true })

    renderWithRelay({
      Artwork: () => ({
        internalID: "artwork-id",
        slug: "artwork-slug",
        collectorSignals: {
          auction: { bidCount: 7, lotWatcherCount: 49, liveBiddingStarted: true },
        },
      }),
    })

    fireEvent.press(screen.getByText("Contact Gallery"))

    await waitFor(() => {
      expect(mockTrackEvent).toHaveBeenCalledWith({
        action: "tappedContactGallery",
        context_owner_id: "artwork-id",
        context_owner_slug: "artwork-slug",
        context_owner_type: "artwork",
        signal_label: "Bidding live now",
        signal_bid_count: 7,
        signal_lot_watcher_count: 49,
      })
    })
  })
})

const { renderWithRelay } = setupTestWrapper<ContactGalleryButtonTestsQuery>({
  Component: ({ artwork, me }) => <ContactGalleryButton artwork={artwork} me={me} />,
  query: graphql`
    query ContactGalleryButtonTestsQuery @relay_test_operation {
      artwork(id: "artwork-id") @required(action: NONE) {
        ...ContactGalleryButton_artwork
      }
      me @required(action: NONE) {
        ...useSendInquiry_me
        ...MyProfileEditModal_me
      }
    }
  `,
})
