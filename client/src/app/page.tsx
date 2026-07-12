'use client';

import React, { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  FileCheck, 
  ShieldAlert, 
  MapPin, 
  Search, 
  ChevronRight, 
  Users, 
  Building2, 
  ArrowRight,
  UserCheck,
  TrendingUp,
  BrainCircuit,
  Lock,
  MessageSquare
} from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-white">
      
      {/* ─── NAVIGATION ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-v.svg" alt="VELIZO" className="h-9 w-auto filter drop-shadow-[0_2px_8px_rgba(99,102,241,0.3)]" />
            <span className="text-xl font-bold tracking-tight text-white">
              VELI<span className="text-primary font-black">ZO</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#jobs" className="hover:text-white transition-colors">Find Jobs</a>
            <a href="#passport" className="hover:text-white transition-colors">Career Passport</a>
            <a href="#ai" className="hover:text-white transition-colors">AI Coaching</a>
            <a href="#employers" className="hover:text-white transition-colors">For Employers</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-sm font-medium hover:text-white transition-colors">Sign In</button>
            <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white gradient-bg hover:opacity-95 transition-all shadow-md">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative py-20 md:py-32 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
        <div className="max-w-5xl mx-auto px-6 text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Recruitment Portal MVP</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 max-w-4xl mx-auto leading-tight">
            Connecting Global Employers <br />
            with <span className="gradient-text">Exceptional Talent</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            VELIZO simplifies international recruitment using an AI-driven environment. Verify your career, matching jobs instantly, and prepare for interviews.
          </p>

          {/* 🔍 SEARCH BAR */}
          <div className="max-w-4xl mx-auto p-2 rounded-2xl glassmorphism flex flex-col md:flex-row gap-2 shadow-2xl items-center mb-16">
            <div className="flex items-center gap-3 px-4 py-3 flex-1 w-full border-b border-border/40 md:border-b-0">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input 
                type="text" 
                placeholder="Job title, keywords, or skills..." 
                className="bg-transparent border-0 text-white w-full focus:outline-none placeholder:text-muted-foreground text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-3 px-4 py-3 flex-1 w-full">
              <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
              <input 
                type="text" 
                placeholder="Preferred country or city..." 
                className="bg-transparent border-0 text-white w-full focus:outline-none placeholder:text-muted-foreground text-sm"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>

            <button className="w-full md:w-auto px-6 py-3 rounded-xl text-sm font-semibold text-white gradient-bg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg">
              Find Jobs <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* 📊 KEY STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto border-t border-border/40 pt-10">
            <div>
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-xs text-muted-foreground mt-1">Verified Jobs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">5K+</div>
              <div className="text-xs text-muted-foreground mt-1">Global Employers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">98%</div>
              <div className="text-xs text-muted-foreground mt-1">AI Match Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">24h</div>
              <div className="text-xs text-muted-foreground mt-1">Avg Response Time</div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── FEATURE SECTION: CAREER PASSPORT ─────────────────────── */}
      <section id="passport" className="py-20 border-t border-border/40 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-secondary/20 bg-secondary/5 text-xs text-secondary font-medium mb-6">
                <FileCheck className="h-3.5 w-3.5" />
                <span>Verified Professional Identity</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight">
                Stand Out with Your <br />
                <span className="text-secondary">Career Passport</span>
              </h2>
              <p className="text-muted-foreground text-base mb-8 leading-relaxed">
                Build a secure, verified profile detailing your academic, employment, and skills credentials. Earn a verifiable Trust Score that instantly validates your expertise to international employers.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="p-1 rounded bg-secondary/10 mt-1">
                    <UserCheck className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <strong className="text-white block text-sm">Identity & Doc Verification</strong>
                    <span className="text-xs text-muted-foreground">Secure document verification ensuring credential authenticity.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 rounded bg-secondary/10 mt-1">
                    <TrendingUp className="h-4 w-4 text-secondary" />
                  </div>
                  <div>
                    <strong className="text-white block text-sm">Automated Trust & Career Score</strong>
                    <span className="text-xs text-muted-foreground">Algorithms score your profile completeness and integrity instantly.</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Visual mock of Career Passport card */}
            <div className="p-8 rounded-3xl glassmorphism glow-effect relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -z-10" />
              
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-bold text-white">Cleberé Mucyo</h3>
                  <p className="text-xs text-muted-foreground">Senior Software Engineer</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 text-xs font-semibold">
                  Verified Candidate
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Trust Score</span>
                    <span className="text-secondary font-bold">96 / 100</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className="bg-secondary h-full rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
                  <div>
                    <span className="text-xs text-muted-foreground block">Education</span>
                    <span className="text-xs text-white font-medium">B.Sc. Software Engineering</span>
                    <span className="text-[10px] text-secondary flex items-center gap-1 mt-0.5 font-medium">
                      ✓ Verified
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Experience</span>
                    <span className="text-xs text-white font-medium">4+ Years (Full Stack)</span>
                    <span className="text-[10px] text-secondary flex items-center gap-1 mt-0.5 font-medium">
                      ✓ Verified
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/40 pt-4 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Passport Expiry</span>
                  <span className="text-white font-mono">2029-12-31</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── AI COACH SECTION ─────────────────────────────────────────── */}
      <section id="ai" className="py-20 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="order-2 lg:order-1 p-8 rounded-3xl glassmorphism glow-effect relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
              
              <div className="flex items-center gap-3 border-b border-border/40 pb-4 mb-6">
                <BrainCircuit className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-base font-bold text-white">VELIZO AI Assistant</h3>
                  <span className="text-[10px] text-secondary flex items-center gap-1">🟢 Online & Ready</span>
                </div>
              </div>

              {/* Chat Simulation */}
              <div className="space-y-4 mb-6">
                <div className="bg-muted/50 p-3.5 rounded-2xl rounded-tl-none text-xs text-muted-foreground max-w-[85%]">
                  Hello Cleberé! I have analyzed your resume against the "Senior Full Stack Engineer" role. Your ATS score is 87/100.
                </div>
                <div className="bg-primary/20 p-3.5 rounded-2xl rounded-tr-none text-xs text-white max-w-[85%] ml-auto">
                  Awesome! How can I improve my score to reach 95+?
                </div>
                <div className="bg-muted/50 p-3.5 rounded-2xl rounded-tl-none text-xs text-muted-foreground max-w-[85%]">
                  Add projects detailing experience with **GraphQL** and **Docker containers**. These are highly sought after by the employer.
                </div>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Ask your AI Career Coach..." 
                  disabled
                  className="bg-muted text-xs p-3.5 rounded-xl flex-1 border border-border focus:outline-none cursor-not-allowed"
                />
                <button disabled className="p-3.5 rounded-xl gradient-bg text-white opacity-50 cursor-not-allowed">
                  <MessageSquare className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-medium mb-6">
                <BrainCircuit className="h-3.5 w-3.5" />
                <span>Next-Gen Career Acceleration</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight">
                AI Coach & ATS Optimizer <br />
                <span className="gradient-text">At Your Service</span>
              </h2>
              <p className="text-muted-foreground text-base mb-8 leading-relaxed">
                Get real-time feedback on your resumes, calculate ATS compatibility scores, prepare with customized mock interviews, and ask for localized salary intelligence.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl border border-border/40 bg-zinc-950/20">
                  <h4 className="text-sm font-bold text-white mb-1.5">ATS Resume Parser</h4>
                  <p className="text-xs text-muted-foreground">Scan and score your resume structure & keyword density to match job requirements.</p>
                </div>
                <div className="p-5 rounded-2xl border border-border/40 bg-zinc-950/20">
                  <h4 className="text-sm font-bold text-white mb-1.5">Mock Interviews</h4>
                  <p className="text-xs text-muted-foreground">Generate tailored behavioral and technical questions based on specific listings.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── JOBS LISTING SECTION ─────────────────────────────────────────── */}
      <section id="jobs" className="py-20 border-t border-border/40 bg-zinc-950/40">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Featured Jobs</h2>
              <p className="text-muted-foreground text-sm mt-1">Explore top international verified opportunities.</p>
            </div>
            <button className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
              Browse All Jobs <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <div key={job.id} className="p-6 rounded-2xl border border-border bg-card flex flex-col justify-between hover:border-primary/40 transition-all group shadow-md hover:shadow-xl">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-2xl p-2 rounded-xl bg-muted">{job.logo}</span>
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold">
                      {job.type}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1 mb-1">
                    {job.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 font-medium">{job.company}</p>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span>{job.location}</span>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {job.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-muted px-2 py-1 rounded text-muted-foreground font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t border-border/40 pt-4">
                    <span className="text-xs font-bold text-white">{job.salary}</span>
                    <button className="text-xs font-semibold text-primary flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
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
      <footer className="mt-auto border-t border-border/40 bg-zinc-950 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo-v.svg" alt="VELIZO" className="h-7 w-auto filter drop-shadow-[0_2px_8px_rgba(99,102,241,0.3)]" />
            <span className="text-base font-bold text-white">
              VELI<span className="text-primary font-black">ZO</span>
            </span>
          </div>

          <div className="text-xs text-muted-foreground text-center md:text-right">
            <p>Designed and Built for CodeMateRwa LTD</p>
            <p className="mt-1">All Rights Reserved © 2026</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
