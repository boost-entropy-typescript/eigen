import { AutosuggestResult } from "app/Components/AutosuggestResults/AutosuggestResults"
import { renderWithWrappers } from "app/utils/tests/renderWithWrappers"
import { ArtistSearchResult } from "./ArtistSearchResult"

describe("ArtistSearchResult", () => {
  const result = {
    imageUrl: "image-url",
    displayLabel: "Banksy",
    formattedNationalityAndBirthday: "An Artist",
  }

  it("renders correct components", async () => {
    const { findByText } = renderWithWrappers(
      <ArtistSearchResult result={result as AutosuggestResult} />
    )
    expect(await findByText("Banksy")).toBeTruthy()
    expect(await findByText("An Artist")).toBeTruthy()
  })
})
