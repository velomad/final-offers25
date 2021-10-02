const router = require("express").Router();
const {
  createNotification,
  showAllNotifications,
  registerExpoToken,
} = require("../controller/notification");
const { verifyUserAccessToken } = require("../middlewares/jwt");

router.post("/create", createNotification);
router.get("/allNotifications", verifyUserAccessToken, showAllNotifications);
router.patch("/registerPushToken", verifyUserAccessToken, registerExpoToken);

module.exports = router;
