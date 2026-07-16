'use client';

import React, { useEffect, useState } from 'react';

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2200); // 2.2 seconds loading animation

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050b14] transition-all duration-700 ease-in-out">
      
      {/* 🔮 Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* 🔷 Center Container */}
      <div className="flex flex-col items-center select-none text-center">
        
        {/* SVG Animating V-Logo */}
        <div className="w-24 h-24 mb-6 relative animate-bounce" style={{ animationDuration: '2s' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" className="w-full h-full filter drop-shadow-[0_0_30px_rgba(0,114,255,0.4)]">
            <defs>
              <linearGradient id="leftGrad" x1="150" y1="50" x2="280" y2="350" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#021E73" />
                <stop offset="60%" stopColor="#0052D4" />
                <stop offset="100%" stopColor="#0072FF" />
              </linearGradient>
              <linearGradient id="rightGrad" x1="280" y1="350" x2="400" y2="50" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0052D4" />
                <stop offset="40%" stopColor="#0072FF" />
                <stop offset="100%" stopColor="#00D2FF" />
              </linearGradient>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="-4" dy="6" stdDeviation="8" floodColor="#010A26" floodOpacity="0.6"/>
              </filter>
            </defs>

            {/* Left Ribbon */}
            <path 
              d="M 160 80 C 180 80, 240 180, 275 270 C 285 295, 290 320, 270 320 C 250 320, 210 240, 185 190 Z" 
              fill="url(#leftGrad)" 
              className="animate-[dash_2s_ease-in-out_infinite]"
              style={{
                strokeDasharray: 1000,
                strokeDashoffset: 1000,
                animation: 'drawLogo 1.8s forwards'
              }}
            />

            {/* Right Ribbon */}
            <path 
              d="M 270 320 C 290 320, 310 280, 325 240 C 350 170, 390 80, 410 80 L 360 80 C 340 120, 300 220, 275 270 C 265 290, 260 320, 270 320 Z" 
              fill="url(#rightGrad)" 
              filter="url(#shadow)"
              style={{
                strokeDasharray: 1000,
                strokeDashoffset: 1000,
                animation: 'drawLogo 1.8s forwards',
                animationDelay: '0.2s'
              }}
            />
          </svg>
        </div>

        {/* Brand Text Loader */}
        <h1 className="text-2xl font-black tracking-[0.25em] text-white flex items-center gap-0.5 justify-center pl-1.5 uppercase">
          VELI<span className="text-[#00D2FF]">ZO</span>
        </h1>
        
        {/* Subtitle / Tagline */}
        <p className="text-[10px] text-slate-500 font-semibold tracking-[0.3em] uppercase mt-2 select-none">
          Global Talent Ecosystem
        </p>

        {/* Horizontal Loading Bar */}
        <div className="w-32 bg-slate-900 h-[3px] rounded-full mt-6 overflow-hidden border border-slate-800/40">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full animate-[loadingProgress_1.8s_ease-out_forwards]" />
        </div>

      </div>

      {/* 🎨 Inline Styles for Keyframe Animations */}
      <style jsx global>{`
        @keyframes drawLogo {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes loadingProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

    </div>
  );
}
