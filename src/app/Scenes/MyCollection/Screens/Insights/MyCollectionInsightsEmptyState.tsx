import { Box, Button, Tabs, useSpace } from "@artsy/palette-mobile"
import { ZeroState } from "app/Components/States/ZeroState"
import { Tab } from "app/Scenes/MyProfile/MyProfileHeaderMyCollectionAndSavedWorks"
import { navigate } from "app/system/navigation/navigate"
import { Image } from "react-native"

export const MyCollectionInsightsEmptyState = () => {
  const space = useSpace()

  return (
    <Tabs.ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <Box mt={4}>
        <ZeroState
          bigTitle="Gain Deeper Knowledge of your Collection"
          subtitle="Get free market insights about the artists you collect."
          image={
            <Image
              source={require("images/my-collection-insights-empty-state-median.webp")}
              resizeMode="contain"
              style={{ alignSelf: "center", marginVertical: space(2) }}
            />
          }
          callToAction={
            <>
              <Button
                block
                onPress={() => {
                  navigate("my-collection/artworks/new", {
                    passProps: { source: Tab.insights },
                  })
                }}
              >
                Upload Artwork
              </Button>
            </>
          }
        />
      </Box>
    </Tabs.ScrollView>
  )
}
