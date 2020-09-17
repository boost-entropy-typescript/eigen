import { ConsignmentSubmissionCategoryAggregation } from "__generated__/createConsignmentSubmissionMutation.graphql"

interface Medium {
  label: string
  value: ConsignmentSubmissionCategoryAggregation
}

export const artworkMediumCategories: Medium[] = [
  { label: "Painting", value: "PAINTING" },
  { label: "Sculpture", value: "SCULPTURE" },
  { label: "Photography", value: "PHOTOGRAPHY" },
  { label: "Print", value: "PRINT" },
  { label: "Drawing, Collage or other Work on Paper", value: "DRAWING_COLLAGE_OR_OTHER_WORK_ON_PAPER" },
  { label: "Mixed Media", value: "MIXED_MEDIA" },
  { label: "Performance Art", value: "PERFORMANCE_ART" },
  { label: "Installation", value: "INSTALLATION" },
  { label: "Video/Film/Animation", value: "VIDEO_FILM_ANIMATION" },
  { label: "Architecture", value: "ARCHITECTURE" },
  { label: "Fashion Design and Wearable Art", value: "FASHION_DESIGN_AND_WEARABLE_ART" },
  { label: "Jewelry", value: "JEWELRY" },
  { label: "Design/Decorative Art", value: "DESIGN_DECORATIVE_ART" },
  { label: "Textile Arts", value: "TEXTILE_ARTS" },
  { label: "Other", value: "OTHER" },
]
