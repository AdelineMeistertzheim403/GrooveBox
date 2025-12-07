import { useEffect, useRef } from "react";
import { getFFT } from "../../audio/analyser";

export default function CanvasVisualizer() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      const parent = canvas.parentElement;
      const width = parent?.clientWidth || window.innerWidth;
      const height = parent?.clientHeight || 220;
      canvas.width = width;
      canvas.height = height;
    }

    resize();
    window.addEventListener("resize", resize);

    let animationId;
    let baseHue = Math.random() * 360;
    let nextHueChange = performance.now() + 4000;

    function draw() {
      animationId = requestAnimationFrame(draw);
      const fft = getFFT();
      if (!fft || !fft.length) return;

      ctx.fillStyle = "rgba(6, 8, 14, 0.55)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const now = performance.now();
      if (now >= nextHueChange) {
        baseHue = Math.random() * 360;
        nextHueChange = now + 4000 + Math.random() * 4000;
      }

      const barWidth = canvas.width / fft.length;
      fft.forEach((v, i) => {
        const height = Math.max(2, (v + 140) * 1.2);
        ctx.fillStyle = `hsla(${(baseHue + i * 4) % 360}, 80%, 60%, 0.6)`;
        const x = i * barWidth;
        const y = canvas.height - height;
        ctx.fillRect(x, y, barWidth * 0.85, height);
      });
    }

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} />;
}