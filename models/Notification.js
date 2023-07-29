import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  userId: { type: String },
  notifications: [
    {
      timeStamp: { type: Date, default: Date.now },
      notificationPrice: { type: Number },
      notificationStore: { type: String },
      notificationGameTitle: { type: String },
      notificationGameSlug: { type: String },
    },
  ],
});

export default mongoose.model("Notification", NotificationSchema);
