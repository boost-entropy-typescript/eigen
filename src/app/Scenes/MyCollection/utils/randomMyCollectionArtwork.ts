import { MyCollectionCreateArtworkInput } from "__generated__/myCollectionCreateArtworkMutation.graphql"
import { uploadPhotos } from "app/Scenes/MyCollection/Screens/ArtworkForm/MyCollectionImageUtil"
import { myCollectionCreateArtwork } from "app/Scenes/MyCollection/mutations/myCollectionCreateArtwork"
import { storeLocalImage } from "app/utils/LocalImageStore"
import { requestPhotos } from "app/utils/requestPhotos"

const randomValue = (array: any[]) => {
  const randIndex = Math.floor(Math.random() * array.length)
  return array[randIndex]
}

export const addRandomMyCollectionArtwork = async () => {
  const photos = await requestPhotos(true)
  const externalImageUrls = await uploadPhotos(photos)
  const input: MyCollectionCreateArtworkInput = {
    // KAWS, Bisa Butler, Kerry James Marshall
    artistIds: [
      randomValue([
        "4e934002e340fa0001005336",
        "57434d159c18db3ccf003d03",
        "4e9750d06ba7120001001cdb",
      ]),
    ],
    medium: randomValue(["photography", "oil", "chewing-gum"]),
    category: randomValue(["some-category"]),
    costCurrencyCode: randomValue(["USD"]),
    costMinor: randomValue([100, 1000, 10000]),
    date: randomValue(["1982", "1685", "Sept 3 2021"]),
    depth: randomValue(["10", "40", "300"]),
    height: randomValue(["10", "40", "300"]),
    width: randomValue(["10", "40", "300"]),
    metric: randomValue(["cm", "in"]),
    editionNumber: randomValue(["10", "1", "23"]),
    editionSize: randomValue(["10", "100", "47"]),
    externalImageUrls,
    isEdition: randomValue([true, false]),
    pricePaidCents: randomValue([10000, 50000]),
    pricePaidCurrency: "USD",
    provenance: "it's always been fake",
    title: randomValue(["An apple", "Very Small Rocks", "A Bit of Gravy", "Lead", "A Duck"]),
  }
  const response = await myCollectionCreateArtwork(input)

  const artwork = response.myCollectionCreateArtwork?.artworkOrError?.artworkEdge?.node

  // Store images locally
  photos.forEach((image, index) => {
    const imageID = artwork?.images?.[index]?.internalID

    if (!imageID) return

    storeLocalImage(imageID, {
      path: image.path!,
      width: image.width!,
      height: image.height!,
    })
  })

  return response
}
