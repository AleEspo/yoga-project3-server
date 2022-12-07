import express from "express";
import * as dotenv from "dotenv";
import { dbConnection } from "./config/db.config.js";
import { userRouter } from "./routes/user.routes.js";
import { practiceRouter } from "./routes/practice.routes.js";

dotenv.config();
const app = express();
dbConnection();

app.use(express.json());

app.use("/user", userRouter);
app.use("/practice", practiceRouter);

app.listen(Number(process.env.PORT), () => {
  console.log(`Server up at port ${process.env.PORT}`);
});
