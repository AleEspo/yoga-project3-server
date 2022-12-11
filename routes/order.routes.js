import express from "express";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAdmin from "../middlewares/isAdmin.js";
import isAuth from "../middlewares/isAuth.js";
import { OrderModel } from "../model/order.model.js";
import { PracticeModel } from "../model/practice.model.js";
import { UserModel } from "../model/user.model.js";

const orderRouter = express.Router();

orderRouter.post("/", isAuth, attachCurrentUser, async (req, res) => {
  try {

    // ERRO AQUI 
    const practice = await PracticeModel.findOne({ _id: req.body.practice });

    if (practice.placesLeft === 0) {
      return res.status(400).json({ msn: "There are no places left" });
    }

    const loggedInUser = req.currentUser;
    const order = await OrderModel.create({
      ...req.body,
      consumer: loggedInUser._id,
    });

    await UserModel.findOneAndUpdate(
      { _id: loggedInUser._id },
      { $push: { orders: order._id } },
      { runValidators: true }
    );

    await PracticeModel.findOneAndUpdate(
        { _id: practice._id },
        { placesLeft: practice.placesLeft - 1, $push: { orders: order._id } }
      );

    return res.status(201).json(order);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
    // PROBLEMA AQUI
  }
});

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


// ALL ORDERS PRA ADMIN
orderRouter.get("/", isAuth, attachCurrentUser, isAdmin, async (req, res) => {
    try {
      const orders = await OrderModel.findOne({});
  
      return res.status(200).json(orders);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  });

// SINGLE ORDER DETAILS PRA ADMIN
orderRouter.get(":orderId", isAuth, attachCurrentUser, isAdmin, async (req, res) => {
  try {
    const order = await OrderModel.findOne({ _id: req.params.orderId });

    return res.status(200).json(order);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});


//TODAS AS ORDENS DO USUARIO
orderRouter.get("/my-orders", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedInUser = req.currentUser;

    const orders = await OrderModel.find({ customer: loggedInUser._id });

    return res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});


// DETALHES DUMA ORDEM DO USUARIO LOGADO
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

      return res.status(200).json(order);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);



export { orderRouter };
