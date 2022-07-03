import { fireEvent } from "@testing-library/react-native"
import { LegacyNativeModules } from "app/NativeModules/LegacyNativeModules"
import { navigate } from "app/navigation/navigate"
import { renderWithWrappersTL } from "app/tests/renderWithWrappers"
import { PrivacyRequest } from "./PrivacyRequest"

describe(PrivacyRequest, () => {
  it("handles privacy policy link taps", () => {
    const { getByText } = renderWithWrappersTL(<PrivacyRequest />)

    fireEvent.press(getByText("Privacy Policy"))

    expect(navigate).toHaveBeenCalledWith("/privacy", { modal: true })
  })

  it("handles email link taps", () => {
    const { getByText } = renderWithWrappersTL(<PrivacyRequest />)
    fireEvent.press(getByText("privacy@artsy.net."))

    expect(
      LegacyNativeModules.ARTNativeScreenPresenterModule.presentEmailComposerWithSubject
    ).toHaveBeenCalledWith("Personal Data Request", "privacy@artsy.net")
  })

  it("handles CCPA button presses", () => {
    const { getByText } = renderWithWrappersTL(<PrivacyRequest />)

    fireEvent.press(getByText("Do not sell my personal information"))

    expect(
      LegacyNativeModules.ARTNativeScreenPresenterModule.presentEmailComposerWithBody
    ).toHaveBeenCalledWith(
      "Hello, I'm contacting you to ask that...",
      "Personal Data Request",
      "privacy@artsy.net"
    )
  })
})
