import { OrderDetailsTestsQuery } from "__generated__/OrderDetailsTestsQuery.graphql"
import { extractText } from "app/utils/tests/extractText"
import { renderWithWrappersLEGACY } from "app/utils/tests/renderWithWrappers"
import { resolveMostRecentRelayOperation } from "app/utils/tests/resolveMostRecentRelayOperation"
import { SectionList } from "react-native"
import { graphql, QueryRenderer } from "react-relay"
import { act } from "react-test-renderer"
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils"
import { ArtworkInfoSectionFragmentContainer } from "./Components/ArtworkInfoSection"
import {
  OrderDetailsContainer,
  OrderDetailsPlaceholder,
  OrderDetailsQueryRender,
  SectionListItem,
} from "./Components/OrderDetails"
import { OrderDetailsHeaderFragmentContainer } from "./Components/OrderDetailsHeader"
import { PaymentMethodSummaryItemFragmentContainer } from "./Components/OrderDetailsPayment"
import { ShipsToSectionFragmentContainer } from "./Components/ShipsToSection"
import { SoldBySectionFragmentContainer } from "./Components/SoldBySection"
import { SummarySectionFragmentContainer } from "./Components/SummarySection"
import { TrackOrderSectionFragmentContainer } from "./Components/TrackOrderSection"
import { WirePaymentSectionFragmentContainer } from "./Components/WirePaymentSection"

const order = {
  requestedFulfillment: { __typename: "CommerceShip", name: "my name" },
  lineItems: { edges: [{ node: { artwork: { partner: { name: "partnerName" } } } }] },
}

describe(OrderDetailsQueryRender, () => {
  let mockEnvironment: ReturnType<typeof createMockEnvironment>
  beforeEach(() => (mockEnvironment = createMockEnvironment()))

  const TestRenderer = () => (
    <QueryRenderer<OrderDetailsTestsQuery>
      environment={mockEnvironment}
      query={graphql`
        query OrderDetailsTestsQuery @relay_test_operation {
          commerceOrder(id: "order-id") {
            ...OrderDetails_order
          }
        }
      `}
      variables={{}}
      render={({ props }) => {
        if (props?.commerceOrder) {
          return <OrderDetailsContainer order={props.commerceOrder} />
        }
      }}
    />
  )

  const getWrapper = (mockResolvers = {}) => {
    const tree = renderWithWrappersLEGACY(<TestRenderer />)
    act(() => {
      mockEnvironment.mock.resolveMostRecentOperation((operation) =>
        MockPayloadGenerator.generate(operation, mockResolvers)
      )
    })
    return tree
  }

  it("renders without throwing an error", () => {
    const tree = renderWithWrappersLEGACY(<TestRenderer />).root
    resolveMostRecentRelayOperation(mockEnvironment, { CommerceOrder: () => order })
    expect(tree.findByType(SectionList)).toBeTruthy()
    expect(tree.findByType(OrderDetailsHeaderFragmentContainer)).toBeTruthy()
    expect(tree.findByType(ArtworkInfoSectionFragmentContainer)).toBeTruthy()
    expect(tree.findByType(SummarySectionFragmentContainer)).toBeTruthy()
    expect(tree.findByType(PaymentMethodSummaryItemFragmentContainer)).toBeTruthy()
    expect(tree.findByType(TrackOrderSectionFragmentContainer)).toBeTruthy()
    expect(tree.findByType(ShipsToSectionFragmentContainer)).toBeTruthy()
    expect(tree.findByType(SoldBySectionFragmentContainer)).toBeTruthy()
    expect(tree.findAllByType(WirePaymentSectionFragmentContainer)).toHaveLength(0)
  })

  it("not render ShipsToSection when CommercePickup", () => {
    const tree = renderWithWrappersLEGACY(<TestRenderer />).root
    order.requestedFulfillment.__typename = "CommercePickup"
    resolveMostRecentRelayOperation(mockEnvironment, { CommerceOrder: () => order })
    const sections: SectionListItem[] = tree.findByType(SectionList).props.sections
    expect(sections.filter(({ key }) => key === "ShipTo_Section")).toHaveLength(0)
  })

  it("not render TrackOrderSection when CommercePickup", () => {
    const tree = renderWithWrappersLEGACY(<TestRenderer />).root
    order.requestedFulfillment.__typename = "CommercePickup"
    resolveMostRecentRelayOperation(mockEnvironment, { CommerceOrder: () => order })
    const sections: SectionListItem[] = tree.findByType(SectionList).props.sections
    expect(sections.filter(({ key }) => key === "TrackOrder_Section")).toHaveLength(0)
  })

  it("not render SoldBySection when partnerName null", () => {
    const tree = renderWithWrappersLEGACY(<TestRenderer />).root
    resolveMostRecentRelayOperation(mockEnvironment, {
      CommerceOrder: () => ({
        ...order,
        lineItems: { edges: [{ node: { artwork: { partner: null } } }] },
      }),
    })
    const sections: SectionListItem[] = tree.findByType(SectionList).props.sections
    expect(sections.filter(({ key }) => key === "Sold_By")).toHaveLength(0)
  })

  it("renders without throwing an error", () => {
    getWrapper()
  })

  it("renders props for OrderDetails if feature flag is on", () => {
    const tree = getWrapper({
      CommerceOrder: () => ({
        internalID: "222",
        requestedFulfillment: { __typename: "CommerceShip", name: "my name" },
      }),
    })
    expect(extractText(tree.root)).toContain("my name")
  })

  it("doesn't render MyCollections app if feature flag is not on", () => {
    const tree = getWrapper()
    expect(extractText(tree.root)).not.toContain("my name")
  })

  it("Loads OrderHistoryQueryRender with OrderDetailsPlaceholder", () => {
    const tree = renderWithWrappersLEGACY(
      <OrderDetailsQueryRender orderID="21856921-fa90-4a36-a17e-dd52870952d2" />
    ).root
    expect(tree.findAllByType(OrderDetailsPlaceholder)).toHaveLength(1)
  })

  it("renders WirePaymentSection when payment method is wire transfer and order in processing approval state", () => {
    const tree = renderWithWrappersLEGACY(<TestRenderer />).root
    resolveMostRecentRelayOperation(mockEnvironment, {
      CommerceOrder: () => ({
        ...order,
        code: "111111111",
        paymentMethod: "WIRE_TRANSFER",
        state: "PROCESSING_APPROVAL",
      }),
    })

    expect(tree.findByType(WirePaymentSectionFragmentContainer)).toBeTruthy()
  })
})
