import { flushPromiseQueue } from "app/utils/tests/flushPromiseQueue"
import { renderWithHookWrappersTL } from "app/utils/tests/renderWithWrappers"
import { RelayEnvironmentProvider } from "react-relay"
import { act } from "react-test-renderer"
import { createMockEnvironment } from "relay-test-utils"
import { CareerHighlightsBigCardsSwiper } from "./CareerHighlightsBigCardsSwiper"

describe("CareerHighlightsBigCardsSwiper", () => {
  let mockEnvironment: ReturnType<typeof createMockEnvironment>

  const TestRendererAllTypesAvailable = () => (
    <RelayEnvironmentProvider environment={mockEnvironment}>
      <CareerHighlightsBigCardsSwiper
        type="BIENNIAL"
        careerHighlightsAvailableTypes={[
          "BIENNIAL",
          "COLLECTED",
          "GROUP_SHOW",
          "SOLO_SHOW",
          "REVIEWED",
        ]}
      />
    </RelayEnvironmentProvider>
  )

  const TestRendererSomeTypesAvailable = () => (
    <RelayEnvironmentProvider environment={mockEnvironment}>
      <CareerHighlightsBigCardsSwiper
        type="BIENNIAL"
        careerHighlightsAvailableTypes={["BIENNIAL", "COLLECTED"]}
      />
    </RelayEnvironmentProvider>
  )

  beforeEach(() => {
    mockEnvironment = createMockEnvironment()
  })

  it("renders the swiper and all slides when the data for all types is available", async () => {
    const { getByTestId } = renderWithHookWrappersTL(
      <TestRendererAllTypesAvailable />,
      mockEnvironment
    )

    act(() => {
      mockEnvironment.mock.resolveMostRecentOperation({
        data: mockResultAllInsights,
      })
    })

    await flushPromiseQueue()

    expect(getByTestId("career-highlighs-big-cards-swiper")).toBeTruthy()

    expect(getByTestId("biennial-card")).toBeTruthy()
    expect(getByTestId("collected-card")).toBeTruthy()
    expect(getByTestId("group-show-card")).toBeTruthy()
    expect(getByTestId("solo-show-card")).toBeTruthy()
    expect(getByTestId("reviewed-card")).toBeTruthy()

    expect(getByTestId("promo-card")).toBeTruthy()
  })

  it("renders the swiper and the slides we have the data for when the data for some types is not available", async () => {
    const { getByTestId } = renderWithHookWrappersTL(
      <TestRendererSomeTypesAvailable />,
      mockEnvironment
    )

    act(() => {
      mockEnvironment.mock.resolveMostRecentOperation({
        data: mockResultSomeInsights,
      })
    })

    await flushPromiseQueue()

    expect(getByTestId("career-highlighs-big-cards-swiper")).toBeTruthy()

    expect(getByTestId("biennial-card")).toBeTruthy()
    expect(getByTestId("collected-card")).toBeTruthy()

    expect(() => getByTestId("group-show-card")).toThrow(
      "Unable to find an element with testID: group-show-card"
    )
    expect(() => getByTestId("solo-show-card")).toThrow(
      "Unable to find an element with testID: solo-show-card"
    )
    expect(() => getByTestId("reviewed-card")).toThrow(
      "Unable to find an element with testID: reviewed-card"
    )

    expect(getByTestId("promo-card")).toBeTruthy()
  })
})

const dataStructure = {
  artist: {
    id: "id",
    name: "name",
    initials: "initials",
    nationality: "nationality",
    birthday: "birthday",
    deathday: "deathday",
    image: { url: "url" },
  },
}

const mockResultAllInsights = {
  me: {
    myCollectionInfo: {
      biennialInsights: [dataStructure],
      collectedInsights: [dataStructure],
      groupShowInsights: [dataStructure],
      soloShowInsights: [dataStructure],
      reviewedInsights: [dataStructure],
    },
  },
}

const mockResultSomeInsights = {
  me: {
    myCollectionInfo: {
      biennialInsights: [dataStructure],
      collectedInsights: [dataStructure],
    },
  },
}
