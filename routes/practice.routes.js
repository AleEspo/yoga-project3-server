import express from "express";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAuth from "../middlewares/isAuth.js";
import isTeacher from "../middlewares/isTeacher.js";
import { PracticeModel } from "../model/practice.model.js";

const practiceRouter = express.Router();

practiceRouter.post(
  "/",
  isAuth,
  attachCurrentUser,
  isTeacher,
  async (req, res) => {
    try {
      const loggedInUser = req.currentUser;
      const practice = await PracticeModel.create({
        ...req.body,
        teacher: loggedInUser._id,
      });

      return res.status(201).json(practice);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

export { practiceRouter };
