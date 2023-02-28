import { CommerceOrderDisplayStateEnum } from "__generated__/OrderDetailsHeader_info.graphql"

export function getOrderStatus(displayState: CommerceOrderDisplayStateEnum) {
  switch (displayState) {
    case "SUBMITTED":
      return "pending"
    case "APPROVED":
      return "confirmed"
    case "FULFILLED":
      return "delivered"
    case "REFUNDED":
      return "refunded"
    case "PROCESSING":
      return "processing"
    case "PROCESSING_APPROVAL":
      return "payment processing"
    case "IN_TRANSIT":
      return "in transit"
    case "CANCELED":
      return "canceled"
    default:
      return "unknown"
  }
}
