import { __globalStoreTestUtils__ } from "app/store/GlobalStore"
import { renderWithWrappers } from "app/utils/tests/renderWithWrappers"
import { HomeHeader } from "./HomeHeader"

describe("HomeHeader", () => {
  const TestRenderer: React.FC = () => {
    return <HomeHeader />
  }

  describe("Activity", () => {
    it("should NOT render unseen indicator when there are no unseen notifications", async () => {
      __globalStoreTestUtils__?.injectState({
        bottomTabs: {
          sessionState: {
            unseenCounts: {
              notifications: 0,
            },
          },
        },
      })

      const { queryByLabelText } = renderWithWrappers(<TestRenderer />)

      const indicator = queryByLabelText("Unseen Notifications Indicator")
      expect(indicator).toBeNull()
    })

    it("should render unseen indicator when there are unseen notifications", async () => {
      __globalStoreTestUtils__?.injectState({
        bottomTabs: {
          sessionState: {
            unseenCounts: {
              notifications: 5,
            },
          },
        },
      })

      const { getByLabelText } = renderWithWrappers(<TestRenderer />)

      const indicator = getByLabelText("Unseen Notifications Indicator")
      expect(indicator).toBeTruthy()
    })
  })
})
