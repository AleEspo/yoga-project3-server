import { Schema, model, Types } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    require: true,
    unique: true,
    trim: true,
    match: /[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/gm,
  },
  passwordHash: { type: String, required: true },
  verified: { type: Boolean },
  role: { type: String, enum: ["ADMIN", "TEACHER", "USER"] },
  orders: [{ type: Types.ObjectId, ref: "Order" }],
  practices: [{ type: Types.ObjectId, ref: "Practice" }],
  teachers: [{ type: Types.ObjectId, ref: "User" }],
  students: [{ type: Types.ObjectId, ref: "User" }],
  about: { type: String },
  country: { type: String },
  age: { type: Number },
  img: {
    type: String},
  coverPhoto: {
    type: String},
  otherPhotos: [{ type: String }],
});

export const UserModel = model("User", userSchema);
