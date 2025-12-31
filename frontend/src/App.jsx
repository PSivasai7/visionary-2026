import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  ShieldCheck,
  Loader2,
  Send,
  Sparkles,
  Github,
  Linkedin,
} from "lucide-react";
import axios from "axios";

export default function App() {
  const [formData, setFormData] = useState({ email: "", goal: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Replace the URL below with your Render URL after deployment
      const res = await axios.post(
        "https://visionary-2026.onrender.com",
        formData
      );

      if (res.data.success) {
        setRoadmap(res.data.roadmap);
      } else {
        alert("Server processed request but failed to generate roadmap.");
      }
    } catch (err) {
      console.error(err);
      alert(
        "Error sealing capsule! Ensure your backend is running on port 5000."
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white font-sans selection:bg-purple-500/30 flex flex-col relative overflow-x-hidden">
      {/* 1. LAYERED BACKGROUND ANIMATION */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-purple-900/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-900/15 blur-[120px] rounded-full" />
      </div>

      {/* 2. NAVIGATION BAR */}
      <nav className="relative z-10 w-full p-6 flex justify-between items-center backdrop-blur-md border-b border-white/5">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
        >
          VISIONARY '26
        </motion.h1>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">
            AES-256 Encrypted Vault
          </div>
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </nav>

      {/* 3. MAIN CONTENT AREA */}
      <main className="relative z-10 flex-grow w-full max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {!roadmap ? (
            <motion.div
              key="form-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full flex flex-col items-center"
            >
              <div className="text-center mb-10">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-xs font-bold mb-6 inline-block uppercase tracking-wider"
                >
                  New Year's Eve Special Build
                </motion.span>
                <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none">
                  Seal Your <span className="text-slate-500">2026</span>{" "}
                  Ambition.
                </h2>
                <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed">
                  Combine Generative AI with secure encryption to architecture
                  your most successful year yet.
                </p>
              </div>

              <motion.form
                onSubmit={handleSubmit}
                className="w-full max-w-xl bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-3xl shadow-2xl relative overflow-hidden"
              >
                {/* Subtle border glow */}
                <div className="absolute inset-0 border border-purple-500/20 rounded-[2rem] pointer-events-none" />

                <div className="space-y-5">
                  <div className="group">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block group-focus-within:text-purple-400 transition-colors">
                      Digital Identity
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="email@example.com"
                      className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl focus:ring-2 ring-purple-500/50 outline-none transition-all placeholder:text-slate-600"
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="group">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block group-focus-within:text-purple-400 transition-colors">
                      The North Star Goal
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Master Salesforce Development"
                      className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl focus:ring-2 ring-purple-500/50 outline-none transition-all placeholder:text-slate-600"
                      onChange={(e) =>
                        setFormData({ ...formData, goal: e.target.value })
                      }
                    />
                  </div>

                  <div className="group">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block group-focus-within:text-purple-400 transition-colors">
                      Private Letter to 2026 Self
                    </label>
                    <textarea
                      required
                      placeholder="Why is this goal important to you?"
                      className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl h-32 focus:ring-2 ring-purple-500/50 outline-none transition-all resize-none placeholder:text-slate-600"
                      onChange={(e) =>
                        setFormData({ ...formData, note: e.target.value })
                      }
                    />
                  </div>

                  <button
                    disabled={loading}
                    className="w-full py-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all flex justify-center items-center gap-3 shadow-xl shadow-purple-900/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Lock size={18} /> Seal Capsule & Build Roadmap
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            </motion.div>
          ) : (
            <motion.div
              key="roadmap-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full space-y-12"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                  className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <ShieldCheck className="text-green-400" size={40} />
                </motion.div>
                <h2 className="text-4xl font-black mb-2 uppercase tracking-tight">
                  AI Roadmap Architected
                </h2>
                <p className="text-slate-400 max-w-lg mx-auto">
                  Your vision is now part of the 2026 vault. We've broken your
                  goal into monthly milestones.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(roadmap).map(([month, task], i) => (
                  <motion.div
                    key={month}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/[0.08] hover:border-purple-500/30 transition-all"
                  >
                    <span className="text-purple-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2 block group-hover:text-purple-400">
                      {month}
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">
                      {task}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center pt-8">
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <Sparkles size={14} className="text-purple-400" /> Create
                  Another Capsule
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 4. FOOTER */}
      <footer className="relative z-10 w-full py-8 text-center border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-xs font-medium">
            © 2025 Visionary '26 Capsule | Build 1.0.0
          </div>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Github size={18} />
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
