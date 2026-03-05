# Visionary '2k26 🚀

An AI-powered time capsule and resolution tracker built to help users crush their New Year's goals by generating a structured, personalized 12-month roadmap. 

## Features ✨

* **AI-Generated Roadmaps:** Integrates OpenRouter (Llama 3 / Xiaomi MiMo) to provide stable, actionable, and free 12-month resolution plans.
* **Secure Private Notes:** User notes and reflections are encrypted using AES-256 to ensure complete privacy.
* **Automated Email Alerts:** Utilizes `node-cron` to automatically send year-end email reminders and time capsule reveals to users.
* **Engaging UX:** Features a live New Year countdown and sends an immediate email confirmation containing the generated roadmap upon submission.
* **Always-On Backend:** Includes a built-in "Keep-Alive" system using `node-cron` to prevent the Render server from spinning down due to inactivity.

## Tech Stack 💻

* **Frontend:** React, Tailwind CSS v4
* **Backend:** Node.js, Express.js
* **Database:** MongoDB
* **AI Integration:** OpenRouter API
* **Task Scheduling:** node-cron
* **Security:** AES-256 Encryption

## Getting Started 🛠️

### Prerequisites

* Node.js installed on your local machine
* A MongoDB connection URI
* An OpenRouter API Key
* An SMTP email service setup (e.g., Nodemailer with Gmail/SendGrid)

### Installation

1. Clone the repository:
```bash
git clone [https://github.com/yourusername/visionary-2k26.git](https://github.com/yourusername/visionary-2k26.git)
cd visionary-2k26
