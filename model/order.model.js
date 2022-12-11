import { Schema, Types, model } from "mongoose";

const orderSchema = new Schema({
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: new Date(Date.now()) },
  teacher: { type: Types.ObjectId, ref: "Teacher" },
  consumer: { type: Types.ObjectId, ref: "User" },
  practice: { type: Types.ObjectId, ref: "Order" },
  status: {
    type: String,
    enum: [
      "Received",
      "Payment confirmed",
      "Receipt emitted",
      "Sent",
      "Delivered",
      "Cancelled",
    ],
    default: "Received"
  },
});

export const OrderModel = model("Order", orderSchema);
