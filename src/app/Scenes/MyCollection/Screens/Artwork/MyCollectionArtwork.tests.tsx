import { fireEvent } from "@testing-library/react-native"
import { getMockRelayEnvironment } from "app/system/relay/defaultEnvironment"
import { renderWithHookWrappersTL } from "app/utils/tests/renderWithWrappers"
import { resolveMostRecentRelayOperation } from "app/utils/tests/resolveMostRecentRelayOperation"
import { MyCollectionArtworkScreen } from "./MyCollectionArtwork"

const mockEnvironment = getMockRelayEnvironment()

describe("My Collection Artwork", () => {
  it("show new artwork screen ", () => {
    const { getByTestId } = renderWithHookWrappersTL(
      <MyCollectionArtworkScreen
        artworkId="random-id"
        artistInternalID="internal-id"
        medium="medium"
        category="medium"
      />,
      mockEnvironment
    )

    resolveMostRecentRelayOperation(mockEnvironment)
    expect(() => getByTestId("my-collection-artwork")).toBeTruthy()
    expect(() => getByTestId("old-my-collection-artwork")).toThrowError(
      "Unable to find an element with testID: old-my-collection-artwork"
    )
  })

  describe("edit button", () => {
    it("shows the edit button", async () => {
      const { findByText } = renderWithHookWrappersTL(
        <MyCollectionArtworkScreen
          artworkId="random-id"
          artistInternalID="internal-id"
          medium="medium"
          category="medium"
        />,
        mockEnvironment
      )

      const editButton = await findByText("Edit")

      expect(editButton).toBeTruthy()

      fireEvent.press(editButton)
    })
  })
})
