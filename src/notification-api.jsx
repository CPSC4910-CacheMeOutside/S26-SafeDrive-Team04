import { generateClient } from "aws-amplify/data";

const client = generateClient();


export async function sendNotification({ senderId, recipientId, content }) {
  try {
    const { data: notification } = await client.models.Notification.create({
      nId: crypto.randomUUID(),
      content,
    });

    if (!notification?.nId) {
      throw new Error("Notification record was not created.");
    }

    const { data: userNotification } = await client.models.UserNotification.create({
      sendId: senderId,
      recipId: recipientId,
      nId: notification.nId,
    });

    return { notification, userNotification };
  } catch (err) {
    console.error("Notification failed:", err);
    throw err;
  }
}


export async function fetchNotificationsForUser(userId) {
  try {
    const { data: userNotifications } =
      await client.models.UserNotification.list({
        filter: { recipId: { eq: userId } },
      });

    const notifIds = (userNotifications || []).map((n) => n.nId);

    if (!notifIds.length) return [];

    // 🔥 FIX: fetch one-by-one instead of using "in"
    const notifications = await Promise.all(
      notifIds.map(async (id) => {
        const { data } = await client.models.Notification.get({ nId: id });
        return data;
      })
    );

    return notifications.filter(Boolean);

  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    return [];
  }
}