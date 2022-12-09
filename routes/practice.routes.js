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

practiceRouter.get(
  "/",
  async (req, res) => {
    try {
      const practice = await PracticeModel.find({});
      return res.status(200).json(practice);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

practiceRouter.get(
  "/:practiceId",
  async (req, res) => {
    try {
      const practice = await PracticeModel.findOne({
        _id: req.params.productId,
      });
      return res.status(200).json(practice);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

practiceRouter.put(
  "/:practiceId",
  isAuth,
  attachCurrentUser,
  isTeacher,
  async (req, res) => {
    try {
      const updatedPractice = await PracticeModel.findOneAndUpdate(
        { _id: req.params.practiceId },
        { ...req.body },
        { new: true, runValidators: true }
      );
      return res.status(200).json(updatedPractice);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

practiceRouter.delete(
  "/:practiceId",
  isAuth,
  attachCurrentUser,
  isTeacher,
  async (req, res) => {
    try {
      const deletePractice = await PracticeModel.deleteOne({
        _id: req.params.practiceId,
      });
      return res.status(200).json(deletePractice);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

export { practiceRouter };
