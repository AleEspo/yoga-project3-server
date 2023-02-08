import express from "express";
import { UserModel } from "../model/user.model.js";
import { UserVerificationModel } from "../model/userVerification.model.js";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { generateToken } from "../config/jwt.config.js";
import isAuth from "../middlewares/isAuth.js";
import attachCurrentUser from "../middlewares/attachCurrentUser.js";
import isAdmin from "../middlewares/isAdmin.js";
import isTeacher from "../middlewares/isTeacher.js";
import jwt from "jsonwebtoken";
import transporter from "../config/transporter.config.js";
import { v4 as uuidv4 } from "uuid";
import * as path from "path"

dotenv.config();

const userRouter = express.Router();

// CREATE USER
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

    // console.log(`SALT = ${salt}`);
    // console.log(`HASHED PASSWORD = ${hashedPassword}`);

    const createdUser = await UserModel.create({
      ...req.body,
      passwordHash: hashedPassword,
      verified: false,
      // role: "USER" -> NO X TRACHER!!!
      // pra criar novos admin, criar uma rota custom que so um admin pode criar pra criar outros admin
    }).then((result) => {
      sendVerificationEmail(result, res);
    });

    delete createdUser._doc.passwordHash;

    return res.status(201).json(createdUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// send verification email

const sendVerificationEmail = ({ _id, email }, res) => {
  const currentUrl = Number(process.env.PORT);

  const uniqueString = uuidv4() + _id;

  const mailOptions = {
    from: `<${process.env.EMAIL_ADDRESS}>`,
    to: email,
    subject: "Verify your email",
    html: `<p>Verify your email adress to complete the signup and login into your account.</p><p>This link expires in 6 hours.</b></p><p>Press <a href=${
      currentUrl + "user/verify/" + _id + "/" + uniqueString
    }>here</a> to proceed.</p>`,
  };

  // hash the uniqueString
  // const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));

  // const hashedUniqueString = await bcrypt.hash(uniqueString, salt);

  const saltRounds = 10;
  bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
      const newVerification = UserVerification({
        userId: _id,
        uniqueString: hashedUniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 21600000,
      });

      newVerification
        .save()
        .then(() => {
          transporter
            .sendMail(mailOptions)
            .then(() => {
              res.json({
                status: "PENDING",
                message: "Verification email sent",
              });
            })
            .catch(error);
          res.json({
            status: "FAILED",
            message: "Verification email failed.",
          });
        })
        .catch((error) => {
          console.log(error);
          res.json({
            status: "FAILED",
            message: "Couldn't save verification email data.",
          });
        });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        status: "FAILED",
        message: "An error occurred while hashing email data.",
      });
    });
};

// verify email
userRouter.get("/verify/:userId/:uniqueString", (req, res) => {
  let { userId, uniqueString } = req.params;
  UserVerification.find({ userId })
    .then((result)=>{
      if (result.length > 0){
        // user verification record exist -> we proceed
        const {expiresAt} = result[0];
        const hashedUniqueString = result[0].uniqueString

        //checking for expired unique string
        if (expiresAt < Date.now()){
          // record has expired so we delete it
          UserVerification.deleteOne({userId}).then(result => {
            User.deleteOne({_id: userId}).then(()=>{
              let message = "Link has expired. Please sign up again";
    res.redirect(`/user/verified/error=true&message=${message}`)
            }).catch((err)=>{
              let message = "Clearing user with expired unique string failed";
    res.redirect(`/user/verified/error=true&message=${message}`)
            })
          }).catch((err)=>{
            console.log(err)
            let message = "An error occurred while clearing user verification record";
    res.redirect(`/user/verified/error=true&message=${message}`)
          })
        
        } else {
          // valid record exist -> we validate user string
          // compare hashed unique string
          bcrypt.compare(uniqueString, hashedUniqueString).then(result => {
            if (result){
              // strings match

              User.updateOne({_id: userId}, {verified: true}).then(()=>{
                UserVerification.deleteOne({userId}).then(()=> {
                  res.sendFile(path.join(_dirname, "./../templates/verified.html"))
                }).catch(err => {
                  let message = "An error occurred while finalizing verification ";
    res.redirect(`/user/verified/error=true&message=${message}`)
                })
              }).catch(err => {
                console.log(err);
                let message = "An error occurred while updating user record to verified ";
    res.redirect(`/user/verified/error=true&message=${message}`)
              })


            } else {
              // existing record but incorrect verification details passed.
              let message = "Invalid verification details passed. Check your inbox.";
    res.redirect(`/user/verified/error=true&message=${message}`)
            }
          }).catch(err => {
            let message = "An error occurred while comparing unique strings";
    res.redirect(`/user/verified/error=true&message=${message}`)
          })
        }
      } else {
        // user verification record does not exist -> error
        let message = "An error occurred while chegking for existing user verification record";
    res.redirect(`/user/verified/error=true&message=${message}`)
      }

    })
    .catch((err) => console.log(err));
    let message = "An error occurred while chegking for existing user verification record";
    res.redirect(`/user/verified/error=true&message=${message}`)
});

