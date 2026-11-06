import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  ox: number; // offset pushed by the mouse
  oy: number;
  r: number;
  alpha: number;
  phase: number;
  twinkle: number;
  vx: number;
  vy: number;
};

type Shooter = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
};

interface StarFieldProps {
  count?: number;
  skyHeight?: number;
  repelRadius?: number;
}

export default function StarField({
  count = 140,
  skyHeight = 0.62,
  repelRadius = 130,
}: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let w = 0;
    let h = 0;
    let raf = 0;
    let stars: Star[] = [];
    const shooters: Shooter[] = [];
    const mouse = { x: -9999, y: -9999 };

    const makeStars = () => {
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * skyHeight,
        ox: 0,
        oy: 0,
        r: Math.random() * 1.4 + 0.4,
        alpha: Math.random() * 0.5 + 0.4,
        phase: Math.random() * Math.PI * 2,
        twinkle: Math.random() * 0.03 + 0.01,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.05,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeStars();
    };

    const spawnShooter = () => {
      const fromLeft = Math.random() > 0.5;
      shooters.push({
        x: fromLeft ? Math.random() * w * 0.4 : w * (0.6 + Math.random() * 0.4),
        y: Math.random() * h * 0.25,
        vx: (fromLeft ? 1 : -1) * (6 + Math.random() * 4),
        vy: 3 + Math.random() * 2.5,
        life: 1,
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const limitY = h * skyHeight;

      for (const s of stars) {
        if (!reduceMotion) {
          s.x += s.vx;
          s.y += s.vy;
          s.phase += s.twinkle;

          // wrap inside the sky area
          if (s.x < -5) s.x = w + 5;
          if (s.x > w + 5) s.x = -5;
          if (s.y < -5) s.y = limitY;
          if (s.y > limitY) s.y = -5;

          // mouse repel with a soft spring back
          const dx = s.x + s.ox - mouse.x;
          const dy = s.y + s.oy - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < repelRadius && dist > 0.1) {
            const force = (1 - dist / repelRadius) * 3;
            s.ox += (dx / dist) * force;
            s.oy += (dy / dist) * force;
          }
          s.ox *= 0.93;
          s.oy *= 0.93;
        }

        const a = s.alpha * (0.6 + 0.4 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.arc(s.x + s.ox, s.y + s.oy, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
        ctx.fill();
      }

      // shooting stars
      for (let i = shooters.length - 1; i >= 0; i--) {
        const m = shooters[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.012;
        if (m.life <= 0) {
          shooters.splice(i, 1);
          continue;
        }
        const tx = m.x - m.vx * 10;
        const ty = m.y - m.vy * 10;
        const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
        g.addColorStop(0, `rgba(255,255,255,${m.life})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }

      if (!reduceMotion) {
        if (Math.random() < 0.003 && shooters.length < 2) spawnShooter();
        raf = requestAnimationFrame(draw);
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -9999;
    };

    resize();
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [count, skyHeight, repelRadius]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}