'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

const statuses = [
  'Initializing Secure Connection...',
  'Establishing Career Trust Protocol...',
  'Syncing Verification Nodes...',
  'Opening Global Gateway...'
];

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // Cycle through high-tech verification status messages
    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev < statuses.length - 1 ? prev + 1 : prev));
    }, 500);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2200); // 2.2 seconds loading animation

    return () => {
      clearInterval(statusInterval);
      clearTimeout(timer);
    };
  }, []);

  if (!mounted) return null;
  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-all duration-700 ease-in-out">
      
      {/* 🔮 Professional Ambient Light Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/5 rounded-full blur-[100px] animate-pulse delay-1000" />

      {/* 🔷 Center Container */}
      <div className="flex flex-col items-center select-none text-center px-6 relative z-10">
        
        {/* Animated Brand Logo */}
        <div className="w-20 h-20 mb-6 relative animate-pulse" style={{ animationDuration: '2s' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 400" className="w-full h-full filter drop-shadow-[0_4px_12px_rgba(10,102,194,0.1)]">
            <defs>
              <linearGradient id="leftGrad" x1="150" y1="50" x2="280" y2="350" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0A66C2" />
                <stop offset="100%" stopColor="#0052D4" />
              </linearGradient>
              <linearGradient id="rightGrad" x1="280" y1="350" x2="400" y2="50" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0052D4" />
                <stop offset="100%" stopColor="#00D2FF" />
              </linearGradient>
              <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="-2" dy="4" stdDeviation="6" floodColor="#0A66C2" floodOpacity="0.15"/>
              </filter>
            </defs>

            {/* Left Ribbon */}
            <path 
              d="M 160 80 C 180 80, 240 180, 275 270 C 285 295, 290 320, 270 320 C 250 320, 210 240, 185 190 Z" 
              fill="url(#leftGrad)" 
              style={{
                strokeDasharray: 1000,
                strokeDashoffset: 1000,
                animation: 'drawLogo 1.6s forwards'
              }}
            />

            {/* Right Ribbon */}
            <path 
              d="M 270 320 C 290 320, 310 280, 325 240 C 350 170, 390 80, 410 80 L 360 80 C 340 120, 300 220, 275 270 C 265 290, 260 320, 270 320 Z" 
              fill="url(#rightGrad)" 
              filter="url(#softShadow)"
              style={{
                strokeDasharray: 1000,
                strokeDashoffset: 1000,
                animation: 'drawLogo 1.6s forwards',
                animationDelay: '0.15s'
              }}
            />
          </svg>
        </div>

        {/* Brand Text */}
        <h1 className="text-xl font-extrabold tracking-[0.25em] text-slate-900 flex items-center justify-center pl-1.5 uppercase">
          VELI<span className="text-primary font-black">ZO</span>
        </h1>
        
        {/* Tagline */}
        <p className="text-[9px] text-slate-400 font-bold tracking-[0.3em] uppercase mt-1.5">
          Global Career Trust Protocol
        </p>

        {/* Dynamic Verification Ticker */}
        <div className="flex items-center gap-2 mt-8 text-[10px] text-slate-500 font-semibold bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl min-w-[240px] justify-center shadow-sm">
          {statusIndex === statuses.length - 1 ? (
            <ShieldCheck className="h-3.5 w-3.5 text-teal-650 animate-bounce" />
          ) : (
            <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
          )}
          <span className="tabular-nums transition-all duration-300">{statuses[statusIndex]}</span>
        </div>

        {/* Thin Premium Loading Line */}
        <div className="w-40 bg-slate-100 h-[2px] rounded-full mt-5 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0A66C2] to-[#00D2FF] h-full rounded-full animate-[loadingProgress_2s_ease-out_forwards]" />
        </div>

      </div>

    </div>
  );
}
