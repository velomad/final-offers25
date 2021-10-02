const router = require("express").Router();
const {
  addUserEarning,
  userEarnings,
  allUsersEarnings,
  revertUserEarning,
  userAppEarnings,
} = require("../controller/earning");
const { verifyUserAccessToken } = require("../middlewares/jwt");

// dashboard apis

router.post("/addEarning/:userId", addUserEarning);
router.get("/userEarnings/:userId", userEarnings);
router.get("/allUsersEarnings", allUsersEarnings);
router.patch("/revertUserEarning/:userId/:earningId", revertUserEarning);

// user app apis

router.get("/user/earnings", verifyUserAccessToken, userAppEarnings);

module.exports = router;
