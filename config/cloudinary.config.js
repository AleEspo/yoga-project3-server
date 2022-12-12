import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import * as dotenv from "dotenv";

// aula segunda 20 min ; olha documentação multer

dotenv.config();

const cloudinaryInst = cloudinary.v2;

cloudinaryInst.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinaryInst,
  params: {
    folder: "pictures",
    format: async (req, file) => "png",
  },
});

const uploadImgMulter = multer({ storage: cloudinaryStorage });

export { uploadImgMulter };
