"use client";
import React, { useEffect, useRef, useState } from "react";
import cn from "../utils/TailwindMergeAndClsx";

interface VoiceEqualizerProps {
  isActive: boolean;
  audioContext?: AudioContext | null;
  audioSource?: MediaStreamAudioSourceNode | null;
  className?: string;
}

const VoiceEqualizer: React.FC<VoiceEqualizerProps> = ({ 
  isActive, 
  audioContext, 
  audioSource,
  className 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const [bars] = useState(64); // Number of frequency bars

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let analyzer: AnalyserNode | null = null;
    let dataArray: Uint8Array;

    // Setup audio analyzer if we have audio context and source
    if (audioContext && audioSource && isActive) {
      analyzer = audioContext.createAnalyser();
      analyzer.fftSize = bars * 2;
      analyzer.smoothingTimeConstant = 0.8;
      
      audioSource.connect(analyzer);
      analyzerRef.current = analyzer;
      
      const bufferLength = analyzer.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);
    } else {
      // Create mock data for animation when no audio
      dataArray = new Uint8Array(bars);
    }

    const draw = () => {
      if (!ctx || !canvas) return;

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      if (isActive && analyzer) {
        // Get frequency data
        analyzer.getByteFrequencyData(dataArray);
      } else if (isActive) {
        // Generate smooth animated bars when active but no audio
        const time = Date.now() * 0.001;
        for (let i = 0; i < bars; i++) {
          const wave1 = Math.sin(time + i * 0.2) * 0.5 + 0.5;
          const wave2 = Math.sin(time * 1.3 + i * 0.15) * 0.3 + 0.3;
          const wave3 = Math.sin(time * 0.7 + i * 0.25) * 0.2 + 0.2;
          dataArray[i] = Math.floor((wave1 + wave2 + wave3) * 85); // Combine waves
        }
      } else {
        // Fade out when not active
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.max(0, dataArray[i] - 5);
        }
      }

      const barWidth = (width / bars) * 0.8;
      const gap = (width / bars) * 0.2;
      const maxBarHeight = height * 0.8;

      // Draw bars
      for (let i = 0; i < bars; i++) {
        const barHeight = (dataArray[i] / 255) * maxBarHeight;
        const x = i * (barWidth + gap) + gap / 2;
        const y = (height - barHeight) / 2;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        
        // Color based on frequency range
        if (i < bars * 0.3) {
          // Low frequencies - blue to cyan
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.8)");
          gradient.addColorStop(1, "rgba(6, 182, 212, 0.9)");
        } else if (i < bars * 0.6) {
          // Mid frequencies - cyan to green
          gradient.addColorStop(0, "rgba(6, 182, 212, 0.8)");
          gradient.addColorStop(1, "rgba(34, 197, 94, 0.9)");
        } else {
          // High frequencies - green to yellow
          gradient.addColorStop(0, "rgba(34, 197, 94, 0.8)");
          gradient.addColorStop(1, "rgba(250, 204, 21, 0.9)");
        }

        ctx.fillStyle = gradient;
        
        // Draw bar with rounded corners
        const radius = Math.min(barWidth / 2, 4);
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, y + barHeight - radius);
        ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth - radius, y + barHeight);
        ctx.lineTo(x + radius, y + barHeight);
        ctx.quadraticCurveTo(x, y + barHeight, x, y + barHeight - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();

        // Add glow effect for active bars
        if (barHeight > 10) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = gradient.toString();
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (analyzerRef.current && audioSource) {
        audioSource.disconnect(analyzerRef.current);
      }
    };
  }, [isActive, bars, audioContext, audioSource]);

  return (
    <div className={cn("relative w-full h-full flex items-center justify-center", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[800px] max-h-[300px]"
        style={{ 
          background: "transparent",
        }}
      />
      {isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default VoiceEqualizer;
