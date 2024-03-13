## Adding a new screen

When adding a new screen to Eigen, make sure to use `Screen` components coming from `palette-mobile`. Below is a list of examples of usage and how it should look like.

> If the specs offered to you do not match any of the components we use, please reach out to #practice-mobile to make sure we are aligned.

### Screen with Animated Header (Recommended)

![screen-with-animated-header](./screenshots/screen-with-header.gif)

```typescript
const App = () => {
  import { Screen } from "@artsy/palette-mobile"

  return (
    <Screen>
      <Screen.AnimatedHeader onBack={goBack} title="Activity" />
      <Screen.StickySubHeader title="Activity" />
      <Screen.Body fullwidth>{children}</Screen.Body>
    </Screen>
  )
}
```

Note: `Screen.StickySubHeader` Supports children components as well.

<details>
  <summary>Example</summary>

![screen-with-animated-header-and-sticky-header](./screenshots/screen-with-animated-header-and-sticky-header.gif)

```typescript
import { Screen } from "@artsy/palette-mobile"

const App = () => {
  return (
    <Screen>
      <Screen.AnimatedHeader onBack={goBack} title="Activity" />
      <Screen.StickySubHeader title="Activity" />
      <Screen.Body fullwidth>{children}</Screen.Body>
    </Screen>
  )
}
```

</details>

### Screen with Simple Header

![screen-with-header](./screenshots/screen-with-header.gif)

```typescript
import { Screen } from "@artsy/palette-mobile"

const App = () => {
  return (
    <Screen>
      <Screen.Header onBack={goBack} title="Activity" />
      <Screen.Body fullwidth>{children}</Screen.Body>
    </Screen>
  )
}
```

## Gotchas!

### Broken Virtualization due to Nested ScrollViews

The `Screen` component from `palette-mobile` exports multiple scroll handlers that can be anchored to your favourite ScrollView component to avoid nesting. You can access them using `Screen.useListenForScreenScroll()`

Example:

```typescript
import { Screen } from "@artsy/palette-mobile"

const App = () => {
  return (
    <Screen>
      <Screen.AnimatedHeader onBack={goBack} title="Activity" />
      <Screen.StickySubHeader title="Activity" />
      <Screen.Body fullwidth>
        <ComponentWithScrollView />
      </Screen.Body>
    </Screen>
  )
}
```

- **Using a VirtualizedList from Screen**

```typescript
import { Screen } from '@artsy/palette-mobile'

const ComponentWithScrollView = () => {
  const { scrollHandler } = Screen.useListenForScreenScroll()

  return (
    <Screen.FlatList
      {...props}
      onScroll={scrollHandler}
    >
  )
}
```

- **Using Your Own VirtualizedList**

```typescript
import { Screen } from '@artsy/palette-mobile'
import Animated from "react-native-reanimated"

const ComponentWithScrollView = () => {
  const { scrollHandler } = Screen.useListenForScreenScroll()
  return (
    <AnimatedCustomVirtualizedList
      {...props}
      onScroll={scrollHandler}
    >
  )
}

const AnimatedCustomVirtualizedList = Animated.createAnimatedComponent(CustomVirtualizedList)
```
