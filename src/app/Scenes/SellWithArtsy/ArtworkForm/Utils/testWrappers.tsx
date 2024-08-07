import { SubmitArtworkBottomNavigation } from "app/Scenes/SellWithArtsy/ArtworkForm/Components/SubmitArtworkBottomNavigation"
import {
  SubmitArtworkFormStore,
  SubmitArtworkFormStoreModelState,
  SubmitArtworkFormStoreProvider,
} from "app/Scenes/SellWithArtsy/ArtworkForm/Components/SubmitArtworkFormStore"
import {
  SubmissionModel,
  submissionModelInitialValues,
  getCurrentValidationSchema,
} from "app/Scenes/SellWithArtsy/ArtworkForm/Utils/validation"
import { renderWithWrappers } from "app/utils/tests/renderWithWrappers"
import { setupTestWrapper } from "app/utils/tests/setupTestWrapper"
import { FormikProvider, useFormik } from "formik"

const FormikWrapper: React.FC<{
  injectedProps?: Partial<SubmissionModel>
}> = ({ children, injectedProps }) => {
  const initialValues = {
    ...submissionModelInitialValues,
    ...injectedProps,
  } as any

  const { currentStep } = SubmitArtworkFormStore.useStoreState((state) => state)

  const handleSubmit = () => {
    // Implement when needed
  }
  const validationSchema = getCurrentValidationSchema(currentStep)

  const formik = useFormik<SubmissionModel>({
    enableReinitialize: true,
    initialValues: initialValues,
    onSubmit: handleSubmit,
    validationSchema,
  })

  return <FormikProvider value={formik}>{children}</FormikProvider>
}

export const renderWithSubmitArtworkWrapper = ({
  component,
  props,
  injectedFormikProps,
  includeBottomNavigation = true,
}: {
  component: React.ReactElement
  props?: Partial<SubmitArtworkFormStoreModelState>
  injectedFormikProps?: Partial<SubmissionModel>
  includeBottomNavigation?: boolean
}) => {
  return renderWithWrappers(
    <SubmitArtworkFormStoreProvider runtimeModel={props}>
      <FormikWrapper injectedProps={injectedFormikProps}>
        {component}
        {!!includeBottomNavigation && <SubmitArtworkBottomNavigation />}
      </FormikWrapper>
    </SubmitArtworkFormStoreProvider>
  )
}

export const setupWithSubmitArtworkTestWrappers = ({
  Component,
  props,
  injectedFormikProps,
}: {
  Component: React.ReactElement
  props?: Partial<SubmitArtworkFormStoreModelState>
  injectedFormikProps?: Partial<SubmissionModel>
}) => {
  return setupTestWrapper({
    Component: () => (
      <SubmitArtworkFormStoreProvider runtimeModel={props}>
        <FormikWrapper injectedProps={injectedFormikProps}>{Component}</FormikWrapper>
      </SubmitArtworkFormStoreProvider>
    ),
  })
}
