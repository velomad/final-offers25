const path = require("path");

const getPublicId = (imageUrl) => {
  var splitArry = imageUrl.split("/");
  var final = splitArry[splitArry.length - 1];
  return (publicId = path.parse(final).name);
};

module.exports = { getPublicId };
