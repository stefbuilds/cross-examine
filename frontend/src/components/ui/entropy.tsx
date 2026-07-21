// Order-vs-chaos particle field (21st.dev "Entropy").
// The particle simulation, neighbor coupling, and connective lines are preserved
// from the supplied source. Adaptations (permitted by the owner): the hardcoded
// black background and white particle color are parameterized to a theme color so
// it sits on Cross-Examine surfaces, and a reduced-motion static frame is drawn
// instead of the animation loop.
"use client";
import { useEffect, useRef } from "react";

interface EntropyProps {
  className?: string;
  size?: number;
  /** 6-digit hex particle color; defaults to the Cross-Examine primary. */
  color?: string;
}

export function Entropy({ className = "", size = 400, color = "#7f76ca" }: EntropyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const particleColor = color;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    class Particle {
      x: number;
      y: number;
      size: number;
      order: boolean;
      velocity: { x: number; y: number };
      originalX: number;
      originalY: number;
      influence: number;
      neighbors: Particle[];

      constructor(x: number, y: number, order: boolean) {
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.size = 2;
        this.order = order;
        this.velocity = {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        };
        this.influence = 0;
        this.neighbors = [];
      }

      update() {
        if (this.order) {
          const dx = this.originalX - this.x;
          const dy = this.originalY - this.y;

          const chaosInfluence = { x: 0, y: 0 };
          this.neighbors.forEach((neighbor) => {
            if (!neighbor.order) {
              const distance = Math.hypot(this.x - neighbor.x, this.y - neighbor.y);
              const strength = Math.max(0, 1 - distance / 100);
              chaosInfluence.x += neighbor.velocity.x * strength;
              chaosInfluence.y += neighbor.velocity.y * strength;
              this.influence = Math.max(this.influence, strength);
            }
          });

          this.x += dx * 0.05 * (1 - this.influence) + chaosInfluence.x * this.influence;
          this.y += dy * 0.05 * (1 - this.influence) + chaosInfluence.y * this.influence;

          this.influence *= 0.99;
        } else {
          this.velocity.x += (Math.random() - 0.5) * 0.5;
          this.velocity.y += (Math.random() - 0.5) * 0.5;
          this.velocity.x *= 0.95;
          this.velocity.y *= 0.95;
          this.x += this.velocity.x;
          this.y += this.velocity.y;

          if (this.x < size / 2 || this.x > size) this.velocity.x *= -1;
          if (this.y < 0 || this.y > size) this.velocity.y *= -1;
          this.x = Math.max(size / 2, Math.min(size, this.x));
          this.y = Math.max(0, Math.min(size, this.y));
        }
      }

      draw(context: CanvasRenderingContext2D) {
        const alpha = this.order ? 0.8 - this.influence * 0.5 : 0.8;
        context.fillStyle = `${particleColor}${Math.round(alpha * 255)
          .toString(16)
          .padStart(2, "0")}`;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
      }
    }

    const particles: Particle[] = [];
    const gridSize = 25;
    const spacing = size / gridSize;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = spacing * i + spacing / 2;
        const y = spacing * j + spacing / 2;
        const order = x < size / 2;
        particles.push(new Particle(x, y, order));
      }
    }

    function updateNeighbors() {
      particles.forEach((particle) => {
        particle.neighbors = particles.filter((other) => {
          if (other === particle) return false;
          const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
          return distance < 100;
        });
      });
    }

    let time = 0;
    let animationId: number;

    function render() {
      ctx!.clearRect(0, 0, size, size);

      if (time % 30 === 0) {
        updateNeighbors();
      }

      particles.forEach((particle) => {
        particle.update();
        particle.draw(ctx!);

        particle.neighbors.forEach((neighbor) => {
          const distance = Math.hypot(particle.x - neighbor.x, particle.y - neighbor.y);
          if (distance < 50) {
            const alpha = 0.2 * (1 - distance / 50);
            ctx!.strokeStyle = `${particleColor}${Math.round(alpha * 255)
              .toString(16)
              .padStart(2, "0")}`;
            ctx!.beginPath();
            ctx!.moveTo(particle.x, particle.y);
            ctx!.lineTo(neighbor.x, neighbor.y);
            ctx!.stroke();
          }
        });
      });

      ctx!.strokeStyle = `${particleColor}4D`;
      ctx!.lineWidth = 0.5;
      ctx!.beginPath();
      ctx!.moveTo(size / 2, 0);
      ctx!.lineTo(size / 2, size);
      ctx!.stroke();

      time++;
    }

    if (reduceMotion) {
      updateNeighbors();
      render();
      return;
    }

    function animate() {
      render();
      animationId = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [size, color]);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
}
