import { fireEvent } from "@testing-library/react-native"
import { navigate } from "app/navigation/navigate"
import { Tab } from "app/Scenes/MyProfile/MyProfileHeaderMyCollectionAndSavedWorks"
import { renderWithWrappers } from "app/tests/renderWithWrappers"
import { ActivateMoreMarketInsightsBanner } from "./ActivateMoreMarketInsightsBanner"

describe("MyCollectionInsights banner", () => {
  const TestRenderer = () => {
    return <ActivateMoreMarketInsightsBanner />
  }

  it("renders", async () => {
    const { findByText } = renderWithWrappers(<TestRenderer />)

    expect(await findByText("Unlock More Insights")).toBeTruthy()
  })

  it("navigates to MyCollectionArtworkForm when Upload Another Artwork is pressed", () => {
    const { getByTestId } = renderWithWrappers(<TestRenderer />)

    fireEvent.press(getByTestId("activate-more-market-insights-banner"))
    expect(navigate).toHaveBeenCalledWith(
      "my-collection/artworks/new",
      expect.objectContaining({
        passProps: { mode: "add", onSuccess: expect.anything(), source: Tab.insights },
      })
    )
  })
})
