const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const CryptoJS = require("crypto-js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. DATABASE CONNECTION
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// 2. DATABASE MODEL
const CapsuleSchema = new mongoose.Schema({
  email: { type: String, required: true },
  goal: { type: String, required: true },
  encryptedNote: { type: String, required: true },
  roadmap: { type: Object, required: true },
  unsealDate: { type: Date, default: new Date("2026-12-31T23:59:59") },
  createdAt: { type: Date, default: Date.now },
});

const Capsule = mongoose.model("Capsule", CapsuleSchema);

// 3. AI CONFIGURATION
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 4. THE API ENDPOINT
app.post("/api/create-capsule", async (req, res) => {
  const { email, goal, note } = req.body;

  // Basic validation to prevent crashes
  if (!email || !goal || !note) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });
    const prompt = `Goal: "${goal}". Provide a 12-month roadmap for 2026 as a JSON object ONLY. Keys are months, values are short tasks. No markdown, no triple backticks, no extra text. Format: {"January": "task", ...}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // ROBUST JSON CLEANING: This handles backticks and extra text automatically
    const jsonString = responseText.substring(
      responseText.indexOf("{"),
      responseText.lastIndexOf("}") + 1
    );

    const roadmap = JSON.parse(jsonString);

    // ENCRYPTION - Ensure SECRET_KEY exists in your Render Env Variables
    const secret = process.env.SECRET_KEY || "temporary_backup_key_2026";
    const encryptedNote = CryptoJS.AES.encrypt(note, secret).toString();

    // SAVE TO DB
    const newCapsule = new Capsule({
      email,
      goal,
      encryptedNote,
      roadmap,
    });

    await newCapsule.save();

    res.json({ success: true, roadmap });
  } catch (error) {
    console.error("🔥 Server Error Details:", error);
    res.status(500).json({
      success: false,
      message: "Error in creating capsule",
      details: error.message, // This helps you see the real error in the browser console
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
