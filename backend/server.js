import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import familyRoutes from "./routes/familyRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";
import aivanaRouter from "./routes/aivana.js";
import authRoutes from "./routes/authRoutes.js";
import "./utils/notificationService.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api/family", familyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/aivana", aivanaRouter);
app.use("/api/emergency", emergencyRoutes);

app.get("/", (req, res) => {
  res.send("FamHealth AI Backend Running ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
