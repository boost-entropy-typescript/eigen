import { Checkbox, Flex, Input, Join, Spacer, Text } from "@artsy/palette-mobile"
import { SelectOption } from "app/Components/Select"
import { CategoryPicker } from "app/Scenes/MyCollection/Screens/ArtworkForm/Components/CategoryPicker"
import { ArtworkDetailsFormModel } from "app/Scenes/SellWithArtsy/ArtworkForm/Utils/validation"
import {
  AcceptableCategoryValue,
  acceptableCategoriesForSubmission,
} from "app/Scenes/SellWithArtsy/SubmitArtwork/ArtworkDetails/utils/acceptableCategoriesForSubmission"
import { useFormikContext } from "formik"
import { useRef, useState } from "react"
import { ScrollView } from "react-native"

export const SubmitArtworkAddDetails = () => {
  const [isYearUnknown, setIsYearUnknown] = useState(false)
  const [oldTypedYear, setOldTypedYear] = useState("")

  const { handleChange, setFieldValue, values } = useFormikContext<ArtworkDetailsFormModel>()

  const categories = useRef<Array<SelectOption<AcceptableCategoryValue>>>(
    acceptableCategoriesForSubmission()
  ).current

  return (
    <ScrollView>
      <Text variant="lg" mb={2}>
        Artwork details
      </Text>

      <Join separator={<Spacer y={2} />}>
        <Flex>
          <Input
            title="Year"
            placeholder="YYYY"
            keyboardType="number-pad"
            testID="Submission_YearInput"
            value={values.year}
            onChangeText={(e) => setFieldValue("year", e)}
            accessibilityLabel="Year"
            disabled={isYearUnknown}
            style={{ width: "50%" }}
          />
          <Spacer y={2} />

          <Checkbox
            checked={isYearUnknown}
            onPress={() => {
              // Save the old typed year to restore it if the user unchecks the checkbox
              if (!isYearUnknown) {
                setOldTypedYear(values.year)
                setIsYearUnknown(true)
                setFieldValue("year", "")
              } else {
                setFieldValue("year", oldTypedYear)
                setIsYearUnknown(false)
              }
            }}
            text="I don't know"
          />
        </Flex>

        <CategoryPicker<AcceptableCategoryValue | null>
          handleChange={(category) => setFieldValue("category", category)}
          options={categories}
          required
          value={values.category}
        />

        <Input
          title="Materials"
          placeholder={[
            "Oil on canvas, mixed media, lithograph, etc.",
            "Oil on canvas, mixed media, etc.",
            "Oil on canvas, etc.",
          ]}
          testID="Submission_MaterialsInput"
          value={values.medium}
          onChangeText={handleChange("medium")}
          accessibilityLabel="Materials"
        />
      </Join>
    </ScrollView>
  )
}