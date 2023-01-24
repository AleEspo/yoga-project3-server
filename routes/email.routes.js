import express from "express";
import transporter from "../config/transporter.config.js";
import templateExample from "../templates/contactus.template.js";

const emailRouter = express.Router();

emailRouter.post("/contact-us", (req, res, next) => {
  const { email, subject, message } = req.body;

  transporter
    .sendMail({
      from: `<${process.env.EMAIL_ADDRESS}>`,
      to: email,
      subject: subject,
      text: message,
      html: templateExample(message),
    })
    .then(() => {
      res.json({
        message: "SUCESS",
        message: `The message ${subject} was sucessfully sent to ${email}. Body of the email ${message}`,
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({ status: "FAILED", message: "An error occurred" });
    });
});

export { emailRouter };
