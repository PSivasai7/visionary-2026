const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const CryptoJS = require("crypto-js");
const { OpenAI } = require("openai");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
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

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SYSTEM_EMAIL,
    pass: process.env.SYSTEM_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
  greetingTimeout: 5000,
  socketTimeout: 15000,
});

cron.schedule("*/14 * * * *", async () => {
  try {
    const serverUrl = "https://visionary-2026.onrender.com/api/health"; // We add this route below
    await axios.get(serverUrl);
    console.log(" Keep-Alive: Server pinged successfully.");
  } catch (err) {
    console.log(" Keep-Alive: Ping failed, but that's okay.");
  }
});

app.get("/api/health", (req, res) => res.send("I am awake!"));

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

const sendImmediateRoadmap = async (email, goal, roadmap) => {
  const roadmapList = Object.entries(roadmap)
    .map(([month, task]) => `<li><strong>${month}:</strong> ${task}</li>`)
    .join("");

  const mailOptions = {
    from: '"Visionary 2026 Vault" <no-reply@visionary.com>',
    to: email,
    subject: "🚀 MISSION ARCHITECTED: Your 2026 Roadmap is Here!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color: #4f46e5;">Hello Visionary!</h2>
        <p>You've successfully sealed your mission for the year: <strong>"${goal}"</strong>.</p>
        <p>As promised, here is your AI-architected roadmap to guide you through 2026:</p>
        <ul style="line-height: 1.6;">${roadmapList}</ul>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-style: italic; color: #666;">
          "Follow the roadmap, stay consistent, and wait for the year-end when your secret message will be unsealed."
        </p>
        <p>We'll see you in the vault on December 31, 2026. 🔒</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📩 Roadmap email sent to ${email}`);
  } catch (err) {
    console.error("❌ Failed to send immediate email:", err);
  }
};

app.post("/api/create-capsule", async (req, res) => {
  const { email, goal, note } = req.body;
  if (!email || !goal || !note) return res.status(400).json({ success: false });

  try {
    const response = await openai.chat.completions.create({
      model: "xiaomi/mimo-v2-flash:free",
      messages: [
        {
          role: "user",
          content: `Goal: "${goal}". Provide a 12-month roadmap for 2026 as a JSON object ONLY. Keys are months, values are short tasks. Format: {"January": "task", ...}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    let responseText = response.choices[0].message.content;
    const jsonString = responseText.substring(
      responseText.indexOf("{"),
      responseText.lastIndexOf("}") + 1
    );
    const roadmap = JSON.parse(jsonString);

    const secret = process.env.SECRET_KEY || "visionary_2026";
    const encryptedNote = CryptoJS.AES.encrypt(note, secret).toString();

    const newCapsule = new Capsule({ email, goal, encryptedNote, roadmap });
    await newCapsule.save();

    await sendImmediateRoadmap(email, goal, roadmap);

    res.json({
      success: true,
      message: "Mission architected and roadmap email sent successfully.",
      roadmap,
    });
  } catch (error) {
    console.error("🔥 Error:", error);
    res.status(500).json({ success: false, message: "AI Architect error." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
