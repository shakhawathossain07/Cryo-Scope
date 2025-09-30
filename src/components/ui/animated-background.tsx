'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  className?: string;
}

export function AnimatedBackground({ className }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const gridRef = useRef<GridPoint[]>([]);
  const scanLinesRef = useRef<ScanLine[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeElements();
    };

    const initializeElements = () => {
      // Initialize particles
      particlesRef.current = [];
      for (let i = 0; i < 100; i++) {
        particlesRef.current.push(new Particle(canvas.width, canvas.height));
      }

      // Initialize grid points
      gridRef.current = [];
      const gridSpacing = 50;
      for (let x = 0; x < canvas.width; x += gridSpacing) {
        for (let y = 0; y < canvas.height; y += gridSpacing) {
          gridRef.current.push(new GridPoint(x, y));
        }
      }

      // Initialize scan lines
      scanLinesRef.current = [];
      for (let i = 0; i < 3; i++) {
        scanLinesRef.current.push(new ScanLine(canvas.width, canvas.height));
      }
    };

    const animate = (timestamp: number) => {
      ctx.fillStyle = 'rgba(2, 8, 23, 0.05)'; // Dark blue with low opacity for trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      drawGrid(ctx, timestamp);

      // Draw particles
      particlesRef.current.forEach(particle => {
        particle.update(canvas.width, canvas.height);
        particle.draw(ctx);
      });

      // Draw scan lines
      scanLinesRef.current.forEach(scanLine => {
        scanLine.update(canvas.width, canvas.height);
        scanLine.draw(ctx);
      });

      // Draw circuit patterns
      drawCircuitPatterns(ctx, timestamp);

      // Draw data streams
      drawDataStreams(ctx, timestamp);

      animationRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate(0);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'fixed inset-0 -z-10 pointer-events-none',
        'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900',
        className
      )}
    />
  );
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  type: 'data' | 'energy' | 'scan';

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2;
    this.size = Math.random() * 3 + 1;
    this.opacity = Math.random() * 0.8 + 0.2;
    
    const types: Array<'data' | 'energy' | 'scan'> = ['data', 'energy', 'scan'];
    this.type = types[Math.floor(Math.random() * types.length)];
    
    switch (this.type) {
      case 'data':
        this.color = '#0ea5e9'; // Sky blue for data
        break;
      case 'energy':
        this.color = '#10b981'; // Emerald for energy
        break;
      case 'scan':
        this.color = '#f59e0b'; // Amber for scan
        break;
    }
  }

  update(canvasWidth: number, canvasHeight: number) {
    this.x += this.vx;
    this.y += this.vy;

    // Wrap around edges
    if (this.x < 0) this.x = canvasWidth;
    if (this.x > canvasWidth) this.x = 0;
    if (this.y < 0) this.y = canvasHeight;
    if (this.y > canvasHeight) this.y = 0;

    // Pulsing opacity
    this.opacity = 0.3 + Math.sin(Date.now() * 0.001 + this.x * 0.01) * 0.3;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    
    if (this.type === 'data') {
      // Draw data particle as glowing dot
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(this.x - this.size * 3, this.y - this.size * 3, this.size * 6, this.size * 6);
    } else {
      // Draw energy/scan particles as glowing circles
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }
}

class GridPoint {
  x: number;
  y: number;
  intensity: number;
  phase: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.intensity = Math.random();
    this.phase = Math.random() * Math.PI * 2;
  }
}

class ScanLine {
  x: number;
  y: number;
  direction: 'horizontal' | 'vertical';
  speed: number;
  opacity: number;
  width: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
    this.speed = Math.random() * 3 + 1;
    this.opacity = Math.random() * 0.3 + 0.1;
    this.width = Math.random() * 2 + 1;

