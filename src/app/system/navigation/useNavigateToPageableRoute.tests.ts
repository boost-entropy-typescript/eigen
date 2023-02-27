import { navigate } from "app/system/navigation/navigate"
import { useNavigateToPageableRoute } from "app/system/navigation/useNavigateToPageableRoute"

jest.mock("app/system/navigation/navigate")

describe("useNavigateToPageableRoute", () => {
  const mockNavigate = navigate as jest.Mock

  afterEach(() => {
    jest.resetAllMocks()
  })

  it("returns a navigate function", () => {
    const { navigateToPageableRoute } = useNavigateToPageableRoute({ items: [] })
    expect(navigateToPageableRoute).toBeDefined()
  })

  it("returns a function that calls navigate with the correctly merged options arguments", () => {
    const spy = jest.fn()
    mockNavigate.mockImplementation(spy)

    const { navigateToPageableRoute } = useNavigateToPageableRoute({ items: [] })
    navigateToPageableRoute("some-url", { passProps: { someProp: "some-value" } })

    expect(spy).toHaveBeenCalledWith("some-url", {
      passProps: { someProp: "some-value", pageableSlugs: [] },
    })
  })

  it("maps over items and returns the correct slugs", () => {
    const items = [{ slug: "foo" }, { slug: "bar" }, { slug: "baz" }]
    const spy = jest.fn()

    mockNavigate.mockImplementation(spy)

    const { navigateToPageableRoute } = useNavigateToPageableRoute({ items })
    navigateToPageableRoute("some-url")

    expect(spy).toHaveBeenCalledWith("some-url", {
      passProps: { pageableSlugs: ["foo", "bar", "baz"] },
    })
  })
})
