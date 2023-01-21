import {
  artworkDetailsEmptyInitialValues,
  ArtworkDetailsFormModel,
} from "app/Scenes/SellWithArtsy/SubmitArtwork/ArtworkDetails/validation"
import {
  Photo,
  photosEmptyInitialValues,
  PhotosFormModel,
} from "app/Scenes/SellWithArtsy/SubmitArtwork/UploadPhotos/validation"
import { Action, action } from "easy-peasy"

interface ConsignmentsSubmissionUtmParams {
  utm_term?: string
  utm_medium?: string
  utm_source?: string
}

export interface ArtworkSubmissionModel {
  submissionId: string
  submissionIdForMyCollection: string
  setSubmissionId: Action<ArtworkSubmissionModel, string>
  artworkDetails: ArtworkDetailsFormModel
  dirtyArtworkDetailsValues: ArtworkDetailsFormModel
  setArtworkDetailsForm: Action<ArtworkSubmissionModel, ArtworkDetailsFormModel>
  setDirtyArtworkDetailsValues: Action<ArtworkSubmissionModel, ArtworkDetailsFormModel>
  initializeArtworkDetailsForm: Action<ArtworkSubmissionModel, Partial<ArtworkDetailsFormModel>>
  initializePhotos: Action<ArtworkSubmissionModel, Photo[]>
  photos: PhotosFormModel
  photosForMyCollection: PhotosFormModel
  setPhotos: Action<ArtworkSubmissionModel, PhotosFormModel>
  setPhotosForMyCollection: Action<ArtworkSubmissionModel, PhotosFormModel>
  setSubmissionIdForMyCollection: Action<ArtworkSubmissionModel, string>
  setUtmParams: Action<ArtworkSubmissionModel, ConsignmentsSubmissionUtmParams>
  resetSessionState: Action<ArtworkSubmissionModel>
}

export interface SubmissionModel {
  submission: ArtworkSubmissionModel
}

export const getSubmissionModel = (): SubmissionModel => ({
  submission: {
    submissionId: "",
    submissionIdForMyCollection: "",
    artworkDetails: artworkDetailsEmptyInitialValues,
    dirtyArtworkDetailsValues: artworkDetailsEmptyInitialValues,
    photos: photosEmptyInitialValues,
    photosForMyCollection: photosEmptyInitialValues,
    setPhotosForMyCollection: action((state, photos) => {
      state.photosForMyCollection = photos
    }),
    setSubmissionIdForMyCollection: action((state, submissionId) => {
      state.submissionIdForMyCollection = submissionId
    }),
    setPhotos: action((state, photos) => {
      state.photos = photos
    }),
    initializePhotos: action((state, photos) => {
      state.photos.initialPhotos = photos
    }),
    setSubmissionId: action((state, id) => {
      state.submissionId = id
    }),
    setArtworkDetailsForm: action((state, form) => {
      state.artworkDetails = form
    }),
    setDirtyArtworkDetailsValues: action((state, form) => {
      state.dirtyArtworkDetailsValues = form
    }),
    initializeArtworkDetailsForm: action((state, form) => {
      state.artworkDetails = { ...state.artworkDetails, ...form }
    }),
    setUtmParams: action((state, params) => {
      state.artworkDetails = {
        ...state.artworkDetails,
        utmMedium: params.utm_medium,
        utmSource: params.utm_source,
        utmTerm: params.utm_term,
      }
    }),
    resetSessionState: action((state) => {
      state.submissionId = ""
      state.artworkDetails = artworkDetailsEmptyInitialValues
      state.photos = photosEmptyInitialValues
    }),
  },
})
