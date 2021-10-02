const router = require("express").Router();
const { allAnnouncements, create, deleteAnnouncements } = require("../controller/announcements");

// GET
router.get("/allannouncements", allAnnouncements);

// POST
router.post("/create", create);

// DELETE
router.delete("/delete/:announcementsId", deleteAnnouncements);

module.exports = router;
