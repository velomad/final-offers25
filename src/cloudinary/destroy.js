const cloudinary = require("cloudinary");

const destroy = (file) => {
  console.log("destroyed image")
  cloudinary.v2.uploader.destroy(file, (error, result) => {
    console.log(result, error);
  });
};

module.exports = destroy;
  