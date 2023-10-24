import { ActionType, ContextModule, OwnerType } from "@artsy/cohesion"
import {
  ArrowRightIcon,
  Box,
  Button,
  Flex,
  Join,
  Pill,
  Spacer,
  Text,
  Touchable,
} from "@artsy/palette-mobile"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import { SearchCriteria } from "app/Components/ArtworkFilter/SavedSearch/types"
import { InfoButton } from "app/Components/Buttons/InfoButton"
import { Input, InputTitle } from "app/Components/Input"
import { MenuItem } from "app/Components/MenuItem"
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
import { useTracking } from "react-tracking"
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
  const enableAlertsFilters = useFeatureFlag("AREnableAlertsFilters")
  const enableDetailsInput = useFeatureFlag("AREnableAlertDetailsInput")

  const tracking = useTracking()

  const attributes = SavedSearchStore.useStoreState((state) => state.attributes)
  const { isSubmitting, values, errors, dirty, handleBlur, handleChange } =
    useFormikContext<SavedSearchAlertFormValues>()
  const navigation =
    useNavigation<NavigationProp<CreateSavedSearchAlertNavigationStack, "CreateSavedSearchAlert">>()

  const isEditMode = !!savedSearchAlertId
  let isSaveAlertButtonDisabled = false

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
        <InfoButton
          titleElement={
            <Text variant="lg-display" mb={1} mr={0.5}>
              Create Alert
            </Text>
          }
          trackEvent={() => {
            tracking.trackEvent(tracks.tappedCreateAlertHeaderButton())
          }}
          maxModalHeight={300}
          modalTitle="Create Alert"
          modalContent={
            <Flex py={1}>
              <Text>
                On the hunt for a particular work? Create an alert and we’ll let you know when
                matching works are added to Artsy.
              </Text>
            </Flex>
          }
        />
      )}

      <Join separator={<Spacer y={2} />}>
        <Box>
          <SavedSearchNameInputQueryRenderer attributes={attributes} />

          <Box mt={2}>
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
        </Box>

        {!!enableAlertsFilters ? (
          <Flex mt={2}>
            <MenuItem
              title="Add Filters"
              description="Including Price Range, Rarity, Medium, Size, Color"
              onPress={() => {
                navigation.navigate("SavedSearchFilterScreen")
              }}
              px={0}
            />
          </Flex>
        ) : null}

        {/* Price range is part of the new filters screen, no need to show it here anymore */}
        {!enableAlertsFilters && (
          <Flex my={1}>
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
          </Flex>
        )}

        {!!enableDetailsInput && (
          <Flex>
            <Text>Tell us more about what you’re looking for</Text>
            <Spacer y={1} />
            <Input
              placeholder="For example, a specific request such as ‘figurative painting’ or ‘David Hockney iPad drawings.’"
              value={values.details}
              onChangeText={handleChange("details")}
              onBlur={handleBlur("details")}
              error={errors.details}
              multiline
              maxLength={700}
              testID="alert-input-details"
            />
          </Flex>
        )}

        <Box>
          <SavedSearchAlertSwitch
            label="Push Notifications"
            onChange={onTogglePushNotification}
            active={values.push}
          />

          <Spacer y={1} />

          <SavedSearchAlertSwitch
            label="Email"
            onChange={onToggleEmailNotification}
            active={values.email}
          />

          {!!shouldShowEmailWarning && (
            <Box backgroundColor="orange10" my={1} p={2}>
              <Text variant="xs" color="orange150">
                Change your email preferences
              </Text>
              <Text variant="xs" mt={0.5}>
                To receive alerts via email, please update your email preferences.
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
        </Box>
      </Join>

      <Spacer y={2} />

      <Box mt={6}>
        <Button
          testID="save-alert-button"
          disabled={isSaveAlertButtonDisabled}
          loading={isSubmitting || isLoading}
          size="large"
          block
          onPress={onSubmitPress}
        >
          {isEditMode ? "Save Alert" : "Create Alert"}
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

const tracks = {
  tappedCreateAlertHeaderButton: () => ({
    action: ActionType.tappedCreateAlertHeader,
    context_module: ContextModule.createAlertHeader,
    context_screen_owner_type: OwnerType.createAlert,
  }),
}
