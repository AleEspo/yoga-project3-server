import express from "express";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAdmin from "../middlewares/isAdmin.js";
import isAuth from "../middlewares/isAuth.js";
import { OrderModel } from "../model/order.model.js";
import { PracticeModel } from "../model/practice.model.js";
import { UserModel } from "../model/user.model.js";

const orderRouter = express.Router();

//CREATE
orderRouter.post("/", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const practice = await PracticeModel.findOne({ _id: req.body.practice });

    if (practice.placesLeft === 0) {
      return res.status(400).json({ msn: "There are no places left" });
    }

    // create order model
    const loggedInUser = req.currentUser;
    const order = await OrderModel.create({
      ...req.body,
      consumer: loggedInUser._id,
      practice: practice._id,
      teacher: practice.teacher,
    });

    // update student-user model
    await UserModel.findOneAndUpdate(
      { _id: loggedInUser._id },
      {
        $push: { practices: practice._id },
        $push: { orders: order._id },
        $push: { teachers: practice.teacher },
      },
      { new: true, runValidators: true }
    );

    //update teacher-user model
    await UserModel.findOneAndUpdate(
      { _id: practice.teacher },
      {
        $push: { students: loggedInUser._id },
        $push: { orders: order._id },
        // $push: { practices: practice._id }, -> create practice by teacher
      },
      { new: true, runValidators: true }
    );

    //uptade practice model
    await PracticeModel.findOneAndUpdate(
      { _id: practice._id },
      {
        placesLeft: practice.placesLeft - 1,
        $push: { orders: order._id },
        $push: { students: loggedInUser._id },
      },
      { new: true, runValidators: true }
    );

    return res.status(201).json(order);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
    // PROBLEMA AQUI
  }
});

// READ: TODAS AS ORDENS DO USUARIO -> POPULATE?
orderRouter.get("/my-orders", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedInUser = req.currentUser;

    const orders = await OrderModel.find({
      customer: loggedInUser._id,
    }).populate("practice").populate("teacher")
    // .populate("consumer")

    return res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// UPDATE/CANCEL by ADMIN->client?
orderRouter.patch(
  "/cancel-order/:orderId",
  isAuth,
  attachCurrentUser,
  isAdmin,
  async (req, res) => {
    try {
      const updateOrder = await OrderModel.findOneAndUpdate(
        { _id: req.params.orderId },
        { status: "Cancelled" },
        { new: true, runValidators: true }
      );

      const practice = await PracticeModel.findOne({
        _id: updateOrder.practice,
      });

      await PracticeModel.findOneAndUpdate(
        { _id: practice._id },
        { placesLeft: practice.placesLeft - 1 }
      );
      return res.status(200).json(updateOrder);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

// READ: DETALHES DUMA ORDEM DO USUARIO LOGADO ->client?
orderRouter.get(
  "/my-orders/:orderId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const loggedInUser = req.currentUser;

      const order = await OrderModel.findOne({ _id: req.params.orderId });

      if (loggedInUser._id !== order.consumer) {
        return res
          .status(401)
          .json({ msg: "User is not athorized to access this content" });
      }

      //

      return res.status(200).json(order);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

// UPDATE ORDER STATUS TO CANCELLED by USER (FAKE DELETE)
orderRouter.patch(
  "/update-status/:orderId",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    try {
      const loggedInUser = req.currentUser;

      const order = await OrderModel.findOne({ _id: req.params.orderId });

      if (loggedInUser._id.equals(order.consumer)) {
        const updateOrder = await OrderModel.findOneAndUpdate(
          { _id: req.params.orderId },
          { status: "Cancelled by user" },
          { new: true, runValidators: true }
        );

        // DUE DATE PASSED CONDITIONAL?

        const practice = await PracticeModel.findOne({ _id: order.practice });

        await PracticeModel.findOneAndUpdate(
          { _id: practice._id },
          {
            placesLeft: practice.placesLeft + 1,
            $pull: { students: loggedInUser._id },
          }
        );

        return res.status(200).json(updateOrder);
      } else {
        return res.status(401).json({
          msg: `User is not athorized to delete this content.`,
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

//UPDATE->client?
orderRouter.patch(
  "/update-status/:orderId",
  isAuth,
  attachCurrentUser,
  isAdmin,
  async (req, res) => {
    try {
      const { placesLeft } = req.body;
      // boolean

      const updateOrder = await OrderModel.findOneAndUpdate(
        { _id: req.params.orderId },
        { status: req.body.status },
        { new: true, runValidators: true }
      );

      if (placesLeft) {
        const practice = await PracticeModel.findOne({ _id: practice._id });

        await PracticeModel.finsOneAndUpdate(
          { _id: practice._id },
          { placesLeft: practice.placesLeft + 1 }
        );
      }

      return res.status(200).json(updateOrder);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

// READ: ALL ORDERS PRA ADMIN ->client?
orderRouter.get("/", isAuth, attachCurrentUser, isAdmin, async (req, res) => {
  try {
    const orders = await OrderModel.findOne({});

    return res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// READ: SINGLE ORDER DETAILS PRA ADMIN ->client?
orderRouter.get(
  "/:orderId",
  isAuth,
  attachCurrentUser,
  isAdmin,
  async (req, res) => {
    try {
      const order = await OrderModel.findOne({ _id: req.params.orderId });

      return res.status(200).json(order);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

export { orderRouter };
