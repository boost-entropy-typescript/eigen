import {
  Box,
  BulletedItem,
  Flex,
  Input,
  InputTitle,
  RadioButton,
  Spacer,
  Text,
} from "@artsy/palette-mobile"
import { ArtistAutosuggest } from "app/Components/ArtistAutosuggest/ArtistAutosuggest"
import { LinkButton } from "app/Components/Button/LinkButton"
import { LocationAutocomplete, buildLocationDisplay } from "app/Components/LocationAutocomplete"
import { Select, SelectOption } from "app/Components/Select"
import { CategoryPicker } from "app/Scenes/MyCollection/Screens/ArtworkForm/Components/CategoryPicker"
import { GlobalStore } from "app/store/GlobalStore"
import { artworkRarityClassifications } from "app/utils/artworkRarityClassifications"
import { LocationWithDetails } from "app/utils/googleMaps"
import { useFeatureFlag } from "app/utils/hooks/useFeatureFlag"
import { useFormikContext } from "formik"
import React, { useEffect, useRef, useState } from "react"
import { InfoModal } from "./InfoModal/InfoModal"
import {
  AcceptableCategoryValue,
  acceptableCategoriesForSubmission,
} from "./utils/acceptableCategoriesForSubmission"
import { limitedEditionValue, rarityOptions } from "./utils/rarityOptions"
import { ArtworkDetailsFormModel } from "./validation"

const StandardSpace = () => <Spacer y={2} />

