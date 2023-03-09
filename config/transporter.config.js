import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  // Ethereal test
  // host: "smtp.ethereal.email",
  // port: 587,
  // secure: false,
  // auth: {
  //   user: process.env.ETHE_USER,
  //   pass: process.env.ETHE_PASS,
  // }
  service: "gmail",
  host: "smtp.gmail.com",
  secure: false,
  auth: {
    user: process.env.EMAIL_ADDRESS_GOOGLE,
    pass: process.env.APP_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for message");
    console.log(success);
  }
});

export default transporter;
