import { Photo } from "app/Scenes/SellWithArtsy/SubmitArtwork/UploadPhotos/validation"
import { transformBytesToSize } from "app/utils/transformBytesToSize"

const TOTAL_SIZE_LIMIT_IN_BYTES = 30000000

// calculates a photos size from Bytes to unit and return updated photo
export const calculateSinglePhotoSize = (photo: Photo): Photo => {
  if (photo.automaticallyAdded) {
    photo.sizeDisplayValue = "Automatically added"
    return photo
  }

  if (!photo.size) {
    photo.error = true
    photo.sizeDisplayValue = "Size not found"
    return photo
  }

  photo.sizeDisplayValue = transformBytesToSize(photo.size)
  return photo
}

// calculates the total size of an array of photos
export const getPhotosSize = (photos: Photo[]) => {
  const allPhotosSize = photos.reduce((acc: number, cv: Photo) => {
    acc = acc + (cv?.size || 0)
    return acc
  }, 0)
  return allPhotosSize
}
// calculates all photos' size and returns if total size exceeds limit
export const isSizeLimitExceeded = (photos: Photo[]): boolean => {
  const allPhotosSize = getPhotosSize(photos)

  return allPhotosSize > TOTAL_SIZE_LIMIT_IN_BYTES
}
