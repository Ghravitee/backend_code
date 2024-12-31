import express from "express";
import dotenv from "dotenv";
import cookieparser from "cookie-parser";
import connectDb from "./config/db.js";
import auth from "./routes/auth.js";
import userRoute from "./routes/userRoutes.js";

dotenv.config();

connectDb();
const app = express();

// middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// routes
app.use("/api/auth", auth);
app.use("/api", userRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
