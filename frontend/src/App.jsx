import React, { useState } from "react";

export default function App() {
  const [formData, setFormData] = useState({ email: "", goal: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        "https://visionary-2026.onrender.com/api/create-capsule",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (data.success) {
        setRoadmap(data.roadmap);
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("System Error: AI Vault is currently sealed.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white font-sans selection:bg-purple-500/30 flex flex-col relative overflow-x-hidden">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] bg-blue-600/10 blur-[150px] rounded-full" />
      </div>

      {/* HEADER */}
      <nav className="relative z-10 w-full p-6 flex justify-between items-center backdrop-blur-md border-b border-white/5">
        <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent transition-transform hover:scale-105 duration-300">
          VISIONARY '26
        </h1>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Secure Node
          </span>
        </div>
      </nav>

      <main className="relative z-10 flex-grow w-full max-w-6xl mx-auto px-6 py-12 flex flex-col items-center justify-center">
        {!roadmap ? (
          <div className="w-full flex flex-col items-center animate-[fadeIn_1s_ease-out]">
            <div className="text-center mb-10">
              <span className="px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-[10px] font-black mb-6 inline-block uppercase tracking-[0.2em]">
                Final Project of 2025
              </span>
              <h2 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9]">
                Architect <br /> Your 2026.
              </h2>
            </div>

            <form
              onSubmit={handleSubmit}
              className="w-full max-w-xl bg-slate-900/40 border border-white/10 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:border-purple-500/30"
            >
              <div className="space-y-6">
                <input
                  required
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-700"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <input
                  required
                  type="text"
                  placeholder="Your 2026 Vision Goal"
                  className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-700"
                  onChange={(e) =>
                    setFormData({ ...formData, goal: e.target.value })
                  }
                />
                <textarea
                  required
                  placeholder="Encrypted message to your future self..."
                  className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl h-32 focus:border-purple-500/50 outline-none transition-all resize-none placeholder:text-slate-700"
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                />
                <button
                  disabled={loading}
                  className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 flex justify-center items-center gap-3 hover:bg-purple-600 hover:text-white disabled:opacity-50"
                >
                  {loading ? "ARCHITECTING..." : "SEAL CAPSULE & BUILD ROADMAP"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="w-full animate-[slideUp_0.6s_ease-out]">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black uppercase tracking-tighter text-emerald-400">
                Roadmap Architected
              </h2>
              <p className="text-slate-400 mt-2">
                Your 2026 strategy is locked in the vault.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(roadmap).map(([month, task]) => (
                <div
                  key={month}
                  className="p-6 bg-white/5 border border-white/10 rounded-[2rem] hover:border-purple-500/40 transition-all"
                >
                  <span className="text-purple-500 text-[10px] font-black uppercase tracking-widest">
                    {month}
                  </span>
                  <p className="text-sm text-slate-300 mt-2 font-medium">
                    {task}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <button
                onClick={() => window.location.reload()}
                className="text-xs font-bold text-slate-500 hover:text-white underline underline-offset-8"
              >
                CREATE NEW MISSION
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 w-full py-10 border-t border-white/5 text-center">
        <p className="text-[10px] font-mono text-slate-700 uppercase tracking-[0.3em]">
          Built by Alekhya • Final Day 2025
        </p>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
