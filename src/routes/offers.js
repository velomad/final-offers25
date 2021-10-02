const router = require("express").Router();
const {
  allOffers,
  create,
  updateOffer,
  removeOfferImage,
  suspendOffer,
  pauseOffer,
  setTop,
  setFormEnable,
} = require("../controller/offers");
const { verifyUserAccessToken } = require("../middlewares/jwt");

// GET
router.get("/alloffers", allOffers);

// POST
router.post("/create", create);
router.post("/removeImage/:offerId", removeOfferImage);

// PATCH
router.patch("/updateOffer/:offerId", updateOffer);
router.patch("/suspendOffer/:offerId", suspendOffer);
router.patch("/pauseOffer/:offerId", pauseOffer);
router.patch("/toggleTop/:offerId", setTop);
router.patch("/toggleLeadForm/:offerId", setFormEnable);

module.exports = router;
