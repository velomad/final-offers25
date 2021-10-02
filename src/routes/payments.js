const router = require("express").Router();
const {
  create,
  addToUserWallet,
  remove,
  update,
  view,
  withdrawFromWallet,
  viewAllTransactions,
  getUserWithdrawals,
} = require("../controller/payments");
const { verifyUserAccessToken } = require("../middlewares/jwt");

// POST
router.post("/addBankAccount", verifyUserAccessToken, create);
router.post("/addToWallet/:userId/:earningId", addToUserWallet);
router.post("/withdraw", verifyUserAccessToken, withdrawFromWallet);
router.delete("/removeBankAccount", verifyUserAccessToken, remove);
router.patch("/updateBankAccount", verifyUserAccessToken, update);
router.get("/viewBankAccount", verifyUserAccessToken, view);
router.get("/allTransactions", viewAllTransactions);
router.get("/allWithdrawals", verifyUserAccessToken, getUserWithdrawals);

module.exports = router;
