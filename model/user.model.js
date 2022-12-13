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
  passwordHash: {type: String, required: true},
  role: {type: String, enum: ["ADMIN", "TEACHER", "USER"], default: "USER"},
  orders: [{type: Types.ObjectId, ref: "Order"}],
  practices: [{type: Types.ObjectId, ref: "Practice"}],
  teachers: [{type: Types.ObjectId, ref: "User"}],
  students: [{type: Types.ObjectId, ref: "User"}],
  img: {type: String, required: true, default: "https://unsplash.com/photos/F2qh3yjz6Jk"},
  infos: {
    about: {type: String},
    age: {type: Number},
    avatar: {type: String},
    photos: {type: String},
    socialMedia: [],
  }
});

export const UserModel = model("User", userSchema);
