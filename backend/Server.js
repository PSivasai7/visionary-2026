const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const CryptoJS = require("crypto-js");
const { OpenAI } = require("openai");
const cron = require("node-cron");
const { Resend } = require("resend");
const axios = require("axios");
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

// 3. AI & EMAIL CONFIG
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://visionary-2026.vercel.app",
    "X-Title": "Visionary 2026",
  },
});

const resend = new Resend(process.env.RESEND_API_KEY);

// 4. KEEP-ALIVE (Every 14 mins)
cron.schedule("*/14 * * * *", async () => {
  try {
    await axios.get("https://visionary-2026.onrender.com/api/health");
    console.log("🟢 Keep-Alive: Active");
  } catch {
    console.log("⚠️ Keep-Alive: Ping failed");
  }
});

app.get("/api/health", (req, res) => res.send("I am awake!"));

// 5. IMMEDIATE EMAIL FUNCTION
const sendImmediateRoadmap = async (email, goal, roadmap) => {
  const roadmapList = Object.entries(roadmap)
    .map(([month, task]) => `<li><strong>${month}:</strong> ${task}</li>`)
    .join("");

  try {
    await resend.emails.send({
      from: "Visionary <onboarding@resend.dev>",
      to: email,
      subject: "🚀 MISSION ARCHITECTED: Your 2026 Roadmap",
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; padding:20px; border: 1px solid #eee; border-radius:10px;">
          <h2 style="color: #4f46e5;">Hello Visionary 👋</h2>
          <p>Your mission for 2026 has been sealed:</p>
          <blockquote style="background:#f9f9f9; padding:10px; border-left:4px solid #4f46e5;">"${goal}"</blockquote>
          <h3>Your AI-Crafted Roadmap</h3>
          <ul style="line-height:1.6;">${roadmapList}</ul>
          <p style="margin-top:20px; font-size: 0.9em; color: #666;">
            Stay consistent. Follow the roadmap. Your secret message unseals on <b>Dec 31, 2026</b>. 🔐
          </p>
        </div>
      `,
    });
    console.log(`📩 Roadmap email sent to ${email}`);
  } catch (err) {
    console.error("❌ Email send failed:", err);
  }
};

// 6. YEAR-END CRON JOB
cron.schedule("0 0 * * *", async () => {
  if (new Date() >= new Date("2026-12-31")) {
    const pending = await Capsule.find({ isSent: false });
    for (let capsule of pending) {
      try {
        await resend.emails.send({
          from: "Visionary <onboarding@resend.dev>",
          to: capsule.email,
          subject: "🔓 MISSION UNSEALED: Your 2026 Time Capsule",
          html: `<h2>Mission Unlocked 🎉</h2><p>Your goal: <b>${capsule.goal}</b></p>`,
        });
        capsule.isSent = true;
        await capsule.save();
      } catch (err) {
        console.error(`❌ Failed final email to ${capsule.email}`, err);
      }
    }
  }
});

// 7. THE MAIN ENDPOINT (WITH JSON FIX)
app.post("/api/create-capsule", async (req, res) => {
  const { email, goal, note } = req.body;
  if (!email || !goal || !note) return res.status(400).json({ success: false });

  try {
    const response = await openai.chat.completions.create({
      model: "xiaomi/mimo-v2-flash:free",
      messages: [
        {
          role: "user",
          content: `Goal: "${goal}". Provide a 12-month roadmap for 2026 as a JSON object. Keys must be month names. Values must be short tasks. Output ONLY valid JSON. No markdown blocks.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    let rawContent = response.choices[0].message.content;

    // --- 🛠️ FIX: REMOVE BAD CONTROL CHARACTERS ---
    // This regex removes invisible characters that break JSON.parse
    const cleanContent = rawContent.replace(
      /[\u0000-\u001F\u007F-\u009F]/g,
      ""
    );

    // Find the first '{' and last '}' to ensure we only parse the object
    const jsonString = cleanContent.substring(
      cleanContent.indexOf("{"),
      cleanContent.lastIndexOf("}") + 1
    );

    const roadmap = JSON.parse(jsonString);

    const encryptedNote = CryptoJS.AES.encrypt(
      note,
      process.env.SECRET_KEY || "visionary_2026"
    ).toString();

    const newCapsule = new Capsule({ email, goal, encryptedNote, roadmap });
    await newCapsule.save();

    // Send the roadmap via Resend
    await sendImmediateRoadmap(email, goal, roadmap);

    res.json({ success: true, roadmap });
  } catch (err) {
    console.error("🔥 Error Detail:", err.message);
    res.status(500).json({
      success: false,
      message:
        "The AI Architect encountered a formatting error. Please try again.",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
