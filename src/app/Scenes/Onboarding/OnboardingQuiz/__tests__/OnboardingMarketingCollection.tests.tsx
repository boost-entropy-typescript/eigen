import { screen, waitForElementToBeRemoved } from "@testing-library/react-native"
import { OnboardingMarketingCollectionScreen } from "app/Scenes/Onboarding/OnboardingQuiz/OnboardingMarketingCollection"
import { renderWithHookWrappersTL } from "app/utils/tests/renderWithWrappers"
import { resolveMostRecentRelayOperation } from "app/utils/tests/resolveMostRecentRelayOperation"
import { createMockEnvironment } from "relay-test-utils"

const mockedNavigate = jest.fn()

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native")
  return {
    ...actualNav,
    useNavigation: () => ({
      getId: () => "onboarding-marketing-collection-id",
      navigate: mockedNavigate,
    }),
  }
})

describe("OnboardingMarketingCollection", () => {
  let env: ReturnType<typeof createMockEnvironment>

  beforeEach(() => {
    env = createMockEnvironment()
  })

  const description = "This is the description."
  const placeholderText = "Great choice\nWe’re finding a collection for you"

  it("renders properly", async () => {
    renderWithHookWrappersTL(
      <OnboardingMarketingCollectionScreen
        slug="curators-picks-emerging"
        description={description}
      />,
      env
    )

    expect(screen.getByText(placeholderText)).toBeTruthy()

    resolveMostRecentRelayOperation(env, {
      MarketingCollection: () => ({
        title: "Example Collection",
      }),
    })

    await waitForElementToBeRemoved(() => screen.queryByText(placeholderText))

    expect(screen.queryByText(placeholderText)).toBeNull()

    expect(screen.getByText("Example Collection")).toBeTruthy()
    expect(screen.getByText(description)).toBeTruthy()

    expect(screen.getByText("Explore More on Artsy")).toBeTruthy()
  })
})
