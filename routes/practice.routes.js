import express from "express";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAuth from "../middlewares/isAuth.js";
import isTeacher from "../middlewares/isTeacher.js";
import { PracticeModel } from "../model/practice.model.js";
import { OrderModel } from "../model/order.model.js";
import { UserModel } from "../model/user.model.js";

const practiceRouter = express.Router();

// CREATE
practiceRouter.post(
  "/",
  isAuth,
  attachCurrentUser,
  isTeacher,
  async (req, res) => {
    try {
      const loggedInUser = req.currentUser;
      const newPractice = await PracticeModel.create({
        ...req.body,
        teacher: loggedInUser._id,
      });

      await UserModel.findOneAndUpdate(
        { id: loggedInUser._id },
        {practices: newPractice._id} //GET PRACTICE ID (just created?)?????????
      );

      return res.status(201).json(newPractice);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

//READ: all teacher practices? check client
practiceRouter.get(
  "/teacher-practices",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const loggedInUser = req.currentUser;
      const practice = await PracticeModel.find({
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

// READ: all practice
practiceRouter.get("/", async (req, res) => {
  try {
    const practice = await PracticeModel.find({});
    return res.status(200).json(practice);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// READ: single practice->client
practiceRouter.get("/:practiceId", async (req, res) => {
  try {
    const practice = await PracticeModel.findOne({
      _id: req.params.practiceId,
    });
    return res.status(200).json(practice);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// UPDATE: single practice teacher -> client; se id criador da pratica for igual ao id do teacher, abilita update
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

// DELETE: single practice teacher -> client; se id criador da pratica for igual ao id do teacher, abilita delete
practiceRouter.delete(
  "/:practiceId",
  isAuth,
  attachCurrentUser,
  isTeacher,
  async (req, res) => {
    try {
      const practice = await PracticeModel.findOne({
        _id: req.params.practiceId,
      });

      const teacher = req.currentUser._id;

      if (practice.teacher.equals(teacher)) {
        // DUE DATE PASSED CONDITIONAL?

        const cancelledOrders = await OrderModel.updateMany(
          { practice: req.params.practiceId },
          { status: "Cancelled by teacher" },
          { runValidators: true }
        );

        const deletePractice = await PracticeModel.deleteOne({
          _id: req.params.practiceId,
        });

        return res.status(200).json(deletePractice);
      }
      return res
        .status(400)
        .json({
          msn: `Practice: ${practice}. Teacher: ${teacher}. Teacher modified: ${`new ObjectId(\"${teacher}"\)`}`,
        });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

export { practiceRouter };
