import { renderWithWrappersLEGACY } from "app/utils/tests/renderWithWrappers"

/** Renders a React Component with specified layout using onLayout callback */

/**
 * @deprecated
 */
export const renderWithLayout = (component: any, layout: { width?: number; height?: number }) => {
  // create the component with renderer
  component = renderWithWrappersLEGACY(component)

  // create a nativeEvent with desired dimensions
  const mockNativeEvent = {
    nativeEvent: {
      layout,
    },
  }

  // manually trigger onLayout with mocked nativeEvent
  const json = component.toJSON()

  if (json.props.onLayout) {
    json.props.onLayout(mockNativeEvent)
  }

  // re-render
  return component.toJSON()
}
