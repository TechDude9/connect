import { useEffect, useRef } from "react";

export const PROFILE_DECORATIONS = [
  { id: "none", label: "None", description: "No decoration" },
  { id: "sparkles", label: "✨ Sparkles", description: "Twinkling sparkles" },
  { id: "fire", label: "🔥 Fire", description: "Flame aura" },
  { id: "hearts", label: "💕 Hearts", description: "Floating hearts" },
  { id: "stars", label: "⭐ Stars", description: "Shooting stars" },
  { id: "bubbles", label: "🫧 Bubbles", description: "Rising bubbles" },
  { id: "flowers", label: "🌸 Flowers", description: "Flower petals" },
  { id: "lightning", label: "⚡ Lightning", description: "Electric sparks" },
  { id: "snow", label: "❄️ Snow", description: "Snowflakes" },
  { id: "cosmic", label: "🌀 Cosmic", description: "Cosmic rings" },
  { id: "rainbow", label: "🌈 Rainbow", description: "Rainbow glow" },
  { id: "catears", label: "🐱 Cat Ears", description: "Cute cat ears" },
] as const;

export type DecorationId = typeof PROFILE_DECORATIONS[number]["id"];

const PARTICLE_CONFIG: Record<string, { count: number; chars: string[]; colors: string[]; animClass: string }> = {
  sparkles: { count: 8, chars: ["✦", "✧", "★", "⋆"], colors: ["#fff", "#ffe", "#ffd700", "#e0f7ff"], animClass: "anim-sparkle" },
  fire: { count: 10, chars: ["🔥", "▲", "▲"], colors: ["#ff4500", "#ff6b00", "#ffa500", "#ffcc00"], animClass: "anim-fire" },
  hearts: { count: 8, chars: ["♥", "❤", "💕", "💗"], colors: ["#ff6b9d", "#ff1493", "#ff69b4", "#ff85c2"], animClass: "anim-float" },
  stars: { count: 8, chars: ["★", "⭐", "✦", "✩"], colors: ["#ffd700", "#fff", "#ffe87c", "#ffec8b"], animClass: "anim-shoot" },
  bubbles: { count: 8, chars: ["○", "◌", "⊙", "◯"], colors: ["#87ceeb", "#b0e2ff", "#add8e6", "#e0f7ff"], animClass: "anim-rise" },
  flowers: { count: 8, chars: ["🌸", "✿", "❀", "🌺"], colors: ["#ffb7c5", "#ff69b4", "#ff85c2", "#ffc0cb"], animClass: "anim-spin-fall" },
  lightning: { count: 6, chars: ["⚡", "𝓩", "↯", "ϟ"], colors: ["#ffd700", "#fff700", "#ffe500", "#ffcc00"], animClass: "anim-zap" },
  snow: { count: 10, chars: ["❄", "❅", "❆", "✳"], colors: ["#fff", "#e0f7ff", "#b0e2ff", "#e8f8ff"], animClass: "anim-snow" },
  cosmic: { count: 6, chars: ["◈", "⬡", "◉", "⊛"], colors: ["#9b59b6", "#8a2be2", "#7b68ee", "#6a5acd"], animClass: "anim-orbit" },
  rainbow: { count: 8, chars: ["◆", "●", "▲", "★"], colors: ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#8b00ff"], animClass: "anim-rainbow" },
};

interface Particle {
  id: number;
  char: string;
  color: string;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
  angle: number;
  orbitRadius?: number;
}

function generateParticles(decoId: string): Particle[] {
  const cfg = PARTICLE_CONFIG[decoId];
  if (!cfg) return [];
  return Array.from({ length: cfg.count }, (_, i) => ({
    id: i,
    char: cfg.chars[i % cfg.chars.length],
    color: cfg.colors[i % cfg.colors.length],
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: (i / cfg.count) * 2,
    duration: 1.5 + Math.random() * 2,
    size: 0.55 + Math.random() * 0.45,
    angle: (i / cfg.count) * 360,
    orbitRadius: 48 + Math.random() * 8,
  }));
}

function CatEarsDecoration({ size }: { size: number }) {
  const earSize = size * 0.28;
  return (
    <>
      <div style={{
        position: "absolute", top: -earSize * 0.8, left: size * 0.1,
        width: 0, height: 0,
        borderLeft: `${earSize * 0.5}px solid transparent`,
        borderRight: `${earSize * 0.5}px solid transparent`,
        borderBottom: `${earSize}px solid #ff9ec6`,
        filter: "drop-shadow(0 0 4px #ff6ba8)",
      }} />
      <div style={{
        position: "absolute", top: -earSize * 0.8, right: size * 0.1,
        width: 0, height: 0,
        borderLeft: `${earSize * 0.5}px solid transparent`,
        borderRight: `${earSize * 0.5}px solid transparent`,
        borderBottom: `${earSize}px solid #ff9ec6`,
        filter: "drop-shadow(0 0 4px #ff6ba8)",
      }} />
    </>
  );
}

interface ProfileDecorationProps {
  decorationId: string | null | undefined;
  size?: number;
  children: React.ReactNode;
}

export function ProfileDecoration({ decorationId, size = 56, children }: ProfileDecorationProps) {
  const particles = useRef<Particle[]>([]);

  if (decorationId && decorationId !== "none" && PARTICLE_CONFIG[decorationId]) {
    if (particles.current.length === 0) {
      particles.current = generateParticles(decorationId);
    }
  }

  if (!decorationId || decorationId === "none") {
    return <>{children}</>;
  }

  if (decorationId === "catears") {
    return (
      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <CatEarsDecoration size={size} />
        {children}
      </div>
    );
  }

  const cfg = PARTICLE_CONFIG[decorationId];
  if (!cfg) return <>{children}</>;

  const parts = particles.current.length > 0 ? particles.current : generateParticles(decorationId);

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @keyframes anim-sparkle {
          0% { opacity: 0; transform: scale(0) rotate(0deg) translateY(0); }
          50% { opacity: 1; transform: scale(1.2) rotate(180deg) translateY(-8px); }
          100% { opacity: 0; transform: scale(0) rotate(360deg) translateY(-16px); }
        }
        @keyframes anim-fire {
          0% { opacity: 0.8; transform: translateY(0) scale(1); }
          50% { opacity: 1; transform: translateY(-12px) scale(0.8); }
          100% { opacity: 0; transform: translateY(-20px) scale(0.4); }
        }
        @keyframes anim-float {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          30% { opacity: 1; transform: translateY(-8px) scale(1); }
          100% { opacity: 0; transform: translateY(-22px) scale(0.7) rotate(20deg); }
        }
        @keyframes anim-shoot {
          0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
          50% { opacity: 1; transform: translate(-10px, -10px) scale(1.3); }
          100% { opacity: 0; transform: translate(-20px, -20px) scale(0.2); }
        }
        @keyframes anim-rise {
          0% { opacity: 0.9; transform: translateY(0) scale(0.8); }
          50% { opacity: 0.7; transform: translateY(-14px) scale(1.1); }
          100% { opacity: 0; transform: translateY(-28px) scale(0.6); }
        }
        @keyframes anim-spin-fall {
          0% { opacity: 0; transform: rotate(0deg) translateY(0) scale(0.5); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: rotate(360deg) translateY(20px) scale(0.8); }
        }
        @keyframes anim-zap {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          20%, 80% { opacity: 1; transform: scale(1.4); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }
        @keyframes anim-snow {
          0% { opacity: 0.9; transform: translateY(0) rotate(0deg); }
          50% { opacity: 0.7; transform: translateY(12px) rotate(180deg); }
          100% { opacity: 0; transform: translateY(24px) rotate(360deg); }
        }
        @keyframes anim-orbit {
          0% { transform: rotate(var(--orbit-start)) translateX(var(--orbit-r)) rotate(calc(-1 * var(--orbit-start))); opacity: 0.9; }
          50% { opacity: 1; }
          100% { transform: rotate(calc(var(--orbit-start) + 360deg)) translateX(var(--orbit-r)) rotate(calc(-1 * (var(--orbit-start) + 360deg))); opacity: 0.9; }
        }
        @keyframes anim-rainbow {
          0% { opacity: 1; filter: hue-rotate(0deg); }
          50% { opacity: 0.8; filter: hue-rotate(180deg); }
          100% { opacity: 1; filter: hue-rotate(360deg); }
        }
      `}</style>

      {parts.map((p) => {
        const isOrbit = decorationId === "cosmic";
        const isBelow = decorationId === "snow" || decorationId === "flowers";

        let particleStyle: React.CSSProperties = {
          position: "absolute",
          fontSize: `${p.size * 12}px`,
          color: p.color,
          pointerEvents: "none",
          zIndex: 10,
          animationName: cfg.animClass,
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
          animationIterationCount: "infinite",
          animationTimingFunction: "ease-in-out",
        };

        if (isOrbit) {
          particleStyle = {
            ...particleStyle,
            top: "50%",
            left: "50%",
            marginTop: -6,
            marginLeft: -6,
            transformOrigin: "0 0",
            animationName: "anim-orbit",
            ["--orbit-start" as any]: `${p.angle}deg`,
            ["--orbit-r" as any]: `${p.orbitRadius}px`,
          };
        } else {
          const angle = (p.angle * Math.PI) / 180;
          const r = size / 2 + 4;
          const cx = 50 + (r / size) * 100 * Math.cos(angle);
          const cy = 50 + (r / size) * 100 * Math.sin(angle);
          particleStyle.left = `${cx}%`;
          particleStyle.top = isBelow ? `${80 + Math.random() * 20}%` : `${cy}%`;
          particleStyle.transform = "translate(-50%, -50%)";
        }

        return (
          <span key={p.id} style={particleStyle}>
            {p.char}
          </span>
        );
      })}
      {children}
    </div>
  );
}

export const ROOM_THEMES = [
  { id: "none", label: "Default", description: "Standard theme", bg: "" },
  { id: "neon", label: "⚡ Neon City", description: "Cyan & purple neon glow", bg: "neon" },
  { id: "galaxy", label: "🌌 Galaxy", description: "Deep space starfield", bg: "galaxy" },
  { id: "sunset", label: "🌅 Sunset", description: "Warm orange glow", bg: "sunset" },
  { id: "forest", label: "🌿 Forest", description: "Green nature vibes", bg: "forest" },
  { id: "cyberpunk", label: "🤖 Cyberpunk", description: "Yellow & cyan grid", bg: "cyberpunk" },
  { id: "ocean", label: "🌊 Ocean", description: "Deep blue waves", bg: "ocean" },
  { id: "cherry", label: "🌸 Cherry Blossom", description: "Pink floral dream", bg: "cherry" },
] as const;

export type RoomThemeId = typeof ROOM_THEMES[number]["id"];

export function getRoomThemeStyle(themeId: string | null | undefined): React.CSSProperties {
  switch (themeId) {
    case "neon":
      return { background: "linear-gradient(135deg, #0a0a1a 0%, #0d1b2a 50%, #0a0a1a 100%)", boxShadow: "inset 0 0 60px rgba(0,255,255,0.05)" };
    case "galaxy":
      return { background: "linear-gradient(135deg, #0b0c10 0%, #1f2041 40%, #0d0d2b 100%)" };
    case "sunset":
      return { background: "linear-gradient(135deg, #1a0a00 0%, #2d1200 40%, #1a0500 100%)" };
    case "forest":
      return { background: "linear-gradient(135deg, #021a0a 0%, #042a12 40%, #021508 100%)" };
    case "cyberpunk":
      return { background: "linear-gradient(135deg, #0a0a00 0%, #141400 40%, #0a0800 100%)" };
    case "ocean":
      return { background: "linear-gradient(135deg, #00071a 0%, #001240 40%, #00071a 100%)" };
    case "cherry":
      return { background: "linear-gradient(135deg, #1a0010 0%, #2a0018 40%, #1a000e 100%)" };
    default:
      return {};
  }
}

export function RoomThemeOverlay({ themeId }: { themeId: string | null | undefined }) {
  if (!themeId || themeId === "none") return null;
  switch (themeId) {
    case "neon":
      return (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
          <div style={{ position: "absolute", top: -100, left: -100, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,255,0.06) 0%, transparent 70%)", animation: "pulse 4s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: -80, right: -80, width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(150,0,255,0.06) 0%, transparent 70%)", animation: "pulse 4s ease-in-out infinite 2s" }} />
        </div>
      );
    case "galaxy":
      return (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              width: 2 + Math.random() * 2,
              height: 2 + Math.random() * 2,
              borderRadius: "50%",
              background: "#fff",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.3 + Math.random() * 0.5,
              animation: `pulse ${2 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 2}s`,
            }} />
          ))}
        </div>
      );
    case "cyberpunk":
      return (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0, opacity: 0.15 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute", top: 0, bottom: 0, left: `${i * 12.5}%`,
              borderLeft: "1px solid #ffd700", opacity: 0.3,
            }} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute", left: 0, right: 0, top: `${i * 16.7}%`,
              borderTop: "1px solid #00ffff", opacity: 0.2,
            }} />
          ))}
        </div>
      );
    case "cherry":
      return (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              fontSize: 16 + Math.random() * 12,
              top: `${-10 + Math.random() * 20}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.6,
              animation: `anim-spin-fall ${3 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 3}s`,
            }}>🌸</div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export function getRoomThemeBorderClass(themeId: string | null | undefined): string {
  switch (themeId) {
    case "neon": return "from-cyan-400 to-purple-500";
    case "galaxy": return "from-indigo-500 to-purple-700";
    case "sunset": return "from-orange-400 to-red-500";
    case "forest": return "from-green-400 to-emerald-600";
    case "cyberpunk": return "from-yellow-400 to-cyan-400";
    case "ocean": return "from-blue-400 to-cyan-600";
    case "cherry": return "from-pink-400 to-rose-500";
    default: return "from-cyan-500 to-purple-500";
  }
}
