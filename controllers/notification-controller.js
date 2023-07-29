import Notification from "../models/Notification.js";

const createNotification = async (
  req,
  res,
  userId,
  notificationPrice,
  notificationGameTitle,
  notificationStore,
  notificationGameSlug
) => {
  try {
    const newNotification = new Notification({
      userId,
      notifications: [
        {
          notificationPrice,
          notificationGameTitle,
          notificationStore,
          notificationGameSlug,
        },
      ],
    });
    const savedNotification = await newNotification.save();
    return savedNotification;
  } catch (error) {
    res.status(500).json(error);
  }
};

export const sendNotification = async (
  req,
  res,
  userId,
  notificationPrice,
  notificationGameTitle,
  notificationStore,
  notificationGameSlug
) => {
  try {
    const notifications = await Notification.findOne({ userId });
    if (!notifications) {
      await createNotification(
        req,
        res,
        userId,
        notificationPrice,
        notificationGameTitle,
        notificationStore,
        notificationGameSlug
      );
    } else {
      const notificationsCount = notifications.notifications;
      notificationsCount.push({
        notificationPrice,
        notificationGameTitle,
        notificationStore,
        notificationGameSlug,
      });
      await notifications.save();
    }
  } catch (error) {
    res.status(500).json(error);
  }
};
