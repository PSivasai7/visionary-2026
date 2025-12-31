import React, { useState, useEffect } from "react";
export default function App() {
  const [formData, setFormData] = useState({ email: "", goal: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isNewYear, setIsNewYear] = useState(false);

  function calculateTimeLeft() {
    const target = new Date("January 1, 2026 00:00:00").getTime();
    const now = new Date().getTime();
    const diff = target - now;
    return diff > 0 ? diff : 0;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setIsNewYear(true);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const seconds = Math.floor((ms / 1000) % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

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
      if (data.success) setRoadmap(data.roadmap);
    } catch (err) {
      alert("System Error: Vault access denied.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white flex flex-col relative overflow-x-hidden selection:bg-purple-500/30 font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] w-full h-[500px] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-full h-[500px] bg-blue-600/10 blur-[150px] rounded-full" />
      </div>

      <nav className="relative z-50 w-full p-6 flex flex-col md:flex-row justify-between items-center border-b border-white/5 backdrop-blur-xl sticky top-0">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            VISIONARY '2k26
          </h1>
        </div>

        <div
          className={`px-8 py-3 rounded-full font-black text-sm tracking-widest transition-all duration-700 shadow-2xl ${
            isNewYear
              ? "bg-emerald-500 text-white animate-bounce scale-110 shadow-transparent-500/20"
              : "bg-purple-500/10 border border-purple-500/30 text-purple-400"
          }`}
        >
          {isNewYear
            ? " HAPPY NEW YEAR 2026!"
            : `COUNTDOWN: ${formatTime(timeLeft)}`}
        </div>
      </nav>

      <main className="relative z-10 flex-grow max-w-5xl mx-auto px-6 py-16 flex flex-col items-center">
        <header className="text-center mb-16 animate-[fadeIn_1s]">
          <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.85]">
            Welcome. <br />
            <span className="text-slate-500 italic">Seal Your Future.</span>
          </h2>
          <div className="max-w-3xl mx-auto space-y-6 text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
            <p>
              "Bridge the gap between who you are today and who you intend to
              become. <strong>Visionary '26 </strong> is a hybrid AI engine
              built to make your resolution fulfill. We don't just store your
              dreams; we architect them into a 12-month tactical strategy. Seal
              your mission in our encrypted vault, and we’ll safeguard your
              roadmap until you're ready to unseal your success."
            </p>
            <p>
              Your personal message and roadmap are encrypted
              {/* via{" "} */}
              {/* <strong>AES-256</strong> */}
              and locked in our digital vault. At the end of 2026, we will
              automatically deliver this capsule back to your inbox.
            </p>
          </div>
        </header>

        {!roadmap ? (
          <div className="w-full flex flex-col items-center">
            <h3 className="text-2xl font-bold mb-8 text-center text-purple-400 uppercase tracking-[0.3em]">
              Make Your 2026 Resolution
            </h3>
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-xl bg-slate-900/40 border border-white/10 p-10 rounded-[3rem] backdrop-blur-3xl shadow-2xl hover:border-purple-500/30 transition-all duration-500"
            >
              <div className="space-y-6">
                <input
                  required
                  type="email"
                  placeholder="Enter Email: (Your Email for 2026 Delivery)"
                  className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-700"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <input
                  required
                  type="text"
                  placeholder="Your New Year Resolution Or Goal (e.g. Senior CSE Developer)"
                  className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl focus:border-purple-500/50 outline-none transition-all placeholder:text-slate-700"
                  onChange={(e) =>
                    setFormData({ ...formData, goal: e.target.value })
                  }
                />
                <textarea
                  required
                  placeholder="A private note to your Future self..."
                  className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl h-32 focus:border-purple-500/50 outline-none transition-all resize-none placeholder:text-slate-700"
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                />
                <button
                  disabled={loading}
                  className="w-full py-5 cursor-pointer bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-purple-600 hover:text-white transition-all active:scale-95 shadow-xl"
                >
                  {loading
                    ? "ARCHITECTING MISSION..."
                    : "SEAL CAPSULE & BUILD ROADMAP"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="w-full animate-[slideUp_0.6s]">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-emerald-400">
                Roadmap Architected
              </h2>
              <p className="text-slate-400 mt-4">
                This strategy is now time-locked in the vault.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(roadmap).map(([month, task]) => (
                <div
                  key={month}
                  className="p-6 bg-slate-900/60 border border-white/5 rounded-[2rem] hover:border-purple-500/40 transition-all duration-300"
                >
                  <span className="text-purple-500 text-[10px] font-black uppercase tracking-[0.3em]">
                    {month}
                  </span>
                  <p className="text-sm text-slate-300 mt-2 font-medium leading-relaxed">
                    {task}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="relative z-10 w-full py-12 text-center border-t border-white/5 bg-black/40">
        <p className="text-[10px] font-extrabold font-mono text-white-900 uppercase tracking-[0.5em]">
          Developed by <br />{" "}
          <a href="https://www.linkedin.com/in/psivasai/" target="_blank">
            {" "}
            P.SIVASAI
          </a>{" "}
        </p>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
