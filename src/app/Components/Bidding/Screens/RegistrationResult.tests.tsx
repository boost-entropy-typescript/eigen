import { LinkText, Button } from "@artsy/palette-mobile"
import { Icon20 } from "app/Components/Bidding/Components/Icon"
import { dismissModal, navigate } from "app/system/navigation/navigate"
import { extractText } from "app/utils/tests/extractText"
import { renderWithWrappersLEGACY } from "app/utils/tests/renderWithWrappers"

import { Linking } from "react-native"
import { RegistrationResult, RegistrationStatus } from "./RegistrationResult"

describe("Registration result component", () => {
  it("renders registration pending properly", () => {
    const tree = renderWithWrappersLEGACY(
      <RegistrationResult
        status={RegistrationStatus.RegistrationStatusPending}
        needsIdentityVerification={false}
      />
    )
    expect(extractText(tree.root)).toMatch("Registration pending")
    expect(extractText(tree.root)).toMatch(
      "Artsy is reviewing your registration and you will receive an email when it has been confirmed. Please email "
    )
    expect(extractText(tree.root)).not.toMatch(
      "This auction requires Artsy to verify your identity before bidding."
    )
  })

  it("renders registration pending with an explanation about IDV", () => {
    const tree = renderWithWrappersLEGACY(
      <RegistrationResult
        status={RegistrationStatus.RegistrationStatusPending}
        needsIdentityVerification
      />
    )

    expect(extractText(tree.root)).toMatch("Registration pending")
    expect(extractText(tree.root)).toMatch(
      "This auction requires Artsy to verify your identity before bidding."
    )
    expect(extractText(tree.root)).not.toMatch(
      "Artsy is reviewing your registration and you will receive an email when it has been confirmed. Please email "
    )
  })

  it("does not render the icon when the registration status is pending", () => {
    const component = renderWithWrappersLEGACY(
      <RegistrationResult status={RegistrationStatus.RegistrationStatusPending} />
    )

    expect(component.root.findAllByType(Icon20).length).toEqual(0)
  })

  it("renders registration complete properly", () => {
    const tree = renderWithWrappersLEGACY(
      <RegistrationResult status={RegistrationStatus.RegistrationStatusComplete} />
    )
    expect(extractText(tree.root)).toMatch("Registration complete")
  })

  it("renders registration error properly", () => {
    const tree = renderWithWrappersLEGACY(
      <RegistrationResult status={RegistrationStatus.RegistrationStatusError} />
    )

    expect(extractText(tree.root)).toMatch("An error occurred")
    expect(extractText(tree.root)).toMatch("Please contact")
    expect(extractText(tree.root)).toMatch("with any questions.")
  })

  it("renders an error screen when the status is a network error", () => {
    const tree = renderWithWrappersLEGACY(
      <RegistrationResult status={RegistrationStatus.RegistrationStatusNetworkError} />
    )

    expect(extractText(tree.root)).toMatch("An error occurred")
    expect(extractText(tree.root)).toMatch("Please\ncheck your internet connection\nand try again.")
  })

  it("renders registration error and mailto link properly", async () => {
    Linking.canOpenURL = jest.fn().mockReturnValue(Promise.resolve(true))
    Linking.openURL = jest.fn()

    const component = renderWithWrappersLEGACY(
      <RegistrationResult status={RegistrationStatus.RegistrationStatusError} />
    )
    await component.root.findByType(LinkText).props.onPress()
    expect(Linking.openURL).toBeCalledWith("mailto:support@artsy.net")
  })

  it("dismisses the controller when the continue button is pressed", () => {
    jest.useFakeTimers({
      legacyFakeTimers: true,
    })
    const component = renderWithWrappersLEGACY(
      <RegistrationResult status={RegistrationStatus.RegistrationStatusComplete} />
    )
    component.root.findByType(Button).props.onPress()
    jest.runAllTicks()

    expect(dismissModal).toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })
})
