import express from "express";
import { uploadImgMulter } from "../config/cloudinary.config.js";

const uploadImageRouter = express.Router();

uploadImageRouter.post(
  "/",
  uploadImgMulter.single("picture"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ msg: "Upload failed" });
    }

    return res.status(201).json({ url: req.file.path });
  }
);

// 


export { uploadImageRouter };
