const cloudinary = require("cloudinary");

const upload = (file) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(
      file,
      (result) => {
        resolve({ url: result.secure_url, id: result.public_id });
      },
      { resource_type: "auto" }
    );
  });
};

module.exports = upload;
