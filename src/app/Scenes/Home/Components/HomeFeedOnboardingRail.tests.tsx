import { fireEvent } from "@testing-library/react-native"
import { switchTab } from "app/navigation/navigate"
import { setupTestWrapperTL } from "app/tests/setupTestWrapper"
import { Theme } from "palette"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { graphql } from "react-relay"
import { useTracking } from "react-tracking"
import { HomeFeedOnboardingRailFragmentContainer } from "./HomeFeedOnboardingRail"

jest.unmock("react-relay")

describe("HomeFeedOnboardingRail", () => {
  const trackEvent = useTracking().trackEvent

  const { renderWithRelay } = setupTestWrapperTL({
    Component: (props) => {
      return (
        <Theme>
          <SafeAreaProvider>
            <HomeFeedOnboardingRailFragmentContainer
              onboardingModule={props.homePage.onboardingModule}
              title="Do More on Artsy"
            />
          </SafeAreaProvider>
        </Theme>
      )
    },
    query: graphql`
      query HomeFeedOnboardingRailTestsQuery {
        homePage {
          onboardingModule {
            ...HomeFeedOnboardingRail_onboardingModule
          }
        }
      }
    `,
  })

  it("renders two cards when both cards are visible", () => {
    const { getByText } = renderWithRelay({
      HomePage: () => ({
        onboardingModule: {
          showMyCollectionCard: true,
          showSWACard: true,
        },
      }),
    })

    expect(getByText("Manage your collection")).toBeTruthy()
    expect(getByText("Sell with Artsy")).toBeTruthy()
  })

  it("renders one card when only one card is visible", () => {
    const { getByText, queryAllByText } = renderWithRelay({
      HomePage: () => ({
        onboardingModule: {
          showMyCollectionCard: true,
          showSWACard: false,
        },
      }),
    })

    expect(getByText("Manage your collection")).toBeTruthy()
    expect(queryAllByText("Sell with Artsy")).toHaveLength(0)
  })

  it("navigates and tracks correctly MyC card", () => {
    const { getByTestId, getByText } = renderWithRelay({})

    fireEvent.press(getByTestId("my-collection-hf-onboadring-card-my-collection"))
    expect(getByText("Create a private record of your artworks")).toBeTruthy()
    expect(trackEvent).toHaveBeenCalledWith({
      action: "tappedExploreMyCollection",
      context_screen: "home",
      context_screen_owner_type: "home",
      context_module: "doMoreOnArtsy",
      destination_screen_owner_type: "myCollectionOnboarding",
    })
  })

  it("navigates correctly SWA card", () => {
    const { getByTestId } = renderWithRelay({})

    fireEvent.press(getByTestId("my-collection-hf-onboadring-card-swa"))
    expect(switchTab).toHaveBeenCalledWith("sell")
  })

  it("doesn't render any cards when both cards are not visible", () => {
    const { getByText } = renderWithRelay({
      HomePage: () => ({
        onboardingModule: {
          showMyCollectionCard: false,
          showSWACard: false,
        },
      }),
    })

    expect(() => getByText("Manage your collection")).toThrow()
    expect(() => getByText("Sell with Artsy")).toThrow()
  })
})
