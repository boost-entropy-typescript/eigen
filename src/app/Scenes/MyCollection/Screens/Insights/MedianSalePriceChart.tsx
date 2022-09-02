import { formatLargeNumber } from "app/utils/formatLargeNumber"
import { Flex, LineGraph, Text } from "palette"
import { useScreenDimensions } from "shared/hooks"
import {
  MedianSalePriceChartDuration,
  useMedianSalePriceChartDataContext,
} from "./providers/MedianSalePriceChartDataContext"

export const MedianSalePriceChart: React.FC = () => {
  const dataContext = useMedianSalePriceChartDataContext()
  if (!dataContext) {
    return null
  }

  const {
    categories,
    threeYearLineChartData,
    eightYearLineChartData,
    bands,
    onBandSelected,
    onDataPointPressed,
    selectedDuration,
    onCategorySelected,
    onXAxisHighlightPressed,
    selectedCategory,
    isDataAvailableForThreeYears,
    isDataAvailableForEightYears,
  } = dataContext

  const { height: screenHeight, width: screenWidth } = useScreenDimensions()

  const CHART_HEIGHT = screenHeight / 2.25
  const CHART_WIDTH = screenWidth

  const dataTagToSubscribeTo = selectedDuration

  const yAxisValueFormatter = (val: number) => {
    const formatted = formatLargeNumber(val, 1)
    if (formatted.length > 4) {
      return formatLargeNumber(val, 0)
    }
    return formatted
  }

  return (
    <Flex paddingBottom={100}>
      {selectedDuration === MedianSalePriceChartDuration["3 yrs"] && (
        <Flex>
          <LineGraph
            dataTag="3 yrs"
            dataTagToSubscribeTo={dataTagToSubscribeTo}
            chartHeight={CHART_HEIGHT}
            chartWidth={CHART_WIDTH}
            chartInterpolation="monotoneX"
            showHighlights
            data={threeYearLineChartData}
            bands={bands}
            onBandSelected={onBandSelected}
            onDataPointPressed={onDataPointPressed}
            selectedBand={selectedDuration}
            categories={categories}
            onCategorySelected={onCategorySelected}
            onXHighlightPressed={onXAxisHighlightPressed}
            selectedCategory={selectedCategory}
            yAxisTickFormatter={
              !threeYearLineChartData.data.length || !isDataAvailableForThreeYears
                ? () => "----"
                : (val: number) => yAxisValueFormatter(val)
            }
            // hide the year on xAxis
            xAxisTickFormatter={() => ""}
          />
          {!threeYearLineChartData.data.length ||
            (!isDataAvailableForThreeYears && (
              <Flex
                position="absolute"
                top={CHART_HEIGHT / 2}
                left={CHART_WIDTH / 3}
                alignItems="center"
                justifyContent="center"
                maxWidth={CHART_WIDTH / 2}
              >
                <Text textAlign="center" variant="sm" color="black60">
                  Incomplete Data for the selected medium
                </Text>
              </Flex>
            ))}
        </Flex>
      )}

      {selectedDuration === MedianSalePriceChartDuration["8 yrs"] && (
        <Flex>
          <LineGraph
            dataTag="8 yrs"
            dataTagToSubscribeTo={dataTagToSubscribeTo}
            chartHeight={CHART_HEIGHT}
            chartWidth={CHART_WIDTH}
            chartInterpolation="monotoneX"
            showHighlights
            data={eightYearLineChartData}
            bands={bands}
            onBandSelected={onBandSelected}
            onDataPointPressed={onDataPointPressed}
            selectedBand={selectedDuration}
            categories={categories}
            onCategorySelected={onCategorySelected}
            onXHighlightPressed={onXAxisHighlightPressed}
            selectedCategory={selectedCategory}
            yAxisTickFormatter={
              !eightYearLineChartData.data.length || !isDataAvailableForEightYears
                ? () => "----"
                : (val: number) => yAxisValueFormatter(val)
            }
            // hide the year on xAxis
            xAxisTickFormatter={() => ""}
          />
          {!eightYearLineChartData.data.length ||
            (!isDataAvailableForEightYears && (
              <Flex
                position="absolute"
                top={CHART_HEIGHT / 2}
                left={CHART_WIDTH / 3}
                alignItems="center"
                justifyContent="center"
                maxWidth={CHART_WIDTH / 2}
              >
                <Text textAlign="center" variant="sm" color="black60">
                  Incomplete Data for the selected medium
                </Text>
              </Flex>
            ))}
        </Flex>
      )}
    </Flex>
  )
}
