const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "documents",
    resource_type: "raw",  
    allowed_formats: ["pdf"],
  },
});

const upload = multer({ storage });

module.exports = upload;
