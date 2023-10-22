interface Medium {
  label: string
  value: string
}

// List for my collection accepted mediums/categories
export const artworkMediumCategories: Medium[] = [
  { label: "Painting", value: "Painting" },
  { label: "Sculpture", value: "Sculpture" },
  { label: "Photography", value: "Photography" },
  { label: "Print", value: "Print" },
  {
    label: "Drawing, Collage or other Work on Paper",
    value: "Drawing, Collage or other Work on Paper",
  },
  { label: "Mixed Media", value: "Mixed Media" },
  { label: "Performance Art", value: "Performance Art" },
  { label: "Installation", value: "Installation" },
  { label: "Video/Film/Animation", value: "Video/Film/Animation" },
  { label: "Architecture", value: "Architecture" },
  { label: "Fashion Design and Wearable Art", value: "Fashion Design and Wearable Art" },
  { label: "Jewelry", value: "Jewelry" },
  { label: "Design/Decorative Art", value: "Design/Decorative Art" },
  { label: "Textile Arts", value: "Textile Arts" },
  { label: "Posters", value: "Posters" },
  { label: "Books and Portfolios", value: "Books and Portfolios" },
  { label: "Other", value: "Other" },
  { label: "Ephemera or Merchandise", value: "Ephemera or Merchandise" },
  { label: "Reproduction", value: "Reproduction" },
  { label: "NFT", value: "NFT" },
]

// A sorted list for medium types surfaced for alert creation. Intended to match
// the filter options currently exposed on the /collect web surfaced
export const gravityArtworkMediumCategories: { label: string; value: string }[] = [
  {
    label: "Painting",
    value: "painting",
  },
  {
    label: "Photography",
    value: "photography",
  },
  {
    label: "Sculpture",
    value: "sculpture",
  },
  {
    label: "Prints",
    value: "prints",
  },
  {
    label: "Work on Paper",
    value: "work-on-paper",
  },
  {
    label: "NFT",
    value: "nft",
  },
  {
    label: "Design",
    value: "design",
  },
  {
    label: "Drawing",
    value: "drawing",
  },
  {
    label: "Installation",
    value: "installation",
  },
  {
    label: "Film/Video",
    value: "film-slash-video",
  },
  {
    label: "Jewelry",
    value: "jewelry",
  },
  {
    label: "Performance Art",
    value: "performance-art",
  },
  {
    label: "Reproduction",
    value: "reproduction",
  },
  {
    label: "Ephemera or Merchandise",
    value: "ephemera-or-merchandise",
  },
]