export const ArtworkDetailsForm: React.FC = () => {
  const { values, setFieldValue, handleChange, errors, validateField } =
    useFormikContext<ArtworkDetailsFormModel>()
  const [isRarityInfoModalVisible, setIsRarityInfoModalVisible] = useState(false)
  const [isProvenanceInfoModalVisible, setIsProvenanceInfoModalVisible] = useState(false)
  const optionalDimensions = useFeatureFlag("ARSWAMakeAllDimensionsOptional")

  useEffect(() => {
    if (values) {
      GlobalStore.actions.artworkSubmission.submission.setDirtyArtworkDetailsValues(values)
    }
  }, [values])

  const categories = useRef<Array<SelectOption<AcceptableCategoryValue>>>(
    acceptableCategoriesForSubmission()
  ).current

  return (
    <>
      <ArtistAutosuggest />

      <Input
        title="Title"
        placeholder="Add title or write 'Unknown'"
        testID="Submission_TitleInput"
        value={values.title}
        onChangeText={(text) => {
          handleChange("title")(text)
        }}
        onBlur={() => validateField("title")}
        accessibilityLabel="Title"
        required
        error={errors.title}
      />

      <StandardSpace />

      <CategoryPicker<AcceptableCategoryValue>
        handleChange={(category) => {
          setFieldValue("category", category)
        }}
        options={categories}
        required
        value={values.category}
        error={errors.category ? "Medium is a required field" : undefined}
        onModalFinishedClosing={() => validateField("category")}
      />

      <Input
        title="Year"
        placeholder="YYYY"
        keyboardType="number-pad"
        testID="Submission_YearInput"
        value={values.year}
        onChangeText={(e) => setFieldValue("year", e)}
        accessibilityLabel="Year"
      />
      <StandardSpace />

      <Input
        title="Materials"
        placeholder={[
          "Oil on canvas, mixed media, lithograph, etc.",
          "Oil on canvas, mixed media, etc.",
          "Oil on canvas, etc.",
        ]}
        testID="Submission_MaterialsInput"
        value={values.medium}
        onChangeText={(e) => setFieldValue("medium", e)}
        accessibilityLabel="Materials"
      />
      <StandardSpace />
      <Select
        onSelectValue={(e) => setFieldValue("attributionClass", e)}
        onTooltipPress={() => setIsRarityInfoModalVisible(true)}
        value={values.attributionClass}
        enableSearch={false}
        title="Rarity"
        tooltipText={
          <LinkButton
            variant="xs"
            color="black60"
            onPress={() => setIsRarityInfoModalVisible(true)}
          >
            What's this?
          </LinkButton>
        }
        placeholder="Select a classification"
        options={rarityOptions}
        testID="Submission_RaritySelect"
      />
      <InfoModal
        title="Classifications"
        visible={isRarityInfoModalVisible}
        onDismiss={() => setIsRarityInfoModalVisible(false)}
      >
        {artworkRarityClassifications.map((classification) => (
          <Flex mb={2} key={classification.label}>
            <InputTitle>{classification.label}</InputTitle>
            <Text>{classification.description}</Text>
          </Flex>
        ))}
      </InfoModal>
      {values.attributionClass === limitedEditionValue && (
        <>
          <Spacer y={2} />
          <Flex flexDirection="row" justifyContent="space-between">
            <Box width="48%" mr={1}>
              <Input
                title="Edition Number"
                testID="Submission_EditionNumberInput"
                value={values.editionNumber}
                onChangeText={(e) => setFieldValue("editionNumber", e)}
                accessibilityLabel="Edition Number"
              />
            </Box>
            <Box width="48%">
              <Input
                title="Edition Size"
                testID="Submission_EditionSizeInput"
                value={values.editionSizeFormatted}
                onChangeText={(e) => setFieldValue("editionSizeFormatted", e)}
                accessibilityLabel="Edition Size"
              />
            </Box>
          </Flex>
        </>
      )}
      <StandardSpace />
      <InputTitle>Dimensions</InputTitle>
      <Spacer y={1} />
      <Flex flexDirection="row">
        <RadioButton
          mr={2}
          text="in"
          selected={values.dimensionsMetric === "in"}
          onPress={() => setFieldValue("dimensionsMetric", "in")}
        />
        <RadioButton
          text="cm"
          selected={values.dimensionsMetric === "cm"}
          onPress={() => setFieldValue("dimensionsMetric", "cm")}
        />
      </Flex>

      <Flex flexDirection="row" justifyContent="space-between">
        <Box width="31%" mr={1}>
          <Input
            title={`Height (${values.dimensionsMetric})`}
            keyboardType="decimal-pad"
            testID="Submission_HeightInput"
            value={values.height}
            onChangeText={(e) => setFieldValue("height", e)}
            accessibilityLabel="Height"
            required={!optionalDimensions}
          />
        </Box>
        <Box width="31%" mr={1}>
          <Input
            title={`Width (${values.dimensionsMetric})`}
            keyboardType="decimal-pad"
            testID="Submission_WidthInput"
            value={values.width}
            onChangeText={(e) => setFieldValue("width", e)}
            accessibilityLabel="Width"
            required={!optionalDimensions}
          />
        </Box>
        <Box width="31%">
          <Input
            title={`Depth (${values.dimensionsMetric})`}
            keyboardType="decimal-pad"
            testID="Submission_DepthInput"
            value={values.depth}
            onChangeText={(e) => setFieldValue("depth", e)}
            accessibilityLabel="Depth"
          />
        </Box>
      </Flex>
      <StandardSpace />

      <Input
        title="Provenance"
        onHintPress={() => setIsProvenanceInfoModalVisible(true)}
        placeholder="Describe how you acquired the artwork"
        testID="Submission_ProvenanceInput"
        value={values.provenance}
        onChangeText={(e) => setFieldValue("provenance", e)}
        multiline
      />
      <InfoModal
        title="Artwork Provenance"
        visible={isProvenanceInfoModalVisible}
        onDismiss={() => setIsProvenanceInfoModalVisible(false)}
      >
        <Flex mb={4}>
          <Text>
            Provenance is the documented history of an artwork’s ownership and authenticity. Please
            list any documentation you have that proves your artwork’s provenance, such as:
          </Text>
        </Flex>

        <Flex flexDirection="column">
          <BulletedItem color="black">Invoices from previous owners</BulletedItem>
          <BulletedItem color="black">Certificates of authenticity</BulletedItem>
          <BulletedItem color="black">Gallery exhibition catalogues</BulletedItem>
        </Flex>
      </InfoModal>
      <StandardSpace />
      <LocationAutocomplete
        showError
        title="City"
        placeholder="Enter city where artwork is located"
        displayLocation={buildLocationDisplay(values.location)}
        onChange={({ city, state, country, countryCode }: LocationWithDetails) => {
          setFieldValue("location", {
            city: city ?? "",
            state: state ?? "",
            country: country ?? "",
            countryCode: countryCode ?? "",
          })
        }}
      />
      <StandardSpace />
    </>
  )
}
