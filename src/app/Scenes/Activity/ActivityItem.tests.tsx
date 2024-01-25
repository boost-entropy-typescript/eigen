import { fireEvent, screen } from "@testing-library/react-native"
import { ActivityItem_Test_Query } from "__generated__/ActivityItem_Test_Query.graphql"
import { ActivityItem_notification$key } from "__generated__/ActivityItem_notification.graphql"
import { navigate } from "app/system/navigation/navigate"
import { extractNodes } from "app/utils/extractNodes"
import { flushPromiseQueue } from "app/utils/tests/flushPromiseQueue"
import { mockTrackEvent } from "app/utils/tests/globallyMockedStuff"
import { renderWithHookWrappersTL } from "app/utils/tests/renderWithWrappers"
import { resolveMostRecentRelayOperation } from "app/utils/tests/resolveMostRecentRelayOperation"
import { graphql, useLazyLoadQuery } from "react-relay"
import { createMockEnvironment } from "relay-test-utils"
import { ActivityItem } from "./ActivityItem"

const targetUrl = "/artist/banksy/works-for-sale?sort=-published_at"
const alertTargetUrl =
  "/artist/banksy/works-for-sale?search_criteria_id=searchCriteriaId&sort=-published_at"

describe("ActivityItem", () => {
  let mockEnvironment: ReturnType<typeof createMockEnvironment>

  beforeEach(() => {
    mockEnvironment = createMockEnvironment()
  })

  const TestRenderer = () => {
    const data = useLazyLoadQuery<ActivityItem_Test_Query>(
      graphql`
        query ActivityItem_Test_Query {
          notificationsConnection(first: 1) {
            edges {
              node {
                ...ActivityItem_notification
              }
            }
          }
        }
      `,
      {}
    )
    const items = extractNodes(data.notificationsConnection)

    return <ActivityItem notification={items[0] as unknown as ActivityItem_notification$key} />
  }

  it("should the basic info", async () => {
    renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Notification: () => notification,
    })
    await flushPromiseQueue()

    expect(screen.getByText("Notification Title")).toBeTruthy()
    expect(screen.getByText("Notification Message")).toBeTruthy()
  })

  it("should render the formatted publication date", async () => {
    renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Notification: () => notification,
    })
    await flushPromiseQueue()

    expect(screen.getByText("2 days ago")).toBeTruthy()
  })

  it("should render artwork images", async () => {
    renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Notification: () => notification,
    })
    await flushPromiseQueue()

    expect(screen.getAllByLabelText("Activity Artwork Image")).toHaveLength(4)
  })

  it("should track event when an item is tapped", async () => {
    renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Notification: () => notification,
    })
    await flushPromiseQueue()

    fireEvent.press(screen.getByText("Notification Title"))

    expect(mockTrackEvent.mock.calls[0]).toMatchInlineSnapshot(`
      [
        {
          "action": "clickedActivityPanelNotificationItem",
          "notification_type": "ARTWORK_PUBLISHED",
        },
      ]
    `)
  })

  it("should pass predefined props when", async () => {
    renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Notification: () => notification,
    })
    await flushPromiseQueue()

    fireEvent.press(screen.getByText("Notification Title"))

    await flushPromiseQueue()

    expect(navigate).toHaveBeenCalledWith(targetUrl, {
      passProps: {
        predefinedFilters: [
          {
            displayText: "Recently Added",
            paramName: "sort",
            paramValue: "-published_at",
          },
        ],
        scrollToArtworksGrid: true,
        searchCriteriaID: undefined,
      },
    })
  })

  it("should pass search criteria id prop", async () => {
    renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Notification: () => ({
        ...notification,
        targetHref: alertTargetUrl,
      }),
    })
    await flushPromiseQueue()

    fireEvent.press(screen.getByText("Notification Title"))

    await flushPromiseQueue()

    expect(navigate).toHaveBeenCalledWith(alertTargetUrl, {
      passProps: {
        scrollToArtworksGrid: true,
        searchCriteriaID: "searchCriteriaId",
        predefinedFilters: [
          {
            displayText: "Recently Added",
            paramName: "sort",
            paramValue: "-published_at",
          },
        ],
      },
    })
  })

  it("should NOT call `mark as read` mutation if the notification has already been read", async () => {
    renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

    resolveMostRecentRelayOperation(mockEnvironment, {
      Notification: () => notification,
    })
    await flushPromiseQueue()

    fireEvent.press(screen.getByText("Notification Title"))

    await flushPromiseQueue()

    expect(() => mockEnvironment.mock.getMostRecentOperation()).toThrowError(
      "There are no pending operations in the list"
    )
  })

  describe("Unread notification indicator", () => {
    it("should NOT be rendered by default", async () => {
      renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

      resolveMostRecentRelayOperation(mockEnvironment, {
        Notification: () => notification,
      })
      await flushPromiseQueue()

      const indicator = screen.queryByLabelText("Unread notification indicator")
      expect(indicator).toBeNull()
    })

    it("should be rendered when notification is unread", async () => {
      renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

      resolveMostRecentRelayOperation(mockEnvironment, {
        Notification: () => ({
          ...notification,
          isUnread: true,
        }),
      })
      await flushPromiseQueue()

      const indicator = screen.getByLabelText("Unread notification indicator")
      expect(indicator).toBeTruthy()
    })

    it("should be removed after the activity item is pressed", async () => {
      renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

      resolveMostRecentRelayOperation(mockEnvironment, {
        Notification: () => ({
          ...notification,
          isUnread: true,
        }),
      })
      await flushPromiseQueue()

      expect(screen.getByLabelText("Unread notification indicator")).toBeTruthy()
      fireEvent.press(screen.getByText("Notification Title"))

      // resolving the mark as read mutation
      resolveMostRecentRelayOperation(mockEnvironment)
      await flushPromiseQueue()

      expect(screen.queryByLabelText("Unread notification indicator")).toBeFalsy()
    })
  })

  describe("Notification type", () => {
    it("should NOT be rendered by default", async () => {
      renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

      resolveMostRecentRelayOperation(mockEnvironment, {
        Notification: () => notification,
      })
      await flushPromiseQueue()

      const label = screen.queryByLabelText(/Notification type: .+/i)
      expect(label).toBeNull()
    })

    it("should render 'Alert'", async () => {
      renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

      resolveMostRecentRelayOperation(mockEnvironment, {
        Notification: () => ({
          ...notification,
          notificationType: "ARTWORK_ALERT",
        }),
      })
      await flushPromiseQueue()

      const label = screen.getByLabelText("Notification type: Alert")
      expect(label).toBeTruthy()
    })
  })

  describe("remaining artworks count", () => {
    it("should NOT be rendered if there are less or equal to 4", async () => {
      renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

      resolveMostRecentRelayOperation(mockEnvironment, {
        Notification: () => ({
          ...notification,
          objectsCount: 4,
        }),
      })
      await flushPromiseQueue()

      expect(screen.queryByLabelText("Remaining artworks count")).toBeFalsy()
    })

    it("should NOT be rendered if notification is not artwork-based", async () => {
      renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

      resolveMostRecentRelayOperation(mockEnvironment, {
        Notification: () => ({
          ...notification,
          notificationType: "PARTNER_SHOW_OPENED",
          objectsCount: 5,
        }),
      })
      await flushPromiseQueue()

      expect(screen.queryByLabelText("Remaining artworks count")).toBeFalsy()
    })

    it("should be rendered if there are more than 4", async () => {
      renderWithHookWrappersTL(<TestRenderer />, mockEnvironment)

      resolveMostRecentRelayOperation(mockEnvironment, {
        Notification: () => ({
          ...notification,
          objectsCount: 5,
        }),
      })
      await flushPromiseQueue()

      expect(screen.getByLabelText("Remaining artworks count")).toBeTruthy()
      expect(screen.getByText("+ 1")).toBeTruthy()
    })
  })
})

const artworks = [
  {
    node: {
      internalID: "artwork-id-one",
      title: "artwork one",
      image: {
        thumb: {
          src: "artwork-image-one",
          srcSet: "artwork-image-one",
        },
      },
    },
  },
  {
    node: {
      internalID: "artwork-id-two",
      title: "artwork two",
      image: {
        thumb: {
          src: "artwork-image-two",
          srcSet: "artwork-image-two",
        },
      },
    },
  },
  {
    node: {
      internalID: "artwork-id-three",
      title: "artwork three",
      image: {
        thumb: {
          src: "artwork-image-three",
          srcSet: "artwork-image-three",
        },
      },
    },
  },
  {
    node: {
      internalID: "artwork-id-four",
      title: "artwork four",
      image: {
        thumb: {
          src: "artwork-image-four",
          srcSet: "artwork-image-four",
        },
      },
    },
  },
]

const notification = {
  title: "Notification Title",
  message: "Notification Message",
  publishedAt: "2 days ago",
  isUnread: false,
  notificationType: "ARTWORK_PUBLISHED",
  targetHref: targetUrl,
  objectsCount: 4,
  artworksConnection: {
    edges: artworks,
  },
}
