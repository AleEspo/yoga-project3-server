import { Schema, Types, model } from "mongoose";

const orderSchema = new Schema({
  price: { type: Number, required: true },
  createdAt: { type: Date, default: new Date(Date.now()) },
  teacher: { type: Types.ObjectId, ref: "User" },
  consumer: { type: Types.ObjectId, ref: "User" },
  practice: { type: Types.ObjectId, ref: "Practice" },
  status: {
    type: String,
    enum: [
      "Received",
      "Payment confirmed",
      "Receipt emitted",
      "Sent",
      "Delivered",
      "Cancelled by user",
      "Cancelled by teacher"
    ],
    default: "Received"
  },
});

export const OrderModel = model("Order", orderSchema);
