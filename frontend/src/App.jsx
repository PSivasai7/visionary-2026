import React, { useState } from "react";
import {
  Lock,
  ShieldCheck,
  Loader2,
  Sparkles,
  Github,
  Linkedin,
  Calendar,
  Target,
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
      // Points to your Render backend
      const res = await axios.post(
        "https://visionary-2026.onrender.com/api/create-capsule",
        formData
      );

      if (res.data.success) {
        setRoadmap(res.data.roadmap);
      } else {
        alert("Server processed request but failed to generate roadmap.");
      }
    } catch (err) {
      console.error(err);
      alert("System Error: Ensure the AI vault backend is active.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white font-sans selection:bg-purple-500/30 flex flex-col relative overflow-x-hidden">
      {/* 1. NATIVE CSS BACKGROUND (No libraries needed) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-blue-600/10 blur-[150px] rounded-full" />
      </div>

      {/* 2. NAVIGATION */}
      <nav className="relative z-10 w-full p-6 flex justify-between items-center backdrop-blur-md border-b border-white/5">
        <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent transition-transform hover:scale-105 duration-300 cursor-default">
          VISIONARY '26
        </h1>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-[10px] text-slate-500 font-mono uppercase tracking-[0.3em]">
            AES-256 Protected
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        </div>
      </nav>

      {/* 3. MAIN INTERFACE */}
      <main className="relative z-10 flex-grow w-full max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center">
        {!roadmap ? (
          <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <div className="text-center mb-10">
              <span className="px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-[10px] font-black mb-6 inline-block uppercase tracking-[0.2em] shadow-inner">
                Final Sprint of 2025
              </span>
              <h2 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9]">
                Seal Your <br /> <span className="text-slate-500">2026</span>{" "}
                Ambition.
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed font-medium">
                We've combined Generative AI with high-grade encryption to
                architect your roadmap and lock it in a digital time capsule.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="w-full max-w-xl bg-slate-900/40 border border-white/10 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:border-purple-500/30 group"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Identity
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="email@example.com"
                    className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl focus:border-purple-500/50 focus:ring-4 ring-purple-500/10 outline-none transition-all placeholder:text-slate-700"
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    North Star Goal
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Master React & Node.js"
                    className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl focus:border-purple-500/50 focus:ring-4 ring-purple-500/10 outline-none transition-all placeholder:text-slate-700"
                    onChange={(e) =>
                      setFormData({ ...formData, goal: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Message to Future Self
                  </label>
                  <textarea
                    required
                    placeholder="What do you want to achieve by next year?"
                    className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl h-32 focus:border-purple-500/50 focus:ring-4 ring-purple-500/10 outline-none transition-all resize-none placeholder:text-slate-700"
                    onChange={(e) =>
                      setFormData({ ...formData, note: e.target.value })
                    }
                  />
                </div>

                <button
                  disabled={loading}
                  className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 flex justify-center items-center gap-3 hover:bg-purple-600 hover:text-white active:scale-95 disabled:opacity-50 shadow-xl shadow-white/5"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Lock size={16} /> Seal & Architect Roadmap
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="w-full animate-in fade-in zoom-in-95 duration-700">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <ShieldCheck className="text-emerald-400" size={40} />
              </div>
              <h2 className="text-4xl font-black tracking-tighter uppercase mb-4">
                Vault Secured
              </h2>
              <p className="text-slate-400 max-w-md mx-auto">
                Your 2026 roadmap has been generated and encrypted. Only your
                identity can unseal it.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(roadmap).map(([month, task], i) => (
                <div
                  key={month}
                  className="p-6 bg-white/[0.03] border border-white/10 rounded-[2rem] hover:bg-white/[0.07] hover:border-purple-500/40 transition-all duration-300 group"
                  style={{
                    animation: `fadeIn 0.5s ease-out ${i * 0.1}s forwards`,
                    opacity: 0,
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar size={12} className="text-purple-500" />
                    <span className="text-purple-500 text-[10px] font-black uppercase tracking-widest">
                      {month}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium group-hover:text-white transition-colors">
                    {task}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-12">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Target size={14} className="text-purple-400" /> New Mission
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 4. FOOTER */}
      <footer className="relative z-10 w-full py-10 border-t border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-slate-600 text-[10px] font-mono uppercase tracking-[0.2em]">
            © 2025 Visionary '26 • Built for the Final Day
          </div>
          <div className="flex gap-8 text-slate-500">
            <Github
              size={20}
              className="hover:text-white transition-colors cursor-pointer"
            />
            <Linkedin
              size={20}
              className="hover:text-white transition-colors cursor-pointer"
            />
          </div>
        </div>
      </footer>

      {/* Inline styles for the roadmap cards entrance */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
