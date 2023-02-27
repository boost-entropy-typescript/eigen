import { navigate, NavigateOptions } from "app/system/navigation/navigate"
import { merge } from "lodash"

interface UseNavigateToPagebleRouteProps<T> {
  items: ReadonlyArray<T>
}

export interface PageableRouteProps {
  navigateToPageableRoute: (url: string, options?: NavigateOptions) => void
}

export function useNavigateToPageableRoute<T extends { slug: string }>(
  props: UseNavigateToPagebleRouteProps<T>
): PageableRouteProps {
  const slugs = props.items.map((item) => item.slug)

  const navigateToPageableRoute = (url: string, options: NavigateOptions = {}) => {
    navigate(
      url,
      merge(options, {
        passProps: {
          pageableSlugs: slugs,
        },
      })
    )
  }

  return {
    navigateToPageableRoute,
  }
}
