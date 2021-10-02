const models = require("../models");

// notification EVENTS

// 2. on new announcement created
// 3. on Earnings added
// 4. on money Added to your wallet

module.exports = {
  createNotification: async (req, res, next) => {
    try {
    } catch (error) {
      next(error);
    }
  },
  registerExpoToken: async (req, res, next) => {
    const { aud } = req.payload;
    const expoToken = req.body.expoToken;
    try {
      await models.User.update({ expoToken }, { where: { id: aud } });

      res.status(200).json({
        status: "success",
        message: "push token updated",
      });
    } catch (error) {
      next(error);
    }
  },
  showAllNotifications: async (req, res, next) => {
    const { aud } = req.payload;
    try {
      const result = await models.Notification.findAll({
        where: { userId: aud },
      });

      res.status(200).json({ status: "success", notifications: result });
    } catch (error) {
      next(error);
    }
  },
};
