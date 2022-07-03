import { fireEvent } from "@testing-library/react-native"
import { PartnerCard_artwork$data } from "__generated__/PartnerCard_artwork.graphql"
import { PartnerCardTestsQuery } from "__generated__/PartnerCardTestsQuery.graphql"
import { rejectMostRecentRelayOperation } from "app/tests/rejectMostRecentRelayOperation"
import { renderWithWrappersTL } from "app/tests/renderWithWrappers"
import { resolveMostRecentRelayOperation } from "app/tests/resolveMostRecentRelayOperation"
import { graphql, QueryRenderer } from "react-relay"
import { createMockEnvironment } from "relay-test-utils"
import { PartnerCardFragmentContainer } from "./PartnerCard"

jest.unmock("react-relay")

describe("PartnerCard", () => {
  let mockEnvironment: ReturnType<typeof createMockEnvironment>

  const TestWrapper = () => {
    return (
      <QueryRenderer<PartnerCardTestsQuery>
        environment={mockEnvironment}
        query={graphql`
          query PartnerCardTestsQuery @relay_test_operation @raw_response_type {
            artwork(id: "artworkID") {
              ...PartnerCard_artwork
            }
          }
        `}
        variables={{}}
        render={({ props }) => {
          if (props?.artwork) {
            return <PartnerCardFragmentContainer artwork={props.artwork} />
          }

          return null
        }}
      />
    )
  }

  beforeEach(() => {
    mockEnvironment = createMockEnvironment()
  })

  it("renders partner name correctly", () => {
    const { getByText } = renderWithWrappersTL(<TestWrapper />)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Artwork: () => PartnerCardArtwork,
    })

    expect(getByText("Test Gallery")).toBeTruthy()
  })

  it("renders partner image", () => {
    const { getByLabelText } = renderWithWrappersTL(<TestWrapper />)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Artwork: () => PartnerCardArtwork,
    })

    expect(getByLabelText("Avatar")).toBeTruthy()
  })

  it("renders partner type", () => {
    const { getByText } = renderWithWrappersTL(<TestWrapper />)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Artwork: () => PartnerCardArtwork,
    })

    expect(getByText("At gallery")).toBeTruthy()
  })

  it("renders partner type correctly for institutional sellers", () => {
    const PartnerCardArtworkInstitutionalSeller = {
      ...PartnerCardArtwork,
      partner: {
        ...PartnerCardArtwork.partner!,
        type: "Institutional Seller",
      },
    }

    const { getByText } = renderWithWrappersTL(<TestWrapper />)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Artwork: () => PartnerCardArtworkInstitutionalSeller,
    })

    expect(getByText("At institution")).toBeTruthy()
  })

  it("doesn't render partner type for partners that aren't institutions or galleries", () => {
    const PartnerCardArtworkOtherType = {
      ...PartnerCardArtwork,
      partner: {
        ...PartnerCardArtwork.partner!,
        type: "Some Other Partner Type",
      },
    }
    const { queryByText } = renderWithWrappersTL(<TestWrapper />)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Artwork: () => PartnerCardArtworkOtherType,
    })

    expect(queryByText("At institution")).toBeFalsy()
    expect(queryByText("At gallery")).toBeFalsy()
  })

  it("renders partner initials when no image is present", () => {
    const PartnerCardArtworkWithoutImage = {
      ...PartnerCardArtwork,
      partner: {
        ...PartnerCardArtwork.partner!,
        profile: null,
      },
    }
    const { getByText, queryByLabelText } = renderWithWrappersTL(<TestWrapper />)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Artwork: () => PartnerCardArtworkWithoutImage,
    })

    expect(getByText("TG")).toBeTruthy()
    expect(queryByLabelText("Avatar")).toBeFalsy()
  })

  it("truncates partner locations correctly", () => {
    const { getByText } = renderWithWrappersTL(<TestWrapper />)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Artwork: () => PartnerCardArtwork,
    })

    expect(getByText("Miami, New York, +3 more")).toBeTruthy()
  })

  it("renders button text correctly", () => {
    const { getByText } = renderWithWrappersTL(<TestWrapper />)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Artwork: () => PartnerCardArtwork,
    })

    expect(getByText("Follow")).toBeTruthy()
  })

  it("does not render when the partner is an auction house", () => {
    const PartnerCardArtworkAuctionHouse: PartnerCard_artwork$data = {
      ...PartnerCardArtwork,
      partner: {
        ...PartnerCardArtwork.partner!,
        type: "Auction House",
      },
    }
    const { toJSON } = renderWithWrappersTL(<TestWrapper />)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Artwork: () => PartnerCardArtworkAuctionHouse,
    })

    expect(toJSON()).toBeNull()
  })

  it("does not render when the artwork is in a benefit or gallery auction", () => {
    const PartnerCardArtworkAuction = {
      ...PartnerCardArtwork,
      sale: {
        isBenefit: true,
        isGalleryAuction: true,
      },
    }
    const { toJSON } = renderWithWrappersTL(<TestWrapper />)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Artwork: () => PartnerCardArtworkAuction,
    })

    expect(toJSON()).toBeNull()
  })

  it("does not render follow button when the partner has no profile info", () => {
    const PartnerCardArtworkNoProfile = {
      ...PartnerCardArtwork,
      partner: {
        ...PartnerCardArtwork.partner!,
        profile: null,
      },
    }
    const { queryByText } = renderWithWrappersTL(<TestWrapper />)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Artwork: () => PartnerCardArtworkNoProfile,
    })

    expect(queryByText("Follow")).toBeFalsy()
    expect(queryByText("Following")).toBeFalsy()
  })

  describe("Following a partner", () => {
    it("correctly displays when the artist is already followed, and allows unfollowing", () => {
      const PartnerCardArtworkFollowed = {
        ...PartnerCardArtwork,
        partner: {
          ...PartnerCardArtwork.partner,
          profile: {
            ...PartnerCardArtwork.partner!.profile,
            is_followed: true,
          },
        },
      }

      const { getByText, queryByText } = renderWithWrappersTL(<TestWrapper />)

      resolveMostRecentRelayOperation(mockEnvironment, {
        Artwork: () => PartnerCardArtworkFollowed,
      })

      expect(getByText("Following")).toBeTruthy()
      expect(queryByText("Follow")).toBeFalsy()

      fireEvent.press(getByText("Following"))

      resolveMostRecentRelayOperation(mockEnvironment, {
        Profile: () => ({
          is_followed: false,
          id: PartnerCardArtwork.partner!.id,
          slug: PartnerCardArtwork.partner!.slug,
          internalID: PartnerCardArtwork.partner!.profile!.internalID,
        }),
      })

      expect(getByText("Follow")).toBeTruthy()
      expect(queryByText("Following")).toBeFalsy()
    })

    it("correctly displays when the work is not followed, and allows following", () => {
      const { getByText, queryByText } = renderWithWrappersTL(<TestWrapper />)

      resolveMostRecentRelayOperation(mockEnvironment, {
        Artwork: () => PartnerCardArtwork,
      })

      expect(getByText("Follow")).toBeTruthy()
      expect(queryByText("Following")).toBeFalsy()

      fireEvent.press(getByText("Follow"))

      resolveMostRecentRelayOperation(mockEnvironment, {
        Profile: () => ({
          is_followed: true,
          id: PartnerCardArtwork.partner!.id,
          slug: PartnerCardArtwork.partner!.slug,
          internalID: PartnerCardArtwork.partner!.profile!.internalID,
        }),
      })

      expect(getByText("Following")).toBeTruthy()
      expect(queryByText("Follow")).toBeFalsy()
    })

    it("handles errors in saving gracefully", () => {
      const { getByText, queryByText } = renderWithWrappersTL(<TestWrapper />)

      resolveMostRecentRelayOperation(mockEnvironment, {
        Artwork: () => PartnerCardArtwork,
      })

      fireEvent.press(getByText("Follow"))

      rejectMostRecentRelayOperation(mockEnvironment, new Error())

      expect(getByText("Follow")).toBeTruthy()
      expect(queryByText("Following")).toBeFalsy()
    })
  })
})

const PartnerCardArtwork: PartnerCard_artwork$data = {
  sale: {
    isBenefit: false,
    isGalleryAuction: false,
  },
  partner: {
    is_default_profile_public: true,
    type: "Gallery",
    name: "Test Gallery",
    slug: "12345",
    id: "12345",
    href: "",
    initials: "TG",
    profile: {
      id: "12345",
      internalID: "56789",
      is_followed: false,
      icon: {
        url: "https://d32dm0rphc51dk.cloudfront.net/YciR5levjrhp2JnFYlPxpw/square140.webp",
      },
    },
    cities: ["Miami", "New York", "Hong Kong", "London", "Boston"],
  },
  " $fragmentType": "PartnerCard_artwork",
}
