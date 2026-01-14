import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./Route/authRoute.js";
import requestRoutes from "./Route/requestRoute.js";
import adminRoutes from "./Route/adminRoute.js";
import notificationRoutes from "./Route/notificationRoute.js";

//config
dotenv.config();

//database
connectDB();
//server
const app = express();
//middleware
app.use(cors());
app.use(express.json());
//routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

//port
const PORT = process.env.PORT || 5000;

//listen
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
//welcome
app.use("/", (req, res) => {
  res.send("Welcome to my api");
});
