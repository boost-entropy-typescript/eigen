import { GlobalStoreProvider } from "app/store/GlobalStore"
import { setupTestWrapperTL } from "app/tests/setupTestWrapper"
import { Theme } from "palette"
import { graphql } from "react-relay"
import { PartnerLocationSectionContainer as PartnerLocationSection } from "./PartnerLocationSection"

jest.unmock("react-relay")

const PartnerLocationSectionFixture = {
  internalID: "4d8b92c44eb68a1b2c0004cb",
  name: "Gagosian",
  cities: [],
  locations: {
    totalCount: 14,
  },
  " $fragmentRefs": null,
  " $refType": null,
}

describe("PartnerLoationSection", () => {
  const { renderWithRelay } = setupTestWrapperTL({
    Component: (props) => (
      <GlobalStoreProvider>
        <Theme>
          <PartnerLocationSection partner={{ ...props.partner }} {...props} />
        </Theme>
      </GlobalStoreProvider>
    ),
    query: graphql`
      query PartnerLocationSectionTestsQuery @raw_response_type {
        partner(id: "gagosian") {
          name
          cities
          locations: locationsConnection(first: 0) {
            totalCount
          }
        }
      }
    `,
  })

  it("renders the locations text correctly", async () => {
    const partnerWithLocations = {
      ...PartnerLocationSectionFixture,
      cities,
    }

    const { queryByText } = renderWithRelay({
      Partner: () => partnerWithLocations,
    })

    expect(queryByText(/Gagosian has 14 locations in/)).toBeTruthy()
    expect(
      queryByText(
        /New York, Beverly Hills, San Francisco, London, Paris, Le Bourget, Geneva, Basel, Rome, Athens/
      )
    ).toBeTruthy()
    expect(queryByText(/and/)).toBeTruthy()
    expect(queryByText(/Central, Hong Kong/)).toBeTruthy()

    expect(queryByText("See all location details")).toBeTruthy()
  })
})

const cities = [
  "New York",
  "Beverly Hills",
  "San Francisco",
  "London",
  "Paris",
  "Le Bourget",
  "Geneva",
  "Basel",
  "Rome",
  "Athens",
  "Central, Hong Kong",
]
