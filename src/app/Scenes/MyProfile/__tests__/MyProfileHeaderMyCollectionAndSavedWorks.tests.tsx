import { Avatar } from "@artsy/palette-mobile"
import { fireEvent, screen } from "@testing-library/react-native"
import { MyProfileHeaderMyCollectionAndSavedWorksTestsQuery } from "__generated__/MyProfileHeaderMyCollectionAndSavedWorksTestsQuery.graphql"
import { StickyTabPage } from "app/Components/StickyTabPage/StickyTabPage"
import { FavoriteArtworksQueryRenderer } from "app/Scenes/Favorites/FavoriteArtworks"
import { MyCollectionQueryRenderer } from "app/Scenes/MyCollection/MyCollection"
import { MyCollectionTabsStoreProvider } from "app/Scenes/MyCollection/State/MyCollectionTabsStore"
import {
  LOCAL_PROFILE_ICON_PATH_KEY,
  MyProfileHeaderMyCollectionAndSavedWorksFragmentContainer,
} from "app/Scenes/MyProfile/MyProfileHeaderMyCollectionAndSavedWorks"
import { navigate } from "app/system/navigation/navigate"
import { LocalImage, storeLocalImage } from "app/utils/LocalImageStore"
import { flushPromiseQueue } from "app/utils/tests/flushPromiseQueue"
import { renderWithWrappers } from "app/utils/tests/renderWithWrappers"
import { resolveMostRecentRelayOperation } from "app/utils/tests/resolveMostRecentRelayOperation"
import { graphql, QueryRenderer } from "react-relay"
import { act } from "react-test-renderer"
import { createMockEnvironment } from "relay-test-utils"

jest.mock("../LoggedInUserInfo")
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native")
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  }
})

describe("MyProfileHeaderMyCollectionAndSavedWorks", () => {
  let mockEnvironment: ReturnType<typeof createMockEnvironment>
  const TestRenderer = () => (
    <MyCollectionTabsStoreProvider>
      <QueryRenderer<MyProfileHeaderMyCollectionAndSavedWorksTestsQuery>
        environment={mockEnvironment}
        query={graphql`
          query MyProfileHeaderMyCollectionAndSavedWorksTestsQuery @relay_test_operation {
            me @optionalField {
              ...MyProfileHeaderMyCollectionAndSavedWorks_me
            }
          }
        `}
        render={({ props, error }) => {
          if (props?.me) {
            return <MyProfileHeaderMyCollectionAndSavedWorksFragmentContainer me={props?.me} />
          } else if (error) {
            console.log(error)
          }
        }}
        variables={{}}
      />
    </MyCollectionTabsStoreProvider>
  )

  const getWrapper = (mockResolvers = {}) => {
    const tree = renderWithWrappers(<TestRenderer />)
    resolveMostRecentRelayOperation(mockEnvironment, mockResolvers)
    return tree
  }

  beforeEach(() => {
    mockEnvironment = createMockEnvironment()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Components of MyProfileHeaderMyCollectionAndSavedWorks ", () => {
    it("renders the right tabs", () => {
      getWrapper()

      expect(screen.UNSAFE_queryByType(StickyTabPage)).toBeDefined()
      expect(screen.UNSAFE_queryByType(MyCollectionQueryRenderer)).toBeDefined()
      expect(screen.UNSAFE_queryByType(FavoriteArtworksQueryRenderer)).toBeDefined()
    })

    // Header tests
    it("Header Settings onPress navigates to my profile edit", () => {
      getWrapper()
      const profileImage = screen.getByTestId("profile-image")

      expect(profileImage).toBeTruthy()
      fireEvent.press(profileImage)
      expect(navigate).toHaveBeenCalledTimes(1)
      expect(navigate).toHaveBeenCalledWith("/my-profile/edit", {
        passProps: { onSuccess: expect.anything() },
      })
    })

    it("Header shows the right text", async () => {
      getWrapper({
        Me: () => ({
          name: "My Name",
          createdAt: new Date().toISOString(),
          bio: "My Bio",
          icon: {
            url: "https://someurll.jpg",
          },
        }),
      })

      const year = new Date().getFullYear()

      expect(screen.queryByText("My Name")).toBeTruthy()
      expect(screen.queryByText(`Member since ${year}`)).toBeTruthy()
      expect(screen.queryByText("My Bio")).toBeTruthy()
    })

    it("Renders Icon", async () => {
      const localImage: LocalImage = {
        path: "some/my/profile/path",
        width: 10,
        height: 10,
      }

      await act(async () => {
        await storeLocalImage(LOCAL_PROFILE_ICON_PATH_KEY, localImage)
      })

      getWrapper({
        Me: () => ({
          name: "My Name",
          createdAt: new Date().toISOString(),
          bio: "My Bio",
          icon: {
            url: "https://someurll.jpg",
          },
        }),
      })

      await flushPromiseQueue()
      expect(screen.UNSAFE_queryByType(Avatar)).toBeDefined()
    })

    it("renders Collector Profile info", async () => {
      getWrapper({
        Me: () => ({
          name: "Princess",
          createdAt: new Date("12/12/12").toISOString(),
          bio: "Richest Collector! 💰",
          location: {
            display: "Atlantis",
          },
          profession: "Guardian of the Galaxy",
          otherRelevantPositions: "Marvel Universe",
        }),
      })

      expect(screen.queryByText("Guardian of the Galaxy")).toBeTruthy()
      expect(screen.queryByText("Atlantis")).toBeTruthy()
      expect(screen.queryByText("Marvel Universe")).toBeTruthy()
    })
  })
})
