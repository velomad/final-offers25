const router = require("express").Router();
const {
  getUserProfile,
  network,
  search,
  getAllUsers,
  getUser,
  userNetwork,
  addLead,
  leads,
  addExpoToken,
} = require("../controller/user");
const { verifyUserAccessToken } = require("../middlewares/jwt");

// GET
router.get("/getProfile", verifyUserAccessToken, getUserProfile);
router.get("/search", search);
router.get("/allUsers", getAllUsers);
router.get("/details/:userId", getUser);
router.get("/network", verifyUserAccessToken, network);
router.post("/addLead", verifyUserAccessToken, addLead);
router.get("/leads", leads);
router.patch("/addExpoToken", verifyUserAccessToken, addExpoToken);

module.exports = router;
