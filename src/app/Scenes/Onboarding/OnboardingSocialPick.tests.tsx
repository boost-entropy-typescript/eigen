import { screen } from "@testing-library/react-native"
import { OnboardingSocialPick } from "app/Scenes/Onboarding/OnboardingSocialPick"
import { __globalStoreTestUtils__ } from "app/store/GlobalStore"
import { getMockRelayEnvironment } from "app/system/relay/defaultEnvironment"
import { renderWithWrappers } from "app/utils/tests/renderWithWrappers"
import { Platform } from "react-native"
import { RelayEnvironmentProvider } from "react-relay"

const mockEnvironment = getMockRelayEnvironment()

describe("OnboardingSocialPick", () => {
  const TestRenderer = () => (
    <RelayEnvironmentProvider environment={mockEnvironment}>
      <OnboardingSocialPick mode={mode} />
    </RelayEnvironmentProvider>
  )

  let mode: "login" | "signup"

  describe("ios", () => {
    beforeAll(() => {
      Platform.OS = "ios"
    })

    describe("login", () => {
      beforeAll(() => {
        mode = "login"
      })

      describe("when the new disclaimer is disabled", () => {
        beforeEach(() => {
          __globalStoreTestUtils__?.injectFeatureFlags({ AREnableNewTermsAndConditions: false })
        })

        it("renders the disclaimer text", () => {
          renderWithWrappers(<TestRenderer />)

          expect(screen.getByTestId("disclaimer")).toHaveTextContent(
            "By tapping Continue with Facebook, Google or Apple, you agree to Artsy's Terms of Use and Privacy Policy"
          )
        })
      })

      describe("when the new disclaimer is enabled", () => {
        beforeEach(() => {
          __globalStoreTestUtils__?.injectFeatureFlags({ AREnableNewTermsAndConditions: true })
        })

        it("renders the new disclaimer text", () => {
          renderWithWrappers(<TestRenderer />)

          expect(screen.getByTestId("disclaimer")).toHaveTextContent(
            "By tapping Continue with Email, Facebook, Google or Apple, you agree to Artsy's Terms and Conditions and Privacy Policy"
          )
        })
      })
    })

    describe("signup", () => {
      beforeAll(() => {
        mode = "signup"
      })

      describe("when the new disclaimer is disabled", () => {
        beforeEach(() => {
          __globalStoreTestUtils__?.injectFeatureFlags({ AREnableNewTermsAndConditions: false })
        })

        it("renders the disclaimer text", () => {
          renderWithWrappers(<TestRenderer />)

          expect(screen.getByTestId("disclaimer")).toHaveTextContent(
            "By tapping Continue with Facebook, Google or Apple, you agree to Artsy's Terms of Use and Privacy Policy"
          )
        })
      })

      describe("when the new disclaimer is enabled", () => {
        beforeEach(() => {
          __globalStoreTestUtils__?.injectFeatureFlags({ AREnableNewTermsAndConditions: true })
        })

        it("renders the new disclaimer text", () => {
          renderWithWrappers(<TestRenderer />)

          expect(screen.getByTestId("disclaimer")).toHaveTextContent(
            "By tapping Continue with Email, Facebook, Google or Apple, you agree to Artsy's Terms and Conditions and Privacy Policy"
          )
        })
      })
    })
  })

  describe("android", () => {
    beforeAll(() => {
      Platform.OS = "android"
    })

    describe("login", () => {
      beforeAll(() => {
        mode = "login"
      })

      describe("when the new disclaimer is disabled", () => {
        beforeEach(() => {
          __globalStoreTestUtils__?.injectFeatureFlags({ AREnableNewTermsAndConditions: false })
        })

        it("renders the disclaimer text", () => {
          renderWithWrappers(<TestRenderer />)

          expect(screen.getByTestId("disclaimer")).toHaveTextContent(
            "By tapping Continue with Facebook, Google, you agree to Artsy's Terms of Use and Privacy Policy"
          )
        })
      })

      describe("when the new disclaimer is enabled", () => {
        beforeEach(() => {
          __globalStoreTestUtils__?.injectFeatureFlags({ AREnableNewTermsAndConditions: true })
        })

        it("renders the new disclaimer text", () => {
          renderWithWrappers(<TestRenderer />)

          expect(screen.getByTestId("disclaimer")).toHaveTextContent(
            "By tapping Continue with Email, Facebook, Google, you agree to Artsy's Terms and Conditions and Privacy Policy"
          )
        })
      })
    })

    describe("signup", () => {
      beforeAll(() => {
        mode = "signup"
      })

      describe("when the new disclaimer is disabled", () => {
        beforeEach(() => {
          __globalStoreTestUtils__?.injectFeatureFlags({ AREnableNewTermsAndConditions: false })
        })

        it("renders the disclaimer text", () => {
          renderWithWrappers(<TestRenderer />)

          expect(screen.getByTestId("disclaimer")).toHaveTextContent(
            "By tapping Continue with Facebook, Google, you agree to Artsy's Terms of Use and Privacy Policy"
          )
        })
      })

      describe("when the new disclaimer is enabled", () => {
        beforeEach(() => {
          __globalStoreTestUtils__?.injectFeatureFlags({ AREnableNewTermsAndConditions: true })
        })

        it("renders the new disclaimer text", () => {
          renderWithWrappers(<TestRenderer />)

          expect(screen.getByTestId("disclaimer")).toHaveTextContent(
            "By tapping Continue with Email, Facebook, Google, you agree to Artsy's Terms and Conditions and Privacy Policy"
          )
        })
      })
    })
  })
})
