import { InfiniteDiscoveryArtworkCard } from "app/Scenes/InfiniteDiscovery/Components/InfiniteDiscoveryArtworkCard"
import { AnimatedView } from "app/Scenes/InfiniteDiscovery/Components/Swiper/AnimatedView"
import { useScreenWidthWithOffset } from "app/Scenes/InfiniteDiscovery/Components/Swiper/useScreenWidthWithOffset"
import { InfiniteDiscoveryArtwork } from "app/Scenes/InfiniteDiscovery/InfiniteDiscovery"
import { forwardRef, Key, useEffect, useImperativeHandle, useState } from "react"
import { View, ViewStyle } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated"

/**
 * TODOS
 * - organize files
 * - to not render more than 2 swiped cards
 */

type SwiperProps = {
  cards: InfiniteDiscoveryArtwork[]
  onNewCardReached?: (key: Key) => void
  onRewind: (key: Key) => void
  onSwipe: (swipedKey: Key, nextKey: Key) => void
  containerStyle?: ViewStyle
  cardStyle?: ViewStyle
  isArtworkSaved?: (index: number) => boolean
} & (
  | { onTrigger?: never; swipedIndexCallsOnTrigger?: never }
  | { onTrigger: (activeIndex: number) => void; swipedIndexCallsOnTrigger: number }
)

export type SwiperRefProps = {
  swipeLeftThenRight: (duration: number) => void
}

export const Swiper = forwardRef<SwiperRefProps, SwiperProps>(
  (
    {
      cards: _cards,
      onNewCardReached,
      onRewind,
      onSwipe,
      onTrigger,
      swipedIndexCallsOnTrigger,
      containerStyle,
      cardStyle,
      isArtworkSaved,
    },
    ref
  ) => {
    const width = useScreenWidthWithOffset()
    const activeCardX = useSharedValue(0)
    const [cards, setCards] = useState(_cards)
    const swipedCardX = useSharedValue(-width)
    // TODO: remove underscore
    const _activeIndex = useSharedValue(0)
    const [activeIndex, setActiveIndex] = useState(_activeIndex.value)

    const swipedKeys = useSharedValue<Key[]>([])

    // a list of cards that the user has seen
    const seenCardKeys = useSharedValue<Key[]>([])

    // update the activeIndex state given changes on _activeIndex shared value
    useAnimatedReaction(
      () => _activeIndex.value,
      (current, previous) => {
        if (current !== previous) {
          runOnJS(setActiveIndex)(current)
        }
      }
    )

    useImperativeHandle(ref, () => ({ swipeLeftThenRight }))

    useEffect(() => {
      if (cards.length < _cards.length) {
        setCards(_cards)
      }
    }, [_cards.length])

    const swipeLeftThenRight = (duration: number) => {
      const swipedCardIndex = _activeIndex.value
      const swipedCardKey = cards[swipedCardIndex]?.internalID

      if (swipedCardKey) {
        activeCardX.value = withSequence(
          withTiming(-width / 3, {
            duration: duration / 2,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),

          withDelay(
            300,
            withTiming(0, { duration: duration / 2, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
          )
        )
      }
    }

    const pan = Gesture.Pan()
      .onChange(({ translationX }) => {
        // when swipe to the right
        if (translationX > 0) {
          swipedCardX.value = interpolate(
            translationX,
            [0, width],
            [-width, 0],
            Extrapolation.CLAMP
          )
        } else {
          activeCardX.value = translationX
        }
      })
      .onFinalize(({ translationX }) => {
        const swipeOverThreshold = Math.abs(translationX) > SWIPE_THRESHOLD

        if (!swipeOverThreshold) {
          activeCardX.value = withTiming(0)
          swipedCardX.value = withTiming(-width)
          return
        }

        // Swipe left
        const isSwipeLeft = translationX < 0
        const isLastCard = _activeIndex.value === cards.length - 1

        // Fetching more cards on the 3rd, 8th, 13th... swipe
        if (
          isSwipeLeft &&
          !isLastCard &&
          cards.length - 1 - _activeIndex.value === swipedIndexCallsOnTrigger
        ) {
          runOnJS(onTrigger)(_activeIndex.value + 1)
        }

        const swipedCardIndex = _activeIndex.value
        const swipedCardKey = cards[swipedCardIndex].internalID

        if (isSwipeLeft && !isLastCard && swipedCardKey) {
          const nextCardIndex = swipedCardIndex + 1
          const nextCardKey = cards[nextCardIndex]?.internalID as Key

          // if this is the first time that the user has navigated to this card, record it
          if (nextCardKey && !seenCardKeys.value.includes(nextCardKey) && onNewCardReached) {
            seenCardKeys.value = [...seenCardKeys.value, nextCardKey]
            runOnJS(onNewCardReached)(nextCardKey)
          }

          activeCardX.value = withTiming(-width, { duration: 300, easing: Easing.linear }, () => {
            swipedKeys.value = [...swipedKeys.value, swipedCardKey]
            _activeIndex.value = _activeIndex.value + 1
            activeCardX.value = 0
            return
          })

          runOnJS(onSwipe)(swipedCardKey, nextCardKey)
          return
        }

        // when it's the last card drag it back to the deck nicely
        if (isSwipeLeft && isLastCard) {
          activeCardX.value = withTiming(0, { duration: 200, easing: Easing.cubic })
          return
        }

        // Swipe right then brings the card back to the deck
        activeCardX.value = 0
        const hasSwipedCards = _activeIndex.value > 0

        let lastSwipedCardKey = null

        // TODO: clean up this minefield of if-statements
        if (hasSwipedCards) {
          lastSwipedCardKey = cards[_activeIndex.value - 1].internalID
        }
        swipedCardX.value = withTiming(
          0,
          { duration: 400, easing: Easing.out(Easing.cubic) },
          () => {
            if (hasSwipedCards) {
              swipedKeys.value = swipedKeys.value.slice(0, -1)
              _activeIndex.value = _activeIndex.value - 1
            }
            swipedCardX.value = -width
          }
        )

        if (!!lastSwipedCardKey) {
          runOnJS(onRewind)(lastSwipedCardKey as Key)
        }
      })

    return (
      <GestureDetector gesture={pan}>
        <View style={containerStyle}>
          {cards.map((c, i) => {
            return (
              <AnimatedView
                index={i}
                activeCardX={activeCardX}
                activeIndex={_activeIndex}
                swipedKeys={swipedKeys}
                swipedCardX={swipedCardX}
                key={c.internalID}
                internalID={c.internalID}
              >
                <InfiniteDiscoveryArtworkCard
                  artwork={c}
                  key={c.internalID}
                  containerStyle={cardStyle}
                  isSaved={isArtworkSaved ? isArtworkSaved(i) : undefined}
                  index={i}
                  isTopCard={activeIndex === i}
                />
              </AnimatedView>
            )
          })}
        </View>
      </GestureDetector>
    )
  }
)

const SWIPE_THRESHOLD = 30
