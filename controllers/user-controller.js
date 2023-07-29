import User from "../models/User.js";
import Wishlist from "../models/Wishlist.js";
import { searchGameCopiesBestPrice } from "./gameCopy-controller.js";
import { sendNotification } from "./notification-controller.js";

export const notifyUsers = async (req, res) => {
  try {
    const users = await User.find();
    const userIds = users.map((user) => user._id);
    for (const userId of userIds) {
      const wishlist = await Wishlist.findOne({ userId });
      if (!wishlist) continue;
      for (const game of wishlist.games) {
        const bestPriceCopy = await searchGameCopiesBestPrice(
          req,
          res,
          game.gameTitle
        );

        // if (bestPriceCopy.retailPrice[0].price === game.lowestPriceAdded) {
        //   continue;
        // } else {
        game.lowestPriceAdded = bestPriceCopy.retailPrice[0].price;
        game.storeAdded = bestPriceCopy.storeName;
        const notificationPrice = bestPriceCopy.retailPrice[0].price;
        const notificationStore = bestPriceCopy.storeName;
        const notificationGameTitle = game.gameTitle;
        const notificationGameSlug = game.gameSlug;
        await sendNotification(
          req,
          res,
          userId,
          notificationPrice,
          notificationGameTitle,
          notificationStore,
          notificationGameSlug
        );
        // }
      }
      await wishlist.save();
    }
    res.status(200).json({ message: "Done Updating Prices" });
  } catch (error) {
    res.status(500).json(error);
  }
};


