const router = require("express").Router();
const { allTips, create, deleteTip, updateTip } = require("../controller/tips");
// const { verifyUserAccessToken } = require("../middlewares/jwt");

// GET
router.get("/alltips", allTips);

// POST
router.post("/create", create);

// DELETE
router.delete("/delete/:tipId", deleteTip);

module.exports = router;
