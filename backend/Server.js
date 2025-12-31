const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const CryptoJS = require("crypto-js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(" Connected to MongoDB Atlas"))
  .catch((err) => console.error(" DB Connection Error:", err));

const CapsuleSchema = new mongoose.Schema({
  email: { type: String, required: true },
  goal: { type: String, required: true },
  encryptedNote: { type: String, required: true },
  roadmap: { type: Object, required: true },
  isSent: { type: Boolean, default: false }, // Tracks if 2026 alert was sent
  unsealDate: { type: Date, default: new Date("2026-12-31T23:59:59") },
  createdAt: { type: Date, default: Date.now },
});

const Capsule = mongoose.model("Capsule", CapsuleSchema);

// 3. AI CONFIGURATION
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SYSTEM_EMAIL,
    pass: process.env.SYSTEM_PASSWORD,
  },
});

cron.schedule("0 0 * * *", async () => {
  const today = new Date();
  const targetDate = new Date("2026-12-31");

  if (today >= targetDate) {
    const pendingCapsules = await Capsule.find({ isSent: false });
    console.log(
      `Checking vault... ${pendingCapsules.length} capsules pending.`
    );

    for (let capsule of pendingCapsules) {
      try {
        await transporter.sendMail({
          from: '"Visionary 2026 Vault" <no-reply@visionary.com>',
          to: capsule.email,
          subject: "🔓 MISSION UNSEALED: Your 2026 Time Capsule is Ready!",
          html: `<div style="padding:20px; font-family:sans-serif;">
                  <h2>Hello Visionary!</h2>
                  <p>One year ago, you set the goal: <strong>${capsule.goal}</strong>.</p>
                  <p>The time has come to unseal your message and see your results. Happy 2027!</p>
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

app.post("/api/create-capsule", async (req, res) => {
  const { email, goal, note } = req.body;

  if (!email || !goal || !note) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Goal: "${goal}". Provide a 12-month roadmap for 2026 as a JSON object ONLY. Keys are months, values are short tasks. Format: {"January": "task", ...}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonString = responseText.substring(
      responseText.indexOf("{"),
      responseText.lastIndexOf("}") + 1
    );
    const roadmap = JSON.parse(jsonString);

    const secret = process.env.SECRET_KEY || "temporary_backup_key_2026";
    const encryptedNote = CryptoJS.AES.encrypt(note, secret).toString();

    const newCapsule = new Capsule({ email, goal, encryptedNote, roadmap });
    await newCapsule.save();

    res.json({ success: true, roadmap });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
