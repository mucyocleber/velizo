'use client';

import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  FileCheck, 
  MapPin, 
  Search, 
  ChevronRight, 
  ArrowRight,
  UserCheck,
  TrendingUp,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  // Sample Featured Jobs
  const featuredJobs = [
    {
      id: 1,
      title: 'Senior Full Stack Engineer',
      company: 'TechNovation Corp',
      location: 'Kigali, Rwanda (Hybrid)',
      salary: '$3,500 - $5,000 / mo',
      type: 'Full-time',
      logo: '💻',
      tags: ['React', 'Node.js', 'PostgreSQL']
    },
    {
      id: 2,
      title: 'AI Prompt Engineer & Data Analyst',
      company: 'Aethera Intelligence',
      location: 'Nairobi, Kenya (Remote)',
      salary: '$4,000 - $6,200 / mo',
      type: 'Full-time',
      logo: '🤖',
      tags: ['Gemini API', 'Python', 'Meilisearch']
    },
    {
      id: 3,
      title: 'International Recruitment Lead',
      company: 'Global Talent Partners',
      location: 'London, UK (On-site)',
      salary: '£45,000 - £60,000 / yr',
      type: 'Contract',
      logo: '🌍',
      tags: ['Hiring', 'Compliance', 'HR']
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-primary selection:text-white">
      
      {/* ─── NAVIGATION ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-v.svg" alt="VELIZO" className="h-9 w-auto filter drop-shadow-[0_2px_8px_rgba(10,102,194,0.15)]" />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              VELI<span className="text-primary font-black">ZO</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#jobs" className="hover:text-primary transition-colors">Find Jobs</a>
            <a href="#passport" className="hover:text-primary transition-colors">Career Passport</a>
            <a href="#ai" className="hover:text-primary transition-colors">AI Coaching</a>
            <a href="#employers" className="hover:text-primary transition-colors">For Employers</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-[#084e96] transition-all shadow-md">
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 overflow-hidden flex items-center justify-center bg-white border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white -z-10" />
        <div className="max-w-5xl mx-auto px-6 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-100 bg-blue-50/50 text-xs text-primary font-semibold mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>AI-Powered International Recruitment Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-tight">
            Connecting Global Employers <br />
            with <span className="gradient-text">Exceptional Talent</span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            VELIZO streamlines international hiring with unified candidate management, AI match scoring, and a secure Career Passport system.
          </p>

          {/* 🔍 SEARCH BAR */}
          <div className="max-w-4xl mx-auto p-2.5 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row gap-2 shadow-xl items-center mb-12">
            <div className="flex items-center gap-3 px-4 py-3 flex-1 w-full border-b border-slate-100 md:border-b-0">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Job title, keywords, or skills..." 
                className="bg-transparent border-0 text-slate-900 w-full focus:outline-none placeholder:text-slate-400 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 px-4 py-3 flex-1 w-full">
              <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Preferred country or city..." 
                className="bg-transparent border-0 text-slate-900 w-full focus:outline-none placeholder:text-slate-400 text-sm"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>

            <button className="w-full md:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-[#084e96] transition-all flex items-center justify-center gap-2 shadow-md">
              Find Jobs <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* 📊 KEY STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-6">
            <div>
              <div className="text-3xl font-extrabold text-slate-950">10K+</div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Verified Jobs</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-950">5K+</div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Global Companies</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-950">98%</div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">AI Match Rate</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-950">Canada</div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Primary Market</div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── FEATURE SECTION: CAREER PASSPORT ─────────────────────── */}
      <section id="passport" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-200 bg-teal-50 text-xs text-teal-700 font-semibold mb-6">
                <FileCheck className="h-3.5 w-3.5" />
                <span>Verified Professional Identity</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Stand Out with Your <br />
                <span className="text-primary">Career Passport</span>
              </h2>
              <p className="text-slate-600 text-base mb-8 leading-relaxed">
                Build a secure, verified profile detailing your academic, employment, and skills credentials. Earn a verifiable Trust Score that instantly validates your expertise to international employers.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="p-1 rounded bg-blue-100 mt-1">
                    <UserCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <strong className="text-slate-800 block text-sm">Identity & Doc Verification</strong>
                    <span className="text-xs text-slate-500">Secure document verification ensuring credential authenticity.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 rounded bg-blue-100 mt-1">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <strong className="text-slate-800 block text-sm">Automated Trust & Career Score</strong>
                    <span className="text-xs text-slate-500">Algorithms score your profile completeness and integrity instantly.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Visual mock of Career Passport card (Light Style) */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Cleberé Mucyo</h3>
                  <p className="text-xs text-slate-500 font-medium">Senior Software Engineer</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold">
                  ✓ Verified Candidate
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-semibold">
                    <span className="text-slate-500">Trust Score</span>
                    <span className="text-primary">96 / 100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <span className="text-xs text-slate-500 block font-medium">Education</span>
                    <span className="text-xs text-slate-800 font-semibold">B.Sc. Software Engineering</span>
                    <span className="text-[10px] text-teal-600 flex items-center gap-1 mt-1 font-semibold">
                      ✓ Verified
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block font-medium">Experience</span>
                    <span className="text-xs text-slate-800 font-semibold">4+ Years (Full Stack)</span>
                    <span className="text-[10px] text-teal-600 flex items-center gap-1 mt-1 font-semibold">
                      ✓ Verified
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Passport Expiry</span>
                  <span className="text-slate-800 font-semibold font-mono">2029-12-31</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── AI COACH SECTION ─────────────────────────────────────────── */}
      <section id="ai" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="order-2 lg:order-1 p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
              
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4 mb-6">
                <BrainCircuit className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">VELIZO AI Assistant</h3>
                  <span className="text-[10px] text-teal-600 flex items-center gap-1 font-semibold">🟢 Online & Ready</span>
                </div>
              </div>

              {/* Chat Simulation */}
              <div className="space-y-4 mb-6">
                <div className="bg-white border border-slate-100 p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-600 max-w-[85%] shadow-sm">
                  Hello Cleberé! I have analyzed your resume against the "Senior Full Stack Engineer" role. Your ATS score is 87/100.
                </div>
                <div className="bg-primary text-white p-3.5 rounded-2xl rounded-tr-none text-xs max-w-[85%] ml-auto shadow-md">
                  Awesome! How can I improve my score to reach 95+?
                </div>
                <div className="bg-white border border-slate-100 p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-600 max-w-[85%] shadow-sm">
                  Add projects detailing experience with **GraphQL** and **Docker containers**. These are highly sought after by the employer.
                </div>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ask your AI Career Coach..." 
                  disabled
                  className="bg-white text-xs p-3.5 rounded-xl flex-1 border border-slate-200 focus:outline-none cursor-not-allowed"
                />
                <button disabled className="p-3.5 rounded-xl bg-primary text-white opacity-50 cursor-not-allowed">
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-semibold mb-6">
                <BrainCircuit className="h-3.5 w-3.5" />
                <span>Next-Gen Career Acceleration</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
                AI Coach & ATS Optimizer <br />
                <span className="gradient-text">At Your Service</span>
              </h2>
              <p className="text-slate-600 text-base mb-8 leading-relaxed">
                Get real-time feedback on your resumes, calculate ATS compatibility scores, prepare with customized mock interviews, and ask for localized salary intelligence.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50">
                  <h4 className="text-sm font-bold text-slate-900 mb-1.5">ATS Resume Parser</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Scan and score your resume structure & keyword density to match job requirements.</p>
                </div>
                <div className="p-5 rounded-2xl border border-border bg-slate-50/50">
                  <h4 className="text-sm font-bold text-slate-900 mb-1.5">Mock Interviews</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">Generate tailored behavioral and technical questions based on specific listings.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── JOBS LISTING SECTION ─────────────────────────────────────────── */}
      <section id="jobs" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Featured Jobs</h2>
              <p className="text-slate-500 text-sm mt-1">Explore top international verified opportunities.</p>
            </div>
            <button className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
              Browse All Jobs <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <div key={job.id} className="p-6 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between hover:border-primary/40 transition-all group shadow-sm hover:shadow-lg">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-2xl p-2 rounded-xl bg-slate-50">{job.logo}</span>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-primary border border-blue-100 text-[10px] font-bold">
                      {job.type}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1 mb-1">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3 font-semibold">{job.company}</p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{job.location}</span>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {job.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-slate-50 border border-slate-100 px-2 py-1 rounded text-slate-500 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                    <span className="text-sm font-extrabold text-slate-800">{job.salary}</span>
                    <button className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Apply Now <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-12 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo-v.svg" alt="VELIZO" className="h-7 w-auto filter brightness-0 invert" />
            <span className="text-base font-bold text-white">
              VELI<span className="text-primary font-black">ZO</span>
            </span>
          </div>

          <div className="text-xs text-slate-500 text-center md:text-right">
            <p>Designed and Built for CodeMateRwa LTD</p>
            <p className="mt-1">All Rights Reserved © 2026</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
