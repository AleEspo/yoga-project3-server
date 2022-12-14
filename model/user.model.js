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
  role: { type: String, enum: ["ADMIN", "TEACHER", "USER"], default: "USER" },
  orders: [{ type: Types.ObjectId, ref: "Order" }],
  practices: [{ type: Types.ObjectId, ref: "Practice" }],
  teachers: [{ type: Types.ObjectId, ref: "User" }],
  students: [{ type: Types.ObjectId, ref: "User" }],
  infos: {
    about: { type: String },
    country: { type: String },
    age: { type: Number },
    img: {
      type: String,
      default:
        "https://res.cloudinary.com/dvvtr5bi2/image/upload/v1670969231/user_icon_lwaqnq.png",
    },
    coverPhoto: {
      type: String,
      default:
        "https://res.cloudinary.com/dvvtr5bi2/image/upload/v1670981627/kike-vega-F2qh3yjz6Jk-unsplash_gi5znx.jpg",
    },
    otherPhotos: [{type: String}]
  },
});

export const UserModel = model("User", userSchema);
