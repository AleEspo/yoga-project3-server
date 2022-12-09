import express from "express";
import { UserModel } from "../model/user.model.js";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { generateToken } from "../config/jwt.config.js";
import isAuth from "../middlewares/isAuth.js";
import attachCurrentUser  from "../middlewares/attachCurrentUser.js";
import isAdmin from "../middlewares/isAdmin.js"
import isTeacher from "../middlewares/isTeacher.js";

dotenv.config();

const userRouter = express.Router();

userRouter.post("/signup", async (req, res) => {
  try {
    const { password } = req.body;
    // pass inserida tem que ter carateser etc
    if (
      !password ||
      !password.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/gm
      )
    ) {
      return res.status(400).json({
        msg: "Your password must include minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character.",
      });
    }
    // CRYPTO PASSWORD E GUARDO NO DB UMA HASHEDPASSWORD

    // salt bcrypt
    const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));

    // cryptografia bcrypt
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log(`SALT = ${salt}`);
    console.log(`HASHED PASSWORD = ${hashedPassword}`);

    const createdUser = await UserModel.create({
      ...req.body,
      passwordHash: hashedPassword,
      role: "USER"
      // pra criar novos admin, criar uma rota custom que so um admin pode criar pra criar outros admin
    });

    delete createdUser._doc.passwordHash;

    return res.status(201).json(createdUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email });

    // procur o email do usuario, se não esistir do uma msg equivoca para segurança
    if (!user) {
      return res.status(404).json({ msg: "Invalid email or password." });
    }
    // metodo bcrypt pra comparar booleano da senha inserita com senha do usuario
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(404).json({ msg: "Invalid password or email." });
    }

    // se não cair no if, geramos TOKEN -> func x gerar o TOKE definnida no config

    const token = generateToken(user);

    // pra agevolar o FRONT ja declaro tudo no return
    return res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
        _id: user._id,
        role: user.role,
      },
      token: token,
    });
  } catch (err) {
    console.log(err);
  }
});

userRouter.get("/profile", isAuth, attachCurrentUser, async (req, res) => {
  const loggedInUser = req.currentUser;
  return res.status(200).json(loggedInUser);
});

export { userRouter };
