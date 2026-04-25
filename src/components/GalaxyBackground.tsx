import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

export default function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    const numStars = 200;

    class Star {
      x: number;
      y: number;
      size: number;
      speed: number;
      opacity: number;
      blinkSpeed: number;

      constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5;
        this.speed = Math.random() * 0.05;
        this.opacity = Math.random();
        this.blinkSpeed = 0.005 + Math.random() * 0.01;
      }

      update(width: number, height: number) {
        this.y += this.speed;
        if (this.y > height) {
          this.y = 0;
          this.x = Math.random() * width;
        }
        this.opacity += this.blinkSpeed;
        if (this.opacity > 1 || this.opacity < 0.2) {
          this.blinkSpeed = -this.blinkSpeed;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(this.opacity)})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
      active: boolean;

      constructor() {
        this.x = 0;
        this.y = 0;
        this.length = 0;
        this.speed = 0;
        this.opacity = 0;
        this.active = false;
      }

      reset(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * (height / 2);
        this.length = 50 + Math.random() * 150;
        this.speed = 10 + Math.random() * 20;
        this.opacity = 1;
        this.active = true;
      }

      update(width: number, height: number) {
        if (!this.active) {
          if (Math.random() < 0.005) this.reset(width, height);
          return;
        }

        this.x += this.speed;
        this.y += this.speed / 2;
        this.opacity -= 0.01;

        if (this.opacity <= 0 || this.x > width || this.y > height) {
          this.active = false;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        if (!this.active) return;
        const gradient = ctx.createLinearGradient(
          this.x, this.y, 
          this.x - this.length, this.y - this.length / 2
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.length, this.y - this.length / 2);
        ctx.stroke();
      }
    }

    let shootingStars: ShootingStar[] = Array.from({ length: 3 }, () => new ShootingStar());

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: numStars }, () => new Star(canvas.width, canvas.height));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(star => {
        star.update(canvas.width, canvas.height);
        star.draw(ctx);
      });
      shootingStars.forEach(ss => {
        ss.update(canvas.width, canvas.height);
        ss.draw(ctx);
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#020617]">
      {/* Deep Space Gradients (Nebulae) */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.6, 0.4],
          rotate: [0, 10, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[20%] -left-[10%] w-[100%] h-[100%] bg-indigo-900/40 blur-[150px] rounded-full"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, -15, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-[20%] -right-[10%] w-[120%] h-[120%] bg-purple-900/50 blur-[180px] rounded-full"
      />
      <motion.div
        animate={{
          x: [-100, 100, -100],
          y: [-50, 50, -50],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 w-[80%] h-[80%] bg-blue-600/30 blur-[200px] rounded-full"
      />
      
      {/* High Colour Accents */}
      <motion.div
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-pink-500/15 blur-[120px] rounded-full"
      />
      <motion.div
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [1.2, 0.8, 1.2],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[10%] left-[20%] w-[30%] h-[30%] bg-amber-400/10 blur-[100px] rounded-full"
      />

      {/* 3D Modern Color Blobs (Figma Glass Style) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 200, -100, 0],
            y: [0, -150, 100, 0],
            scale: [1, 1.4, 0.8, 1],
            rotate: [0, 45, -45, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[15%] w-[45vw] h-[45vw] bg-linear-to-br from-indigo-500/20 to-purple-600/10 blur-[140px] rounded-full mix-blend-screen"
        />
        <motion.div
          animate={{
            x: [0, -250, 150, 0],
            y: [0, 200, -100, 0],
            scale: [1, 1.2, 1.5, 1],
            rotate: [0, -60, 30, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[10%] w-[50vw] h-[50vw] bg-linear-to-tr from-blue-600/15 to-emerald-400/10 blur-[160px] rounded-full mix-blend-screen"
        />
        <motion.div
          animate={{
            x: [0, 300, -200, 0],
            y: [0, 100, -200, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[30vw] bg-pink-500/10 blur-[130px] rounded-full mix-blend-overlay rotate-45"
        />
      </div>

      {/* Star Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-80"
      />
      
      {/* Overlay for grid/texture and Live Milky Way */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay overflow-hidden">
        {/* Milky Way Band - Enhanced with 3D depth feel */}
        <motion.div
          animate={{
            rotate: [0, 360],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            rotate: { duration: 300, repeat: Infinity, ease: "linear" },
            opacity: { duration: 12, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400%] h-[35%] bg-linear-to-r from-transparent via-blue-600/15 via-indigo-500/25 via-purple-600/20 via-white/10 via-amber-400/5 to-transparent blur-[160px] skew-y-[-12deg] pointer-events-none"
        />
        
        {/* Secondary Galaxy Core Glow - Pulsing 3D Center */}
        <motion.div
          animate={{
            scale: [0.8, 1.5, 0.8],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-400/15 blur-[200px] rounded-full"
        />
      </div>
    </div>
  );
}
