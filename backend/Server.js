const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const CryptoJS = require("crypto-js");
const { OpenAI } = require("openai"); // Switched from Google to OpenAI SDK
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const axios = require("axios"); // Added for the Keep-Alive ping
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
  isSent: { type: Boolean, default: false },
  unsealDate: { type: Date, default: new Date("2026-12-31T23:59:59") },
  createdAt: { type: Date, default: Date.now },
});

const Capsule = mongoose.model("Capsule", CapsuleSchema);

// 3. AI CONFIGURATION (OPENROUTER)
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY, // Remember to add this to Render!
  defaultHeaders: {
    "HTTP-Referer": "https://visionary-2026.vercel.app",
    "X-Title": "Visionary 2026",
  },
});

// 4. NODEMAILER CONFIG
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SYSTEM_EMAIL,
    pass: process.env.SYSTEM_PASSWORD,
  },
});

// 5. KEEP-ALIVE CRON JOB (Prevents Render Sleep)
// Pings your server every 14 minutes so it never "shuts down" on the free tier
cron.schedule("*/14 * * * *", async () => {
  try {
    const serverUrl = "https://visionary-2026.onrender.com/api/health"; // We add this route below
    await axios.get(serverUrl);
    console.log("💓 Keep-Alive: Server pinged successfully.");
  } catch (err) {
    console.log("💓 Keep-Alive: Ping failed, but that's okay.");
  }
});

// Health check route for the Keep-Alive ping
app.get("/api/health", (req, res) => res.send("I am awake!"));

// 6. 2026 DELIVERY CRON JOB (Runs once a day)
cron.schedule("0 0 * * *", async () => {
  const today = new Date();
  const targetDate = new Date("2026-12-31");

  if (today >= targetDate) {
    const pendingCapsules = await Capsule.find({ isSent: false });
    for (let capsule of pendingCapsules) {
      try {
        await transporter.sendMail({
          from: '"Visionary 2026 Vault" <no-reply@visionary.com>',
          to: capsule.email,
          subject: "🔓 MISSION UNSEALED: Your 2026 Time Capsule is Ready!",
          html: `<div style="padding:20px; font-family:sans-serif;">
                  <h2>Hello Visionary!</h2>
                  <p>One year ago, you set the goal: <strong>${capsule.goal}</strong>.</p>
                  <p>The time has come to unseal your message. Happy 2027!</p>
                 </div>`,
        });
        capsule.isSent = true;
        await capsule.save();
      } catch (err) {
        console.error(`Mail failed for ${capsule.email}:`, err);
      }
    }
  }
});

// 7. THE API ENDPOINT (OPENROUTER FREE)
app.post("/api/create-capsule", async (req, res) => {
  const { email, goal, note } = req.body;

  if (!email || !goal || !note) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    // Calling Meta Llama 3 8B (FREE MODEL)
    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-3-8b-instruct:free",
      messages: [
        {
          role: "user",
          content: `Goal: "${goal}". Provide a 12-month roadmap for 2026 as a JSON object ONLY. Keys are months, values are short tasks. Format: {"January": "task", ...}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const roadmap = JSON.parse(response.choices[0].message.content);

    // ENCRYPTION
    const secret = process.env.SECRET_KEY || "temporary_backup_key_2026";
    const encryptedNote = CryptoJS.AES.encrypt(note, secret).toString();

    // SAVE TO DB
    const newCapsule = new Capsule({ email, goal, encryptedNote, roadmap });
    await newCapsule.save();

    res.json({ success: true, roadmap });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, message: "AI Architect is offline." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
