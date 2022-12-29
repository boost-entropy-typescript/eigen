import { buildLocationDisplay, LocationAutocomplete } from "app/Components/LocationAutocomplete"
import { CategoryPicker } from "app/Scenes/MyCollection/Screens/ArtworkForm/Components/CategoryPicker"
import { GlobalStore } from "app/store/GlobalStore"
import { artworkRarityClassifications } from "app/utils/artworkRarityClassifications"
import { LocationWithDetails } from "app/utils/googleMaps"
import { useFormikContext } from "formik"
import {
  Box,
  BulletedItem,
  Flex,
  Input,
  InputTitle,
  LinkButton,
  RadioButton,
  Spacer,
  Text,
} from "palette"
import { Select, SelectOption } from "palette/elements/Select"
import React, { useEffect, useRef, useState } from "react"
import { ArtistAutosuggest } from "../../../../Components/ArtistAutosuggest/ArtistAutosuggest"
import { InfoModal } from "./InfoModal/InfoModal"
import {
  acceptableCategoriesForSubmission,
  AcceptableCategoryValue,
} from "./utils/acceptableCategoriesForSubmission"
import { limitedEditionValue, rarityOptions } from "./utils/rarityOptions"
import { ArtworkDetailsFormModel } from "./validation"

const StandardSpace = () => <Spacer mt={4} />

export const ArtworkDetailsForm: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<ArtworkDetailsFormModel>()
  const [isRarityInfoModalVisible, setIsRarityInfoModalVisible] = useState(false)
  const [isProvenanceInfoModalVisible, setIsProvenanceInfoModalVisible] = useState(false)

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
      <StandardSpace />
      <Input
        title="Title"
        placeholder="Add title or write 'Unknown'"
        testID="Submission_TitleInput"
        value={values.title}
        onChangeText={(e) => setFieldValue("title", e)}
        accessibilityLabel="Title"
      />
      <StandardSpace />
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
      <CategoryPicker<AcceptableCategoryValue | null>
        handleChange={(category) => setFieldValue("category", category)}
        options={categories}
        required={false}
        value={values.category}
      />
      <StandardSpace />
      <Input
        title="Materials"
        placeholder="Oil on canvas, mixed media, lithograph.."
        testID="Submission_MaterialsInput"
        value={values.medium}
        onChangeText={(e) => setFieldValue("medium", e)}
        accessibilityLabel="Materials"
      />
      <StandardSpace />
      <Select
        onSelectValue={(e) => setFieldValue("attributionClass", e)}
        value={values.attributionClass}
        enableSearch={false}
        title="Rarity"
        tooltipText={
          <LinkButton
            variant="xs"
            color="black60"
            onPress={() => setIsRarityInfoModalVisible(true)}
          >
            What is this?
          </LinkButton>
        }
        placeholder="Select a classification"
        options={rarityOptions}
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
          <Spacer mt={2} />
          <Flex flexDirection="row" justifyContent="space-between">
            <Box width="48%" mr={1}>
              <Input
                title="Edition Number"
                keyboardType="decimal-pad"
                testID="Submission_EditionNumberInput"
                value={values.editionNumber}
                onChangeText={(e) => setFieldValue("editionNumber", e)}
                accessibilityLabel="Edition Number"
              />
            </Box>
            <Box width="48%">
              <Input
                title="Edition Size"
                keyboardType="decimal-pad"
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
      <Spacer mt={1} />
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
      <Spacer mt={2} />
      <Flex flexDirection="row" justifyContent="space-between">
        <Box width="31%" mr={1}>
          <Input
            title="Height"
            keyboardType="decimal-pad"
            testID="Submission_HeightInput"
            value={values.height}
            onChangeText={(e) => setFieldValue("height", e)}
            accessibilityLabel="Height"
          />
        </Box>
        <Box width="31%" mr={1}>
          <Input
            title="Width"
            keyboardType="decimal-pad"
            testID="Submission_WidthInput"
            value={values.width}
            onChangeText={(e) => setFieldValue("width", e)}
            accessibilityLabel="Width"
          />
        </Box>
        <Box width="31%">
          <Input
            title="Depth"
            keyboardType="decimal-pad"
            testID="Submission_DepthInput"
            value={values.depth}
            onChangeText={(e) => setFieldValue("depth", e)}
            accessibilityLabel="Depth"
          />
        </Box>
      </Flex>
      <StandardSpace />
      <Flex flexDirection="row" justifyContent="space-between">
        <InputTitle>Provenance</InputTitle>
        <LinkButton
          variant="xs"
          color="black60"
          onPress={() => setIsProvenanceInfoModalVisible(true)}
        >
          What is this?
        </LinkButton>
      </Flex>
      <Input
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