userRouter.get("/verified", (req, res)=>{
  res.sendFile(path.join(_dirname, "../templates/verified.html"))
})

// RECEIVE EMAIL USER
userRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // pass inserida tem que ter carateser etc
    if (
      !email
      // INSERT REGEX FOR EMAIL
      // || !email.match(
      //   /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/gm
      // )
    ) {
      return res.status(400).json({
        msg: "Invalid email address",
      });
    }

    const user = await UserModel.findOne({ email: email });

    // CHANGE MESSAGE FOR SECURITY
    if (!user) {
      return res.status(400).json({
        msg: "Email does not exist in our database",
      });
    }

    const { _id, name, email, role } = user;

    const signature = process.env.TOKEN_SIGN_SECRET;
    const expiration = "12h";

    const token = jwt.sign({ _id, name, email, role }, signature, {
      expiresIn: expiration,
    });

    const link = `http://localhost:4000/reset-password/${user._id}/${token}`;
    console.log(link);
    // return res.status(200).json({msg:`${link}`})
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// UPDATE
userRouter.post("/reset-password", async (req, res) => {
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
    const newHashedPassword = await bcrypt.hash(password, salt);

    // console.log(`SALT = ${salt}`);
    // console.log(`HASHED PASSWORD = ${hashedPassword}`);

    const loggedInUser = req.currentUser;

    const updatePassword = await UserModel.findOneAndUpdate(
      { id: loggedInUser._id },
      {
        ...req.body,
        passwordHash: newHashedPassword,
        // role: "USER" -> NO X TRACHER!!!
        // pra criar novos admin, criar uma rota custom que so um admin pode criar pra criar outros admin
      }
    );

    delete createdUser._doc.passwordHash;

    return res.status(201).json(createdUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

//READ ALL TEACHERS
userRouter.get("/teachers", async (req, res) => {
  try {
    const teachers = await UserModel.find({ role: "TEACHER" });

    return res.status(200).json(teachers);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

//LOGIN
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

    if(!user.verified) {
      return res.status(404).json({ msg: "Email has not been verified yet." });
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

//SPECIFIC TEACHER's STUDENTS
userRouter.get(
  "/your-students",
  isAuth,
  isTeacher,
  attachCurrentUser,
  async (req, res) => {
    try {
      const loggedInUser = req.currentUser;
      const yourStudents = await UserModel.find({ teachers: loggedInUser._id });

      return res.status(200).json(yourStudents);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

// UPDATE setting, PUT???
userRouter.post("/update", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedInUser = req.currentUser;
    delete req.body.email;
    const updatedUser = await UserModel.findOneAndUpdate(
      { id: loggedInUser._id },
      { ...req.body },
      { new: true, runValidators: true }
    );
    return res.status(200).json(updatedUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// READ ->
userRouter.get("/profile", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedInUser = req.currentUser;
    return res.status(200).json(loggedInUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

export { userRouter };