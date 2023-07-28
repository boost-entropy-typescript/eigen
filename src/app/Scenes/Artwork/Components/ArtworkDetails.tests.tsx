import { fireEvent, screen } from "@testing-library/react-native"
import { ArtworkDetails_artwork_TestQuery } from "__generated__/ArtworkDetails_artwork_TestQuery.graphql"
import { navigate } from "app/system/navigation/navigate"
import { flushPromiseQueue } from "app/utils/tests/flushPromiseQueue"
import { renderWithHookWrappersTL } from "app/utils/tests/renderWithWrappers"
import { resolveMostRecentRelayOperation } from "app/utils/tests/resolveMostRecentRelayOperation"
import { graphql, useLazyLoadQuery } from "react-relay"
import { createMockEnvironment } from "relay-test-utils"
import { ArtworkDetails } from "./ArtworkDetails"

describe("ArtworkDetails", () => {
  let mockEnvironment: ReturnType<typeof createMockEnvironment>

  beforeEach(() => {
    mockEnvironment = createMockEnvironment()
  })
  const TestRenderer = () => {
    const data = useLazyLoadQuery<ArtworkDetails_artwork_TestQuery>(
      graphql`
        query ArtworkDetails_artwork_TestQuery @relay_test_operation {
          artwork(id: "four-pence-coins-david-lynch") {
            ...ArtworkDetails_artwork
          }
        }
      `,
      {}
    )

    return <ArtworkDetails artwork={data.artwork!} />
  }

  it("renders all data correctly", async () => {
    renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

    resolveMostRecentRelayOperation(mockEnvironment, {})
    await flushPromiseQueue()

    expect(screen.queryByText("Medium")).toBeTruthy()
    expect(screen.queryByText("Materials")).toBeTruthy()
    expect(screen.queryByText("Size")).toBeTruthy()
    expect(screen.queryByText("Rarity")).toBeTruthy()
    expect(screen.queryByText("Edition")).toBeTruthy()
    expect(screen.queryByText("Certificate of Authenticity")).toBeTruthy()
    expect(screen.queryByText("Condition")).toBeTruthy()
    expect(screen.queryByText("Frame")).toBeTruthy()
    expect(screen.queryByText("Signature")).toBeTruthy()
    expect(screen.queryByText("Series")).toBeTruthy()
    expect(screen.queryByText("Publisher")).toBeTruthy()
    expect(screen.queryByText("Manufacturer")).toBeTruthy()
    expect(screen.queryByText("Image rights")).toBeTruthy()
  })

  it("doesn't render fields that are null or empty string", async () => {
    renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Artwork: () => ({
        framed: {
          details: "",
        },
        publisher: null,
        manufacturer: null,
      }),
    })
    await flushPromiseQueue()

    expect(screen.queryByText("Medium")).toBeTruthy()
    expect(screen.queryByText("Materials")).toBeTruthy()
    expect(screen.queryByText("Size")).toBeTruthy()
    expect(screen.queryByText("Rarity")).toBeTruthy()
    expect(screen.queryByText("Edition")).toBeTruthy()
    expect(screen.queryByText("Certificate of Authenticity")).toBeTruthy()
    expect(screen.queryByText("Condition")).toBeTruthy()

    expect(screen.queryByText("Signature")).toBeTruthy()
    expect(screen.queryByText("Series")).toBeTruthy()

    expect(screen.queryByText("Image rights")).toBeTruthy()

    expect(screen.queryByText("Frame")).toBeNull()
    expect(screen.queryByText("Publisher")).toBeNull()
    expect(screen.queryByText("Manufacturer")).toBeNull()
  })

  describe("Edition", () => {
    it("should be rendered edition sets 0/1", async () => {
      renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

      resolveMostRecentRelayOperation(mockEnvironment, {
        Artwork: () => ({
          editionOf: "Edition Set",
          editionSets: [
            {
              internalID: "edition-set",
              editionOf: "Edition Set",
              saleMessage: "$1000",
            },
          ],
        }),
      })
      await flushPromiseQueue()

      expect(screen.queryByText("Edition Set")).toBeTruthy()
    })

    it("should NOT be rendered edition sets 2 or more", async () => {
      renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

      resolveMostRecentRelayOperation(mockEnvironment, {
        Artwork: () => ({
          editionOf: null,
          editionSets: [
            {
              internalID: "edition-set-one",
              editionOf: "Edition Set One",
              saleMessage: "$1000",
            },
            {
              internalID: "edition-set-two",
              editionOf: "Edition Set Two",
              saleMessage: "$2000",
            },
          ],
        }),
      })
      await flushPromiseQueue()

      expect(screen.queryByText("Edition")).toBeNull()
      expect(screen.queryByText("Edition Set One")).toBeNull()
      expect(screen.queryByText("Edition Set Two")).toBeNull()
    })
  })

  it("navigates to medium info when tapped", async () => {
    renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

    resolveMostRecentRelayOperation(mockEnvironment, {})
    await flushPromiseQueue()

    fireEvent.press(screen.getByText("name-1"))

    expect(navigate).toHaveBeenCalledWith("/artwork/slug-1/medium")
  })

  it("navigates to artwork classifications when tapped", async () => {
    renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

    resolveMostRecentRelayOperation(mockEnvironment, {})
    await flushPromiseQueue()

    fireEvent.press(screen.getByText("attributionClass.name-1"))

    expect(navigate).toHaveBeenCalledWith("/artwork-classifications")
  })

  it("navigates to artwork certificate of authenticity when tapped", async () => {
    renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

    resolveMostRecentRelayOperation(mockEnvironment, {})
    await flushPromiseQueue()

    fireEvent.press(screen.getByText("details-1"))

    expect(navigate).toHaveBeenCalledWith("/artwork-certificate-of-authenticity")
  })

  it("should not render condition report button when canRequestLotConditionsReport false", async () => {
    renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Artwork: () => ({
        canRequestLotConditionsReport: false,
      }),
    })

    await flushPromiseQueue()

    expect(screen.queryByText("conditionDescription.details-1")).toBeTruthy()
  })
})
