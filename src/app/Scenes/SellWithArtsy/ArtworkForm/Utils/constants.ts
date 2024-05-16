import { SubmitArtworkStackNavigation } from "app/Scenes/SellWithArtsy/ArtworkForm/SubmitArtworkForm"

export type SubmitArtworkScreen = keyof SubmitArtworkStackNavigation

export const ARTWORK_FORM_STEPS: SubmitArtworkScreen[] = [
  "StartFlow",
  "SelectArtworkMyCollectionArtwork",
  "SelectArtist",
  "AddTitle",
  "AddPhotos",
  "AddDetails",
  "AddDimensions",
  "AddProvenance",
  "CompleteYourSubmission",
]
