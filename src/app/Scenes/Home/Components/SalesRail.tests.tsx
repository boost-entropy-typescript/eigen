import { SalesRail_salesModule$data } from "__generated__/SalesRail_salesModule.graphql"
import { CardRailCard } from "app/Components/Home/CardRailCard"
import ImageView from "app/Components/OpaqueImageView/OpaqueImageView"
import { SectionTitle } from "app/Components/SectionTitle"
import HomeAnalytics from "app/Scenes/Home/homeAnalytics"
import { __globalStoreTestUtils__ } from "app/store/GlobalStore"
import { navigate } from "app/system/navigation/navigate"
import { CleanRelayFragment } from "app/utils/relayHelpers"
import { mockTrackEvent } from "app/utils/tests/globallyMockedStuff"
import { renderWithWrappers, renderWithWrappersLEGACY } from "app/utils/tests/renderWithWrappers"
import { cloneDeep, first, last } from "lodash"
import "react-native"
import { SalesRailFragmentContainer } from "./SalesRail"

const mockScrollRef = jest.fn()

const artwork = {
  image: { url: "https://example.com/image.jpg" },
}
const artworkNode = {
  node: {
    artwork,
  },
}
const salesModule: CleanRelayFragment<SalesRail_salesModule$data> = {
  results: [
    {
      id: "the-sale",
      internalID: "the-sale-internal-id",
      slug: "the-sales-slug",
      name: "The Sale",
      href: "/auction/the-sale",
      liveURLIfOpen: null,
      formattedStartDateTime: "Live May 19 at 11:00pm CEST",
      saleArtworksConnection: {
        edges: [artworkNode, artworkNode, artworkNode],
      },
      artworksConnection: {
        edges: [
          {
            node: artwork,
          },
          {
            node: artwork,
          },
          {
            node: artwork,
          },
        ],
      },
    },
    {
      id: "the-lai-sale",
      internalID: "the-sale-internal-id",
      slug: "the-sales-slug",
      name: "The LAI Sale",
      href: "/auction/the-lai-sale",
      liveURLIfOpen: "https://live.artsy.net/the-lai-sale",
      formattedStartDateTime: "Live May 19 at 3:00pm CEST",
      saleArtworksConnection: {
        edges: [artworkNode, artworkNode, artworkNode],
      },
      artworksConnection: {
        edges: [
          {
            node: artwork,
          },
          {
            node: artwork,
          },
          {
            node: artwork,
          },
        ],
      },
    },
  ],
}

it("doesn't throw when rendered", () => {
  expect(() =>
    renderWithWrappersLEGACY(
      <SalesRailFragmentContainer
        title="Auctions"
        salesModule={salesModule as any}
        scrollRef={mockScrollRef}
      />
    )
  ).not.toThrow()
})

describe("looks correct when rendered with sales missing artworks", () => {
  it("when AREnableArtworksConnectionForAuction is disabled", () => {
    __globalStoreTestUtils__?.injectFeatureFlags({ AREnableArtworksConnectionForAuction: false })
    const salesCopy = cloneDeep(salesModule)
    salesCopy.results.forEach((result) => {
      // @ts-ignore
      result.saleArtworksConnection.edges = []
    })
    expect(() =>
      renderWithWrappersLEGACY(
        <SalesRailFragmentContainer
          title="Auctions"
          salesModule={salesCopy as any}
          scrollRef={mockScrollRef}
        />
      )
    ).not.toThrow()
  })

  it("when AREnableArtworksConnectionForAuction is enabled", () => {
    __globalStoreTestUtils__?.injectFeatureFlags({ AREnableArtworksConnectionForAuction: true })
    const salesCopy = cloneDeep(salesModule)
    salesCopy.results.forEach((result) => {
      // @ts-ignore
      result.artworksConnection.edges = []
    })
    expect(() =>
      renderWithWrappersLEGACY(
        <SalesRailFragmentContainer
          title="Auctions"
          salesModule={salesCopy as any}
          scrollRef={mockScrollRef}
        />
      )
    ).not.toThrow()
  })
})

describe("image handling when AREnableArtworksConnectionForAuction is disabled", () => {
  const render = (edges: any[]) => {
    const { results } = cloneDeep(salesModule)
    const sale = results[0]
    // @ts-ignore
    sale!.saleArtworksConnection!.edges = edges
    return renderWithWrappersLEGACY(
      <SalesRailFragmentContainer
        title="Auctions"
        salesModule={{ results: [sale] } as any}
        scrollRef={mockScrollRef}
      />
    )
  }

  beforeEach(() => {
    __globalStoreTestUtils__?.injectFeatureFlags({ AREnableArtworksConnectionForAuction: false })
  })

  it("renders all 3 images", () => {
    const tree = render([
      { node: { artwork: { image: { url: "https://example.com/image-1.jpg" } } } },
      { node: { artwork: { image: { url: "https://example.com/image-2.jpg" } } } },
      { node: { artwork: { image: { url: "https://example.com/image-3.jpg" } } } },
    ])
    expect(tree.root.findAllByType(ImageView).map(({ props }) => props.imageURL)).toEqual([
      "https://example.com/image-1.jpg",
      "https://example.com/image-2.jpg",
      "https://example.com/image-3.jpg",
    ])
  })

  it("renders the 2nd image as a fallback if the 3rd is missing", () => {
    const tree = render([
      { node: { artwork: { image: { url: "https://example.com/image-1.jpg" } } } },
      { node: { artwork: { image: { url: "https://example.com/image-2.jpg" } } } },
    ])
    expect(tree.root.findAllByType(ImageView).map(({ props }) => props.imageURL)).toEqual([
      "https://example.com/image-1.jpg",
      "https://example.com/image-2.jpg",
      "https://example.com/image-2.jpg",
    ])
  })

  it("renders the 1st as a fallback if the 2nd and 3rd are missing", () => {
    const tree = render([
      { node: { artwork: { image: { url: "https://example.com/image-1.jpg" } } } },
    ])
    expect(tree.root.findAllByType(ImageView).map(({ props }) => props.imageURL)).toEqual([
      "https://example.com/image-1.jpg",
      "https://example.com/image-1.jpg",
      "https://example.com/image-1.jpg",
    ])
  })
})

