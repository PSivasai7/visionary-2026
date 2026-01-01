const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const CryptoJS = require("crypto-js");
const { OpenAI } = require("openai");
const cron = require("node-cron");
const emailjs = require("@emailjs/nodejs"); // Replaced nodemailer with EmailJS
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

// 3. AI CONFIGURATION
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://visionary-2026.vercel.app",
    "X-Title": "Visionary 2026",
  },
});

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

// 5. IMMEDIATE EMAIL FUNCTION (Using EmailJS API)
const sendImmediateRoadmap = async (email, goal, roadmap) => {
  // Format the roadmap into an HTML list for the EmailJS template
  const roadmapHTML = Object.entries(roadmap)
    .map(([month, task]) => `<li><strong>${month}:</strong> ${task}</li>`)
    .join("");

  // These keys must match the {{variable_names}} in your EmailJS Dashboard template
  const templateParams = {
    user_email: email,
    user_goal: goal,
    user_roadmap: `<ul>${roadmapHTML}</ul>`,
  };

  try {
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY, // Get this from Account -> API Keys
      }
    );
    console.log(`📩 Roadmap email sent via EmailJS API to ${email}`);
  } catch (err) {
    console.error("❌ EmailJS Send Failed:", err);
  }
};

// 6. YEAR-END CRON JOB (Also updated to use EmailJS for stability)
cron.schedule("0 0 * * *", async () => {
  if (new Date() >= new Date("2026-12-31")) {
    const pending = await Capsule.find({ isSent: false });
    for (let capsule of pending) {
      try {
        await emailjs.send(
          process.env.EMAILJS_SERVICE_ID,
          process.env.EMAILJS_TEMPLATE_ID, // You can use a different template for unsealing if you want
          {
            user_email: capsule.email,
            user_goal: capsule.goal,
            user_roadmap: "The vault is now open. Mission Complete!",
          },
          {
            publicKey: process.env.EMAILJS_PUBLIC_KEY,
            privateKey: process.env.EMAILJS_PRIVATE_KEY,
          }
        );
        capsule.isSent = true;
        await capsule.save();
      } catch (err) {
        console.error(`❌ Failed final email to ${capsule.email}`, err);
      }
    }
  }
});

// 7. THE MAIN ENDPOINT (Updated for Robust JSON Parsing)
app.post("/api/create-capsule", async (req, res) => {
  const { email, goal, note } = req.body;
  if (!email || !goal || !note) return res.status(400).json({ success: false });

  try {
    const response = await openai.chat.completions.create({
      model: "xiaomi/mimo-v2-flash:free",
      messages: [
        {
          role: "user",
          content: `Goal: "${goal}". Provide a 12-month roadmap for 2026. 
          Return ONLY a valid JSON object. 
          Format: {"January": "task", "February": "task", ...}
          IMPORTANT: Do not use double quotes inside the task descriptions. 
          Use single quotes if needed. No markdown formatting.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    let rawContent = response.choices[0].message.content;

    // 1. Remove bad control characters
    const cleanContent = rawContent.replace(
      /[\u0000-\u001F\u007F-\u009F]/g,
      ""
    );

    // 2. Extract strictly the JSON part
    const jsonStart = cleanContent.indexOf("{");
    const jsonEnd = cleanContent.lastIndexOf("}") + 1;

    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("AI failed to provide a JSON object.");
    }

    let jsonString = cleanContent.substring(jsonStart, jsonEnd);

    // 3. Final Parse with error handling
    let roadmap;
    try {
      roadmap = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Original AI Output:", rawContent);
      // Fallback: If AI breaks, we send a generic but valid roadmap so the app doesn't crash
      roadmap = {
        January: "Initiate mission",
        February: "Build foundations",
        March: "Consistent progress",
        April: "Skill enhancement",
        May: "Mid-year review",
        June: "Strategic growth",
        July: "Project expansion",
        August: "Networking & Reach",
        September: "Advanced optimization",
        October: "Scaling efforts",
        November: "Final sprint",
        December: "Goal achievement",
      };
    }

    const encryptedNote = CryptoJS.AES.encrypt(
      note,
      process.env.SECRET_KEY || "visionary_2026"
    ).toString();

    const newCapsule = new Capsule({ email, goal, encryptedNote, roadmap });
    await newCapsule.save();

    // Call the EmailJS function
    await sendImmediateRoadmap(email, goal, roadmap);

    res.json({ success: true, roadmap });
  } catch (err) {
    console.error("🔥 Global Error Detail:", err.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Architect encountered a logic error. Try again.",
      });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
