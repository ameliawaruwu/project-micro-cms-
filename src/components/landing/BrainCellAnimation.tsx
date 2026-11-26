import React, { useEffect, useRef } from 'react';

const BrainCellAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const resize = () => {
      // Handle high DPI displays
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      initParticles(rect.width, rect.height);
    };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2 + 1;
      }

      update(canvasWidth: number, canvasHeight: number) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvasWidth) this.vx *= -1;
        if (this.y < 0 || this.y > canvasHeight) this.vy *= -1;
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(102, 0, 14, 0.4)'; // Maroon base color
        ctx.fill();
        
        // Add glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(102, 0, 14, 0.3)';
      }
    }

    const initParticles = (width: number, height: number) => {
      particles = [];
      const numParticles = Math.floor((width * height) / 12000); // adjust density
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle(width, height));
      }
    };

    const animate = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(rect.width, rect.height);
        particles[i].draw(ctx);

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 130) {
            ctx.beginPath();
            // Opacity decreases as distance increases
            const opacity = 0.2 - (distance / 130) * 0.2;
            ctx.strokeStyle = `rgba(102, 0, 14, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    // Initial setup with a slight delay to ensure layout is ready
    setTimeout(() => {
      resize();
      animate();
    }, 100);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none opacity-60 z-0"
    />
  );
};

export default BrainCellAnimation;
