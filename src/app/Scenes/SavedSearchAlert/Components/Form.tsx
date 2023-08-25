import {
  ArrowRightIcon,
  Box,
  Button,
  Flex,
  Pill,
  Spacer,
  Text,
  Touchable,
} from "@artsy/palette-mobile"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { SearchCriteria } from "app/Components/ArtworkFilter/SavedSearch/types"
import { Input, InputTitle } from "app/Components/Input"
import { SavedSearchNameInputQueryRenderer } from "app/Scenes/SavedSearchAlert/Components/SavedSearchNameInput"
import {
  CreateSavedSearchAlertNavigationStack,
  SavedSearchAlertFormValues,
  SavedSearchPill,
} from "app/Scenes/SavedSearchAlert/SavedSearchAlertModel"
import { SavedSearchStore } from "app/Scenes/SavedSearchAlert/SavedSearchStore"
import { navigate } from "app/system/navigation/navigate"
import { useFeatureFlag } from "app/utils/hooks/useFeatureFlag"
import { useFormikContext } from "formik"
import { SavedSearchAlertSwitch } from "./SavedSearchAlertSwitch"

interface FormProps {
  pills: SavedSearchPill[]
  savedSearchAlertId?: string
  isLoading?: boolean
  hasChangedFilters?: boolean
  shouldShowEmailWarning?: boolean
  onDeletePress?: () => void
  onSubmitPress?: () => void
  onUpdateEmailPreferencesPress?: () => void
  onTogglePushNotification: (enabled: boolean) => void
  onToggleEmailNotification: (enabled: boolean) => void
  onRemovePill: (pill: SavedSearchPill) => void
}

export const Form: React.FC<FormProps> = ({
  pills,
  savedSearchAlertId,
  isLoading,
  hasChangedFilters,
  shouldShowEmailWarning,
  onDeletePress,
  onSubmitPress,
  onUpdateEmailPreferencesPress,
  onTogglePushNotification,
  onToggleEmailNotification,
  onRemovePill,
}) => {
  const isFallbackToGeneratedAlertNamesEnabled = useFeatureFlag(
    "AREnableFallbackToGeneratedAlertNames"
  )

  const attributes = SavedSearchStore.useStoreState((state) => state.attributes)
  const entity = SavedSearchStore.useStoreState((state) => state.entity)
  const { isSubmitting, values, errors, dirty, handleBlur, handleChange } =
    useFormikContext<SavedSearchAlertFormValues>()
  const navigation =
    useNavigation<NavigationProp<CreateSavedSearchAlertNavigationStack, "CreateSavedSearchAlert">>()

  const isEditMode = !!savedSearchAlertId
  let isSaveAlertButtonDisabled = false
  const priceControlEnabled = useFeatureFlag("AREnablePriceControlForCreateAlertFlow")

  // Data has not changed
  if (isEditMode && !dirty) {
    isSaveAlertButtonDisabled = true
  }

  // If the saved search alert doesn't have a name, a user can click the save button without any changes.
  // This situation is possible if a user created an alert in Saved Search V1,
  // since we didn't have the opportunity to specify custom name for the alert
  if (isEditMode && !dirty && values.name.length === 0) {
    isSaveAlertButtonDisabled = false
  }

  // Enable "Save Alert" button if the user has removed the filters or changed data
  if (hasChangedFilters || dirty) {
    isSaveAlertButtonDisabled = false
  }

  // Disable button if notification toggles were not enabled
  if (!values.push && !values.email) {
    isSaveAlertButtonDisabled = true
  }

  const handleUpdateEmailPreferencesPress = () => {
    if (onUpdateEmailPreferencesPress) {
      return onUpdateEmailPreferencesPress()
    }

    return navigate("/unsubscribe", {
      passProps: {
        backProps: {
          previousScreen: "Unsubscribe",
        },
      },
    })
  }

  const isArtistPill = (pill: SavedSearchPill) => pill.paramName === SearchCriteria.artistID

  return (
    <Box>
      {!isEditMode && (
        <Text variant="lg-display" mb={4}>
          Create Alert
        </Text>
      )}

      <Box mb={2}>
        {isFallbackToGeneratedAlertNamesEnabled ? (
          <SavedSearchNameInputQueryRenderer attributes={attributes} />
        ) : (
          <Input
            title="Name"
            placeholder={entity.artists[0]?.name}
            value={values.name}
            onChangeText={handleChange("name")}
            onBlur={handleBlur("name")}
            error={errors.name}
            testID="alert-input-name"
            maxLength={75}
          />
        )}
      </Box>
      <Box mb={2}>
        <InputTitle>Filters</InputTitle>
        <Flex flexDirection="row" flexWrap="wrap" mt={1} mx={-0.5}>
          {pills.map((pill, index) => (
            <Pill
              testID="alert-pill"
              m={0.5}
              variant="filter"
              disabled={isArtistPill(pill)}
              key={`filter-label-${index}`}
              onPress={() => onRemovePill(pill)}
            >
              {pill.label}
            </Pill>
          ))}
        </Flex>
      </Box>
      {!!priceControlEnabled && (
        <>
          <Spacer y={2} />
          <Touchable
            accessibilityLabel="Set price range"
            accessibilityRole="button"
            onPress={() => navigation.navigate("AlertPriceRange")}
          >
            <Flex flexDirection="row" alignItems="center" py={1}>
              <Flex flex={1}>
                <Text variant="sm-display">Set price range you are interested in</Text>
              </Flex>
              <Flex alignSelf="center" mt={0.5}>
                <ArrowRightIcon />
              </Flex>
            </Flex>
          </Touchable>
          <Spacer y={4} />
        </>
      )}
      <SavedSearchAlertSwitch
        label="Mobile Alerts"
        onChange={onTogglePushNotification}
        active={values.push}
      />
      <Spacer y={2} />
      <SavedSearchAlertSwitch
        label="Email Alerts"
        onChange={onToggleEmailNotification}
        active={values.email}
      />
      {!!shouldShowEmailWarning && (
        <Box backgroundColor="orange10" my={1} p={2}>
          <Text variant="xs" color="orange150">
            Change your email preferences
          </Text>
          <Text variant="xs" mt={0.5}>
            To receive Email Alerts, please update your email preferences.
          </Text>
        </Box>
      )}
      {!!values.email && (
        <Text
          onPress={handleUpdateEmailPreferencesPress}
          variant="xs"
          color="black60"
          style={{ textDecorationLine: "underline" }}
          mt={1}
        >
          Update email preferences
        </Text>
      )}
      <Box mt={6}>
        <Button
          testID="save-alert-button"
          disabled={isSaveAlertButtonDisabled}
          loading={isSubmitting || isLoading}
          size="large"
          block
          onPress={onSubmitPress}
        >
          Save Alert
        </Button>
        {!!isEditMode && (
          <>
            <Spacer y={2} />
            <Button
              testID="delete-alert-button"
              variant="outline"
              size="large"
              block
              onPress={onDeletePress}
            >
              Delete Alert
            </Button>
          </>
        )}
        {!isEditMode && (
          <Text variant="sm" color="black60" textAlign="center" my={2}>
            Access all your saved alerts in your profile.
          </Text>
        )}
      </Box>
    </Box>
  )
}
