import { OwnerType } from "@artsy/cohesion"
import { fireEvent, screen, waitFor } from "@testing-library/react-native"
import {
  SavedSearchEntity,
  SearchCriteriaAttributes,
} from "app/Components/ArtworkFilter/SavedSearch/types"
import { CreateSavedSearchAlert } from "app/Scenes/SavedSearchAlert/CreateSavedSearchAlert"
import {
  CreateSavedSearchAlertNavigationStack,
  SavedSearchAlertMutationResult,
} from "app/Scenes/SavedSearchAlert/SavedSearchAlertModel"
import {
  SavedSearchStoreProvider,
  savedSearchModel,
} from "app/Scenes/SavedSearchAlert/SavedSearchStore"
import { flushPromiseQueue } from "app/utils/tests/flushPromiseQueue"
import { mockTrackEvent } from "app/utils/tests/globallyMockedStuff"
import { renderWithWrappers } from "app/utils/tests/renderWithWrappers"
import { setupTestWrapper } from "app/utils/tests/setupTestWrapper"
import {
  CreateSavedSearchModal,
  CreateSavedSearchModalProps,
  tracks,
} from "./CreateSavedSearchModal"

jest.mock("../../../Scenes/SavedSearchAlert/queries/getSavedSearchIdByCriteria", () => ({
  getSavedSearchIdByCriteria: () => Promise.resolve(null),
}))

jest.mock("../../../Scenes/SavedSearchAlert/mutations/createSavedSearchAlert", () => ({
  createSavedSearchAlert: () =>
    Promise.resolve({
      createSavedSearch: { savedSearchOrErrors: { internalID: "new-alert-4242" } },
    }),
}))

const mockNavigate = jest.fn()
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native")
  return {
    ...actualNav,
    useNavigation: () => {
      return {
        navigate: mockNavigate,
        addListener: jest.fn(),
      }
    },
    useRoute: () => {
      const params: CreateSavedSearchAlertNavigationStack["ConfirmationScreen"] = {
        searchCriteriaID: "foo-bar-42",
        closeModal: jest.fn(),
      }

      return { params }
    },
  }
})

const savedSearchEntity: SavedSearchEntity = {
  placeholder: "Placeholder",
  artists: [{ id: "artistId", name: "artistName" }],
  owner: {
    type: OwnerType.artist,
    id: "ownerId",
    slug: "ownerSlug",
  },
}

const attributes: SearchCriteriaAttributes = {
  artistIDs: ["artistId"],
}

const defaultProps: CreateSavedSearchModalProps = {
  visible: true,
  entity: savedSearchEntity,
  attributes,
  aggregations: [],
  closeModal: jest.fn,
}

const mockedMutationResult: SavedSearchAlertMutationResult = {
  id: "savedSearchAlertId",
}

const TestWrapper: React.FC = ({ children }) => (
  <SavedSearchStoreProvider
    runtimeModel={{
      ...savedSearchModel,
      attributes,
      aggregations: [],
      entity: savedSearchEntity,
    }}
  >
    {children}
  </SavedSearchStoreProvider>
)

describe("CreateSavedSearchModal", () => {
  const TestRenderer = (props?: Partial<CreateSavedSearchModalProps>) => {
    return <CreateSavedSearchModal {...defaultProps} {...props} />
  }

  it("renders without throwing an error", () => {
    renderWithWrappers(<TestRenderer />)
  })

  it("tracks clicks when the create alert button is pressed", async () => {
    const { UNSAFE_root } = renderWithWrappers(<TestRenderer />)

    UNSAFE_root.findByType(CreateSavedSearchAlert).props.params.onComplete(mockedMutationResult)

    expect(mockTrackEvent).toHaveBeenCalledWith(
      tracks.toggleSavedSearch(true, OwnerType.artist, "ownerId", "ownerSlug", "savedSearchAlertId")
    )
  })

  it("navigates to the confirmation screen", async () => {
    const { renderWithRelay } = setupTestWrapper({
      Component: () => (
        <TestWrapper>
          <CreateSavedSearchModal {...defaultProps} />,
        </TestWrapper>
      ),
    })

    renderWithRelay()

    await waitFor(() => {
      expect(screen.getByText("Save Alert")).toBeOnTheScreen()
    })

    fireEvent.press(screen.getByText("Save Alert"))
    await flushPromiseQueue()

    expect(mockNavigate).toHaveBeenCalledWith("ConfirmationScreen", {
      searchCriteriaID: "new-alert-4242",
    })
  })
})
