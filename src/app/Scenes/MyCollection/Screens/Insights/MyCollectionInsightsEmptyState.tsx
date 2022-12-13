import { ZeroState } from "app/Components/States/ZeroState"
import { navigate, popToRoot } from "app/navigation/navigate"
import { Tab } from "app/Scenes/MyProfile/MyProfileHeaderMyCollectionAndSavedWorks"
import { Button, useSpace } from "palette"
import { Image } from "react-native"

export const MyCollectionInsightsEmptyState = () => {
  const space = useSpace()

  return (
    <ZeroState
      bigTitle="Gain Deeper Knowledge of your Collection"
      subtitle="Get free market insights about the artists you collect."
      image={
        <Image
          source={require("images/my-collection-insights-empty-state-median.png")}
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
                passProps: { mode: "add", source: Tab.insights, onSuccess: popToRoot },
              })
            }}
          >
            Upload Artwork
          </Button>
        </>
      }
    />
  )
}
