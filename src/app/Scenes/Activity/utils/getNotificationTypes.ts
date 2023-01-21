import { NotificationTypesEnum } from "__generated__/ActivityItem_item.graphql"
import { NotificationType } from "app/Scenes/Activity/types"

export const getNotificationTypes = (
  type: NotificationType
): NotificationTypesEnum[] | undefined => {
  if (type === "alerts") {
    return ["ARTWORK_ALERT"]
  }

  return []
}
