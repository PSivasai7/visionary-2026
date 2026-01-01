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

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

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

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://visionary-2026.vercel.app",
    "X-Title": "Visionary 2026",
  },
});

const resend = new Resend(process.env.RESEND_API_KEY);

cron.schedule("*/14 * * * *", async () => {
  try {
    await axios.get("https://visionary-2026.onrender.com/api/health");
    console.log("🟢 Keep-Alive ping successful");
  } catch {
    console.log("⚠️ Keep-Alive ping failed");
  }
});

app.get("/api/health", (req, res) => res.send("I am awake!"));

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
        <div style="font-family: Arial; max-width:600px; padding:20px;">
          <h2>Hello Visionary 👋</h2>
          <p>Your mission for 2026 has been sealed:</p>
          <strong>${goal}</strong>
          <h3>Your AI-Crafted Roadmap</h3>
          <ul>${roadmapList}</ul>
          <p style="margin-top:20px;">
            Stay consistent. We'll unlock your capsule on <b>Dec 31, 2026</b>. 🔐
          </p>
        </div>
      `,
    });

    console.log(`📩 Roadmap email sent to ${email}`);
  } catch (err) {
    console.error("❌ Email send failed:", err);
  }
};

cron.schedule("0 0 * * *", async () => {
  const today = new Date();
  const targetDate = new Date("2026-12-31");

  if (today >= targetDate) {
    const pendingCapsules = await Capsule.find({ isSent: false });

    for (let capsule of pendingCapsules) {
      try {
        await resend.emails.send({
          from: "Visionary <onboarding@resend.dev>",
          to: capsule.email,
          subject: "🔓 MISSION UNSEALED: Your 2026 Time Capsule",
          html: `
            <div style="font-family:Arial;padding:20px;">
              <h2>Your Mission Has Been Unlocked 🎉</h2>
              <p>Your original goal:</p>
              <strong>${capsule.goal}</strong>
            </div>
          `,
        });

        capsule.isSent = true;
        await capsule.save();
      } catch (err) {
        console.error(`❌ Failed to send final email to ${capsule.email}`, err);
      }
    }
  }
});

app.post("/api/create-capsule", async (req, res) => {
  const { email, goal, note } = req.body;
  if (!email || !goal || !note) return res.status(400).json({ success: false });

  try {
    const response = await openai.chat.completions.create({
      model: "xiaomi/mimo-v2-flash:free",
      messages: [
        {
          role: "user",
          content: `Goal: "${goal}". Provide a 12-month roadmap for 2026 as a JSON object ONLY.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const roadmap = JSON.parse(response.choices[0].message.content);

    const encryptedNote = CryptoJS.AES.encrypt(
      note,
      process.env.SECRET_KEY || "visionary_2026"
    ).toString();

    const newCapsule = new Capsule({
      email,
      goal,
      encryptedNote,
      roadmap,
    });

    await newCapsule.save();
    await sendImmediateRoadmap(email, goal, roadmap);

    res.json({
      success: true,
      message: "Mission architected and roadmap sent!",
      roadmap,
    });
  } catch (err) {
    console.error("🔥 Error:", err);
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
