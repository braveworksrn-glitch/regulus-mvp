"use client";

// The hero component: a draggable before/after divider over two lot renderings.
// Demo uses inline SVG scenes instead of real drone photos (labeled simulated).

import { useCallback, useRef, useState } from "react";

function Scene({ cleared }: { cleared: boolean }) {
  return (
    <svg viewBox="0 0 400 240" className="w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="400" height="240" fill={cleared ? "#a3e635" : "#3f6212"} />
      <rect y="200" width="400" height="40" fill="#78716c" opacity="0.4" />
      {Array.from({ length: cleared ? 6 : 42 }, (_, i) => {
        const x = (i * 73) % 390;
        const y = (i * 47) % 190;
        return (
          <circle key={i} cx={x + 5} cy={y + 8} r={cleared ? 4 : 9} fill={cleared ? "#65a30d" : "#1a2e05"} />
        );
      })}
      {cleared && (
        <g>
          <rect x="20" y="20" width="360" height="200" fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="10 6" />
          <circle cx="20" cy="20" r="6" fill="#f59e0b" />
          <circle cx="380" cy="20" r="6" fill="#f59e0b" />
          <circle cx="20" cy="220" r="6" fill="#f59e0b" />
          <circle cx="380" cy="220" r="6" fill="#f59e0b" />
        </g>
      )}
      <text x="12" y="234" fontSize="12" fill="#fff" opacity="0.85">
        {cleared ? "AFTER — cleared, corners pinned (simulated)" : "BEFORE — overgrown (simulated)"}
      </text>
    </svg>
  );
}

export default function BeforeAfterScrubber() {
  const [pct, setPct] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const move = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPct(Math.min(98, Math.max(2, ((clientX - r.left) / r.width) * 100)));
  }, []);

  return (
    <div
      ref={ref}
      className="relative w-full aspect-[5/3] rounded-2xl overflow-hidden border border-stone-300 select-none touch-none cursor-ew-resize"
      onPointerDown={(e) => { dragging.current = true; move(e.clientX); }}
      onPointerMove={(e) => dragging.current && move(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => (dragging.current = false)}
    >
      <div className="absolute inset-0"><Scene cleared /></div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
        <Scene cleared={false} />
      </div>
      <div className="absolute top-0 bottom-0 w-1 bg-white shadow" style={{ left: `${pct}%` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-white shadow flex items-center justify-center text-stone-600 text-xs font-bold">
          ⇔
        </div>
      </div>
    </div>
  );
}