describe("image handling when AREnableArtworksConnectionForAuction is enabled", () => {
  const render = (edges: any[]) => {
    const { results } = cloneDeep(salesModule)
    const sale = results[0]
    // @ts-ignore
    sale!.artworksConnection!.edges = edges
    return renderWithWrappersLEGACY(
      <SalesRailFragmentContainer
        title="Auctions"
        salesModule={{ results: [sale] } as any}
        scrollRef={mockScrollRef}
      />
    )
  }

  beforeEach(() => {
    __globalStoreTestUtils__?.injectFeatureFlags({ AREnableArtworksConnectionForAuction: true })
  })

  it("renders all 3 images", () => {
    const tree = render([
      { node: { image: { url: "https://example.com/image-1.jpg" } } },
      { node: { image: { url: "https://example.com/image-2.jpg" } } },
      { node: { image: { url: "https://example.com/image-3.jpg" } } },
    ])
    expect(tree.root.findAllByType(ImageView).map(({ props }) => props.imageURL)).toEqual([
      "https://example.com/image-1.jpg",
      "https://example.com/image-2.jpg",
      "https://example.com/image-3.jpg",
    ])
  })

  it("renders the 2nd image as a fallback if the 3rd is missing", () => {
    const tree = render([
      { node: { image: { url: "https://example.com/image-1.jpg" } } },
      { node: { image: { url: "https://example.com/image-2.jpg" } } },
    ])
    expect(tree.root.findAllByType(ImageView).map(({ props }) => props.imageURL)).toEqual([
      "https://example.com/image-1.jpg",
      "https://example.com/image-2.jpg",
      "https://example.com/image-2.jpg",
    ])
  })

  it("renders the 1st as a fallback if the 2nd and 3rd are missing", () => {
    const tree = render([{ node: { image: { url: "https://example.com/image-1.jpg" } } }])
    expect(tree.root.findAllByType(ImageView).map(({ props }) => props.imageURL)).toEqual([
      "https://example.com/image-1.jpg",
      "https://example.com/image-1.jpg",
      "https://example.com/image-1.jpg",
    ])
  })
})

describe("SalesRail Subtitle", () => {
  it("renders formattedStartDateTime as the subtitle", () => {
    const wrapper = renderWithWrappers(
      <SalesRailFragmentContainer
        title="Auctions"
        salesModule={salesModule as any}
        scrollRef={mockScrollRef}
      />
    )

    expect(wrapper.getByText(salesModule.results[0]?.formattedStartDateTime!)).toBeDefined()
    expect(wrapper.queryByText("Timed Auction • In 1 day")).toBeNull()
    expect(wrapper.queryByText("Live Auction • Live in 1 day")).toBeNull()
  })
})

it("routes to live URL if present, otherwise href", () => {
  const tree = renderWithWrappersLEGACY(
    <SalesRailFragmentContainer
      title="Auctions"
      salesModule={salesModule as any}
      scrollRef={mockScrollRef}
    />
  )
  // Timed sale
  first(tree.root.findAllByType(CardRailCard))!.props.onPress()
  expect(navigate).toHaveBeenCalledWith("/auction/the-sale")
  // LAI sale
  last(tree.root.findAllByType(CardRailCard))!.props.onPress()
  expect(navigate).toHaveBeenCalledWith("https://live.artsy.net/the-lai-sale")
})

describe("analytics", () => {
  it("tracks auction header taps", () => {
    const tree = renderWithWrappersLEGACY(
      <SalesRailFragmentContainer
        title="Auctions"
        salesModule={salesModule as any}
        scrollRef={mockScrollRef}
      />
    )
    tree.root.findByType(SectionTitle as any).props.onPress()
    expect(mockTrackEvent).toHaveBeenCalledWith(HomeAnalytics.auctionHeaderTapEvent())
  })

  it("tracks auction thumbnail taps", () => {
    const tree = renderWithWrappersLEGACY(
      <SalesRailFragmentContainer
        title="Auctions"
        salesModule={salesModule as any}
        scrollRef={mockScrollRef}
      />
    )
    const cards = tree.root.findAllByType(CardRailCard)
    cards[0].props.onPress()
    expect(mockTrackEvent).toHaveBeenCalledWith(
      HomeAnalytics.auctionThumbnailTapEvent("the-sale-internal-id", "the-sales-slug", 0)
    )
  })
})
