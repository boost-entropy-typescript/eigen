import {
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react-native"
import { setupTestWrapper } from "app/utils/tests/setupTestWrapper"
import { SearchScreen2 } from "./Search2"

describe("Search", () => {
  const { renderWithRelay } = setupTestWrapper({
    Component: () => <SearchScreen2 />,
  })

  it("should render a text input with placeholder and no pills", async () => {
    renderWithRelay()

    await waitForElementToBeRemoved(() => screen.getByTestId("search-placeholder"))

    const searchInput = screen.getByPlaceholderText("Search artists, artworks, galleries, etc")

    expect(searchInput).toBeTruthy()

    // Pill should not be visible
    expect(screen.queryByText("Artists")).toBeFalsy()

    // should show City Guide
    expect(screen.getByText("City Guide")).toBeTruthy()
    expect(screen.getByText("Recent Searches")).toBeTruthy()

    fireEvent.changeText(searchInput, "Ba")

    // Pills should be visible
    await waitFor(() => {
      screen.getByText("Artworks")
      screen.getByText("Top")
    })
  })

  it("Top pill should be selected by default", async () => {
    renderWithRelay()

    await waitForElementToBeRemoved(() => screen.getByTestId("search-placeholder"))

    const searchInput = screen.getByPlaceholderText("Search artists, artworks, galleries, etc")

    fireEvent.changeText(searchInput, "text")

    expect(screen.getByA11yState({ selected: true })).toHaveTextContent("Top")
  })

  it("when clear button is pressed", async () => {
    renderWithRelay()

    await waitForElementToBeRemoved(() => screen.getByTestId("search-placeholder"))

    const searchInput = screen.getByPlaceholderText("Search artists, artworks, galleries, etc")

    fireEvent(searchInput, "changeText", "prev value")
    fireEvent(screen.getByText("Artworks"), "press")
    fireEvent(screen.getByLabelText("Clear input button"), "press")
    fireEvent(searchInput, "changeText", "new value")

    expect(screen.queryByA11yState({ selected: true })).toHaveTextContent("Top")
  })

  it("when cancel button is pressed", async () => {
    renderWithRelay()

    await waitForElementToBeRemoved(() => screen.getByTestId("search-placeholder"))

    const searchInput = screen.getByPlaceholderText("Search artists, artworks, galleries, etc")

    fireEvent(searchInput, "changeText", "prev value")
    fireEvent(screen.getByText("Artworks"), "press")
    fireEvent(searchInput, "focus")
    fireEvent(screen.getByText("Cancel"), "press")
    fireEvent(searchInput, "changeText", "new value")

    expect(screen.queryByA11yState({ selected: true })).toHaveTextContent("Top")
  })
})