    if (this.direction === 'horizontal') {
      this.x = 0;
      this.y = Math.random() * canvasHeight;
    } else {
      this.x = Math.random() * canvasWidth;
      this.y = 0;
    }
  }

  update(canvasWidth: number, canvasHeight: number) {
    if (this.direction === 'horizontal') {
      this.x += this.speed;
      if (this.x > canvasWidth + 100) {
        this.x = -100;
        this.y = Math.random() * canvasHeight;
      }
    } else {
      this.y += this.speed;
      if (this.y > canvasHeight + 100) {
        this.y = -100;
        this.x = Math.random() * canvasWidth;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = this.width;
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#0ea5e9';

    ctx.beginPath();
    if (this.direction === 'horizontal') {
      ctx.moveTo(this.x - 50, this.y);
      ctx.lineTo(this.x + 50, this.y);
    } else {
      ctx.moveTo(this.x, this.y - 50);
      ctx.lineTo(this.x, this.y + 50);
    }
    ctx.stroke();
    ctx.restore();
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, timestamp: number) {
  ctx.save();
  ctx.strokeStyle = 'rgba(14, 165, 233, 0.1)';
  ctx.lineWidth = 1;

  const gridSize = 50;
  const pulseIntensity = Math.sin(timestamp * 0.001) * 0.3 + 0.7;

  // Vertical lines
  for (let x = 0; x < ctx.canvas.width; x += gridSize) {
    ctx.globalAlpha = pulseIntensity * 0.2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ctx.canvas.height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y < ctx.canvas.height; y += gridSize) {
    ctx.globalAlpha = pulseIntensity * 0.2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ctx.canvas.width, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawCircuitPatterns(ctx: CanvasRenderingContext2D, timestamp: number) {
  ctx.save();
  
  const time = timestamp * 0.001;
  const patterns = [
    { x: 100, y: 100, size: 80, rotation: time * 0.5 },
    { x: ctx.canvas.width - 150, y: 150, size: 60, rotation: -time * 0.3 },
    { x: 200, y: ctx.canvas.height - 200, size: 100, rotation: time * 0.8 },
  ];

  patterns.forEach(pattern => {
    ctx.save();
    ctx.translate(pattern.x, pattern.y);
    ctx.rotate(pattern.rotation);
    
    // Draw circuit pattern
    ctx.strokeStyle = `rgba(16, 185, 129, ${0.3 + Math.sin(time * 2) * 0.2})`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#10b981';

    const size = pattern.size;
    ctx.beginPath();
    // Hexagonal circuit pattern
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Inner connections
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x1 = Math.cos(angle) * size * 0.3;
      const y1 = Math.sin(angle) * size * 0.3;
      const x2 = Math.cos(angle) * size * 0.7;
      const y2 = Math.sin(angle) * size * 0.7;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();

    ctx.restore();
  });

  ctx.restore();
}

function drawDataStreams(ctx: CanvasRenderingContext2D, timestamp: number) {
  ctx.save();
  
  const time = timestamp * 0.001;
  const streams = [
    { startX: 0, startY: 200 + Math.sin(time) * 50, endX: ctx.canvas.width, endY: 400 + Math.cos(time * 1.2) * 80 },
    { startX: ctx.canvas.width, startY: 300 + Math.cos(time * 0.8) * 60, endX: 0, endY: 150 + Math.sin(time * 1.5) * 70 },
  ];

  streams.forEach((stream, index) => {
    const gradient = ctx.createLinearGradient(stream.startX, stream.startY, stream.endX, stream.endY);
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0)');
    gradient.addColorStop(0.5, `rgba(245, 158, 11, ${0.6 + Math.sin(time * 3 + index) * 0.3})`);
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#f59e0b';

    ctx.beginPath();
    ctx.moveTo(stream.startX, stream.startY);
    
    // Create curved data stream
    const midX = (stream.startX + stream.endX) / 2;
    const midY = (stream.startY + stream.endY) / 2 + Math.sin(time * 2 + index) * 100;
    
    ctx.quadraticCurveTo(midX, midY, stream.endX, stream.endY);
    ctx.stroke();

    // Draw data packets along the stream
    for (let i = 0; i < 5; i++) {
      const t = (time * 0.5 + i * 0.2) % 1;
      const x = stream.startX + (stream.endX - stream.startX) * t;
      const y = stream.startY + (stream.endY - stream.startY) * t + Math.sin(time * 2 + index) * 100 * (1 - Math.abs(t - 0.5) * 2);
      
      ctx.fillStyle = `rgba(245, 158, 11, ${0.8 - t * 0.5})`;
      ctx.shadowBlur = 10;
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }
  });

  ctx.restore();
}