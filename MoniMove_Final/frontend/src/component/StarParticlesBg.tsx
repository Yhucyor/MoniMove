'use client';

import { useEffect, useRef } from 'react';

interface StarParticlesBgProps {
  particleColor?: string;
  lineColor?: string;
  connectionDistance?: number;
  className?: string;
}

export default function StarParticlesBg({
  particleColor = 'rgba(0, 180, 148, 0.55)', // Teal/Green glow
  lineColor = 'rgba(18, 161, 192, 0.16)', // Cyan/Blue lines
  connectionDistance = 110,
  className = ''
}: StarParticlesBgProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      angle: number;
      spinSpeed: number;
      spikes: number;
    }

    const particles: Particle[] = [];
    const particleCount = Math.min(75, Math.floor((width * height) / 10000));

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.012,
        spikes: 4, // 4-pointed sparkle stars
      });
    }

    let mouseX = 0;
    let mouseY = 0;
    let mouseActive = false;

    // Listen on window to bypass pointer-events-none of parent wrappers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Only draw lines if mouse is inside canvas boundary
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        mouseX = x;
        mouseY = y;
        mouseActive = true;
      } else {
        mouseActive = false;
      }
    };

    const handleMouseLeave = () => {
      mouseActive = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const resizeObserver = new ResizeObserver(() => {
      if (canvas.offsetWidth && canvas.offsetHeight) {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      }
    });

    const parent = canvas.parentElement;
    if (parent) {
      resizeObserver.observe(parent);
    }

    // Helper to draw a star shape
    const drawStar = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number
    ) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      c.beginPath();
      c.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        c.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        c.lineTo(x, y);
        rot += step;
      }
      c.lineTo(cx, cy - outerRadius);
      c.closePath();
      c.fillStyle = particleColor;
      c.fill();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw and update star particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spinSpeed; // Rotate stars

        // Bounce off walls
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        
        // Draw 4-point sparkle star
        drawStar(ctx, 0, 0, p.spikes, p.radius * 3.5, p.radius * 0.9);
        
        ctx.restore();
      });

      // Draw connecting lines between stars
      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.16;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.strokeStyle = lineColor.replace(/[^,]+(?=\))/, `${alpha}`);
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }

        // Connect stars to the mouse pointer
        if (mouseActive) {
          const dx = pi.x - mouseX;
          const dy = pi.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 145) {
            const alpha = (1 - dist / 145) * 0.32;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.strokeStyle = particleColor.replace(/[^,]+(?=\))/, `${alpha}`);
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [particleColor, lineColor, connectionDistance]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-10 ${className}`}
    />
  );
}
