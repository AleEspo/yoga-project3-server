import { UserModel } from "../model/user.model.js";
// segunda 2.50
export default async function attachCurrentUser(req, res, next) {
  try {
    const userDate = req.auth;

    const user = await UserModel.findOne(
      { _id: userDate._id },
      { passwordHash: 0 }
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    req.currentUser = user;

    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
}
