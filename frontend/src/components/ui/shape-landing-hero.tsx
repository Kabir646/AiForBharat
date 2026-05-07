"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate: rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{ width, height }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-violet-400/[0.15]",
            "shadow-[0_8px_32px_0_rgba(139,92,246,0.20)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.18),transparent_70%)]",
          )}
        />
      </motion.div>
    </motion.div>
  );
}

function HeroGeometricBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Dark base — matches project dark mode background hsl(240 20% 4%) */}
      <div
        className="absolute inset-0"
        style={{ background: "hsl(240, 20%, 4%)" }}
      />

      {/* Central ambient glow — project primary gradient-start: 262 83% 58% */}
      <div
        className="absolute inset-0 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 0%, hsl(262, 83%, 58%, 0.18) 0%, transparent 70%)",
        }}
      />

      {/* Top-right glow — gradient-mid: 272 76% 53% */}
      <div
        className="absolute -top-32 right-0 w-[700px] h-[700px] rounded-full blur-3xl opacity-60"
        style={{ background: "hsl(272, 76%, 53%, 0.14)" }}
      />

      {/* Bottom-left glow — gradient-end: 282 87% 51% */}
      <div
        className="absolute bottom-0 -left-32 w-[600px] h-[600px] rounded-full blur-3xl opacity-50"
        style={{ background: "hsl(282, 87%, 51%, 0.12)" }}
      />

      {/* ── Floating pill shapes in the project's violet/indigo/purple palette ── */}

      {/* Large — violet */}
      <ElegantShape
        delay={0.3}
        width={620}
        height={145}
        rotate={12}
        gradient="from-violet-600/[0.22]"
        className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
      />

      {/* Medium — indigo */}
      <ElegantShape
        delay={0.5}
        width={480}
        height={115}
        rotate={-15}
        gradient="from-indigo-600/[0.20]"
        className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
      />

      {/* Small — purple */}
      <ElegantShape
        delay={0.4}
        width={290}
        height={78}
        rotate={-8}
        gradient="from-purple-600/[0.20]"
        className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
      />

      {/* Tiny — fuchsia accent */}
      <ElegantShape
        delay={0.6}
        width={195}
        height={58}
        rotate={20}
        gradient="from-fuchsia-500/[0.18]"
        className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
      />

      {/* Micro — violet-400 */}
      <ElegantShape
        delay={0.7}
        width={145}
        height={40}
        rotate={-25}
        gradient="from-violet-400/[0.16]"
        className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
      />

      {/* Top + bottom fade so the hero blends into sections below */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, hsl(240,20%,4%) 0%, transparent 20%, transparent 75%, hsl(240,20%,4%) 100%)",
        }}
      />
    </div>
  );
}

export { HeroGeometricBackground, ElegantShape };
