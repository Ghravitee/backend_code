import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDb from "./config/db.js";
import auth from "./routes/auth.js";
import userRoute from "./routes/userRoutes.js";

dotenv.config();

connectDb();
const app = express();

// middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const corsOptions = {
  origin: "http://localhost:5173", // Allow your frontend origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies and authentication headers
};
app.use(cors(corsOptions));
app.options("*", cors());
app.use(cookieParser());

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
