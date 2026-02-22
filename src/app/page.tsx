"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IDE from "@/components/IDE";

function Typewriter({ text, delay = 0, speed = 50, onDone }: { text: string; delay?: number; speed?: number; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length < text.length) {
      const t = setTimeout(() => setDisplayed(text.slice(0, displayed.length + 1)), speed);
      return () => clearTimeout(t);
    } else {
      onDone?.();
    }
  }, [started, displayed, text, speed, onDone]);

  if (!started) return null;
  return (
    <span>
      {displayed}
      {displayed.length < text.length && <span className="cursor-blink text-blue-400">|</span>}
    </span>
  );
}

export default function Home() {
  const [phase, setPhase] = useState(0);
  const [showIDE, setShowIDE] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  if (showIDE) {
    return <IDE />;
  }

  return (
    <AnimatePresence>
      {!transitioning ? (
        <motion.div
          className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden"
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background grid effect */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(0,122,204,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,122,204,0.3) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
          </div>

          {/* Radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[100px]" />

          <div className="relative z-10 text-center max-w-2xl px-8">
            {/* Phase 0: Hey Sis */}
            <h1 className="text-6xl md:text-7xl font-bold mb-8 text-white glow">
              <Typewriter text="Hey Sis 👋" speed={80} onDone={() => setTimeout(() => setPhase(1), 800)} />
            </h1>

            {/* Phase 1 */}
            {phase >= 1 && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-xl md:text-2xl text-gray-400 mb-6"
              >
                <Typewriter
                  text="Your brother mentioned you weren't too impressed with AI..."
                  delay={200}
                  speed={35}
                  onDone={() => setTimeout(() => setPhase(2), 600)}
                />
              </motion.p>
            )}

            {/* Phase 2 */}
            {phase >= 2 && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-2xl md:text-3xl text-white font-semibold mb-12 glow-subtle"
              >
                <Typewriter text="So we built you this." delay={200} speed={45} onDone={() => setTimeout(() => setPhase(3), 400)} />
              </motion.p>
            )}

            {/* Phase 3: Button */}
            {phase >= 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <button
                  onClick={() => {
                    setTransitioning(true);
                    setTimeout(() => setShowIDE(true), 800);
                  }}
                  className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-lg font-semibold rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-105"
                >
                  See What AI Built →
                  <span className="absolute inset-0 rounded-lg bg-blue-400/20 blur-xl group-hover:bg-blue-400/30 transition-all -z-10" />
                </button>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 0.4 : 0 }}
            className="absolute bottom-6 text-sm text-gray-500 text-center px-4"
          >
            Built by Zoe (AI) in ~15 minutes. No humans were mass-unemployed in the making of this app. 😘
          </motion.p>

          {/* Easter egg */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 3 ? 0.3 : 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-6 right-6 text-xs text-gray-600 max-w-xs text-right hidden md:block"
          >
            P.S. — AI isn&apos;t here to take your job. It&apos;s here to make you mass-dangerous. Use it as a tool, not a threat. 💪
          </motion.p>

          {/* Mobile warning */}
          <div className="md:hidden absolute top-4 left-4 right-4 text-center text-xs text-gray-600 bg-gray-900/50 rounded-lg p-2">
            CodeVerse is best experienced on desktop 💻
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen bg-[#0a0a0a]"
        />
      )}
    </AnimatePresence>
  );
}
