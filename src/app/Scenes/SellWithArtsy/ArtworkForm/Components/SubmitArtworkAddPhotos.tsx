import { Flex, Join, Message, Spacer, Text } from "@artsy/palette-mobile"
import { ArtworkDetailsFormModel } from "app/Scenes/SellWithArtsy/ArtworkForm/Utils/validation"
import { UploadPhotosForm } from "app/Scenes/SellWithArtsy/SubmitArtwork/UploadPhotos/UploadPhotosForm"
import { useFormikContext } from "formik"
import { ScrollView } from "react-native"

export const SubmitArtworkAddPhotos = () => {
  const { values } = useFormikContext<ArtworkDetailsFormModel>()

  return (
    <Flex px={2}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <Join separator={<Spacer y={2} />}>
          <Text variant="lg-display">Upload photos of your artwork</Text>

          <Text color="black60" variant="xs">
            Make your work stand out and get your submission evaluated faster by uploading
            high-quality photos of the work's front and back.
          </Text>

          {(values.photos.length === 1 || values.photos.length === 2) && (
            <Message
              title="Increase your chance of selling"
              text="Make sure to include images of the back, corners, frame and any other details if you can. "
              variant="success"
            />
          )}

          <UploadPhotosForm />
        </Join>
      </ScrollView>
    </Flex>
  )
}
