import { screen } from "@testing-library/react-native"
import { flushPromiseQueue } from "app/utils/tests/flushPromiseQueue"
import { setupTestWrapper } from "app/utils/tests/setupTestWrapper"
import { Suspense } from "react"
import { ActivityScreen } from "./ActivityScreen"

describe("ActivityScreen", () => {
  const { renderWithRelay } = setupTestWrapper({
    Component: () => (
      <Suspense fallback={null}>
        <ActivityScreen />
      </Suspense>
    ),
  })

  it("renders items", async () => {
    renderWithRelay({
      NotificationConnection: () => notifications,
    })

    await flushPromiseQueue()

    expect(screen.getByText("Notification One")).toBeTruthy()
    expect(screen.getByText("Notification Two")).toBeTruthy()
  })

  describe("notification type filter pills", () => {
    it("renders all filter pills", async () => {
      const { mockResolveLastOperation } = renderWithRelay({
        NotificationConnection: () => notifications,
      })
      mockResolveLastOperation({
        NotificationConnection: () => ({ totalCount: 1 }),
      })

      await flushPromiseQueue()

      expect(screen.getByText("All")).toBeTruthy()
      expect(screen.getByText("Offers")).toBeTruthy()
      expect(screen.getByText("Alerts")).toBeTruthy()
      expect(screen.getByText("Follows")).toBeTruthy()
    })

    it("does not render 'Offers' filter pill when there are no offers available", async () => {
      const { mockResolveLastOperation } = renderWithRelay({
        NotificationConnection: () => notifications,
      })
      mockResolveLastOperation({
        NotificationConnection: () => ({ totalCount: 0 }),
      })

      await flushPromiseQueue()

      expect(screen.queryByText("Offers")).toBeFalsy()

      expect(screen.getByText("All")).toBeTruthy()
      expect(screen.getByText("Alerts")).toBeTruthy()
      expect(screen.getByText("Follows")).toBeTruthy()
    })
  })

  it("renders empty states", async () => {
    renderWithRelay({
      NotificationConnection: () => ({
        edges: [],
      }),
    })

    await flushPromiseQueue()

    expect(screen.getByLabelText("Activities are empty")).toBeTruthy()
  })

  it("hides notifications with 0 artworks", async () => {
    renderWithRelay({
      NotificationConnection: () => ({
        edges: [
          ...notifications.edges,
          {
            node: {
              notificationType: "ARTWORK_PUBLISHED",
              title: "Notification Three",
              artworks: {
                totalCount: 0,
              },
            },
          },
        ],
      }),
    })

    await flushPromiseQueue()

    expect(screen.getByText("Notification One")).toBeTruthy()
    expect(screen.getByText("Notification Two")).toBeTruthy()
    expect(screen.queryByText("Notification Three")).toBeNull()
  })
})

const notifications = {
  edges: [
    {
      node: {
        headline: "Notification One",
        notificationType: "VIEWING_ROOM_PUBLISHED",
        item: {
          viewingRoomsConnection: {
            totalCount: 1,
          },
        },
      },
    },
    {
      node: {
        headline: "Notification Two",
        notificationType: "ARTWORK_ALERT",
        artworks: {
          totalCount: 3,
        },
      },
    },
  ],
}
