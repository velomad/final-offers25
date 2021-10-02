const multer = require("multer");

const fileStorage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

module.exports = fileStorage;
