import express from "express";
import transporter from "../config/transporter.config.js";
import templateExample from "../templates/contactus.template.js";

const emailRouter = express.Router();

emailRouter.post("/contact-us", (req, res, next) => {
  const { email, subject, message } = req.body;

  transporter
    .sendEmail({
      from: `"My Awesome Project " <${process.env.EMAIL_ADDRESS}>`,
      to: email,
      subject: subject,
      text: message,
      html: templateExample(message),
    })
    .then((info) => res.render("message", { email, subject, message, info }))
    .catch((error) => console.log(error));
});

export { emailRouter };
