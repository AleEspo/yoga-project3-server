import express from "express";
import * as dotenv from "dotenv";
import { dbConnection } from "./config/db.config.js";
import { userRouter } from "./routes/user.route.js";
import { practiceRouter } from "./routes/practice.routes.js";
import cors from "cors";
import { orderRouter } from "./routes/order.routes.js";
import {uploadImageRouter} from "./routes/uploadimage.route.js"
import { emailRouter } from "./routes/email.routes.js";

dotenv.config();
const app = express();
dbConnection();

app.use(cors())
app.use(express.json());

app.use("/user", userRouter);
app.use("/practice", practiceRouter);
app.use("/order", orderRouter)
app.use("/upload-image", uploadImageRouter)
app.use("/send-email", emailRouter)


app.listen(Number(process.env.PORT), () => {
  console.log(`Server up at port ${process.env.PORT}`);
});

// BIBLIOTECAS? npm install multer cloudinary multer-storage-cloudinary
