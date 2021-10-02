require("dotenv").config();
require("./src/config/cloudinary");

const express = require("express");
const app = express();
const cors = require("cors");
const multer = require("multer");
const morgan = require("morgan");
const path = require("path");

const { notFound, errorHandling } = require("./src/errorHandler");
const { fileStorage, fileFilter } = require("./src/multer");

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan("common"));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("imageUrl")
);

// eleminates the null fields from the response object
// app.set("json replacer", (k, v) => (v === null ? undefined : v));

app.get("/", (req, res) => {
  res.send("test");
});

// routes
app.use("/api/v1/offer", require("./src/routes/offers"));
app.use("/api/v1/auth", require("./src/routes/auth"));
app.use("/api/v1/tip", require("./src/routes/tips"));
app.use("/api/v1/announcement", require("./src/routes/announcements"));
app.use("/api/v1/payment", require("./src/routes/payments"));
app.use("/api/v1/user", require("./src/routes/user"));
app.use("/api/v1/earning", require("./src/routes/earning"));
app.use("/api/v1/notification", require("./src/routes/notification"));

// error handling
app.use(notFound);

app.use(errorHandling);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Listning at port : ${port}`);
});
