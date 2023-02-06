import { fireEvent } from "@testing-library/react-native"
import { goBack } from "app/system/navigation/navigate"
import { renderWithWrappers } from "app/utils/tests/renderWithWrappers"
import { RequestForPriceEstimateConfirmationScreen } from "./RequestForPriceEstimateConfirmationScreen"

describe("RequestForPriceEstimateConfirmationScreen", () => {
  const getWrapper = () => {
    return renderWithWrappers(<RequestForPriceEstimateConfirmationScreen />)
  }
  it("renders without errors", () => {
    const { getByText } = getWrapper()
    expect(getByText("Price Estimate Request Sent")).toBeTruthy()
    expect(
      getByText(
        "An Artsy Specialist will evaluate your artwork and contact you with a free price estimate."
      )
    ).toBeTruthy()
  })

  it("navigates correctly", () => {
    const { getByTestId } = getWrapper()
    fireEvent.press(getByTestId("back-to-my-collection-button"))
    expect(goBack).toHaveBeenCalled()
  })
})
