'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  X, 
  Briefcase, 
  Sparkles, 
  FileCheck, 
  BrainCircuit, 
  Building2, 
  ArrowRight,
  ChevronRight,
  Globe
} from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Monitor scroll state to toggle floating style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Find Jobs', href: '#jobs', icon: Briefcase },
    { name: 'Career Passport', href: '#passport', icon: FileCheck },
    { name: 'AI Coaching', href: '#ai', icon: BrainCircuit },
    { name: 'For Employers', href: '#employers', icon: Building2 },
  ];

  return (
    <>
      {/* ─── HEADER CONTAINER ───────────────────────────────────── */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'py-3 bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-b border-slate-100' 
          : 'py-5 bg-white border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          {/* 🔷 Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative overflow-hidden transition-transform duration-300 group-hover:scale-105">
              <img 
                src="/logo-v.svg" 
                alt="VELIZO" 
                className="h-9 w-auto filter drop-shadow-[0_2px_8px_rgba(10,102,194,0.15)]" 
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-primary transition-colors">
              VELI<span className="text-primary font-black">ZO</span>
            </span>
          </Link>

          {/* 🔷 Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-primary hover:bg-slate-50 transition-all duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* 🔷 Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/auth/login" 
              className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/register" 
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-[#084e96] transition-all shadow-md hover:shadow-lg flex items-center gap-1.5"
            >
              Create Account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* 🔷 Mobile Hamburger Button */}
          <button 
            type="button"
            className="md:hidden p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </header>

      {/* ─── MOBILE FULLSCREEN DRAWER (Latest Version UI) ────────── */}
      <div className={`fixed inset-0 z-40 bg-white/98 backdrop-blur-xl md:hidden transition-all duration-500 ease-in-out ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none translate-y-4'
      }`}>
        <div className="h-full flex flex-col justify-between p-6 pt-24 overflow-y-auto">
          
          {/* Menu Links with Icons */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2 mb-2">
              Platform Modules
            </p>
            {navLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-all group"
                  style={{ 
                    animationDelay: `${idx * 75}ms`,
                    animation: isOpen ? 'slideInMenu 0.4s ease-out forwards' : 'none'
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-base font-bold text-slate-800">{link.name}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </a>
              );
            })}
          </div>

          {/* Bottom Actions & Trust Labels */}
          <div className="space-y-6 pt-10 border-t border-slate-100">
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/auth/register"
                onClick={() => setIsOpen(false)}
                className="w-full py-3.5 rounded-2xl bg-primary hover:bg-[#084e96] text-white text-sm font-bold text-center transition-all shadow-md flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight className="h-4.5 w-4.5" />
              </Link>
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="w-full py-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold text-center transition-all"
              >
                Sign In
              </Link>
            </div>

            {/* Global Trust Note */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              <Globe className="h-4 w-4 text-teal-600" />
              <span>International Credential Protocol</span>
            </div>

          </div>

        </div>
      </div>

      {/* 🎨 Inline Styles for Mobile slide-in */}
      <style jsx>{`
        @keyframes slideInMenu {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
