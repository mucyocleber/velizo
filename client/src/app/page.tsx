'use client';

import Link from 'next/link';
import Preloader from '@/components/shared/Preloader';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Users, Briefcase, TrendingUp, Star, Building2, ChevronRight, Globe, Menu, X, CheckCircle2, MapPin } from 'lucide-react';

const stats = [
  { value: '50+', label: 'Countries Covered' },
  { value: '10K+', label: 'Verified Candidates' },
  { value: '500+', label: 'Global Employers' },
  { value: '95%', label: 'Placement Rate' },
];

const navLinks = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Stories', href: '#testimonials' },
  { label: 'For Employers', href: '/partnership' },
];

function MobileCarousel() {
  const cards = [
    { src: '/hero-1.jpg', caption: 'Stuck in the wrong role?', sub: "You're not alone \u2014 and there's a way forward." },
    { src: '/hero-2.jpg', caption: 'Reaching out into the void?', sub: 'VELIZO connects you to employers who actually respond.' },
    { src: '/hero-3.jpg', caption: 'Wrong career, right talent?', sub: 'Your skills deserve a global stage.' },
  ];

  const [active, setActive] = useState(0);
  const [animState, setAnimState] = useState<'enter' | 'visible' | 'exit'>('enter');

  useEffect(() => {
    // enter: slide in from right (fast)
    // visible: hold for ~3.5s
    // exit: fade out to left
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;

    setAnimState('enter');
    t1 = setTimeout(() => setAnimState('visible'), 350);
    t2 = setTimeout(() => setAnimState('exit'), 4000);
    t3 = setTimeout(() => {
      setActive((prev) => (prev + 1) % cards.length);
    }, 4600);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);

  const card = cards[active];

  return (
    <div className="lg:hidden mt-10 relative h-52 overflow-hidden rounded-2xl">
      <div
        key={active}
        className="absolute inset-0 transition-all"
        style={{
          transform:
            animState === 'enter' ? 'translateX(100%)' :
            animState === 'visible' ? 'translateX(0)' :
            'translateX(-60%)',
          opacity: animState === 'exit' ? 0 : 1,
          transition:
            animState === 'enter' ? 'transform 0.35s cubic-bezier(0.16,1,0.3,1)' :
            animState === 'exit' ? 'transform 0.6s ease-in, opacity 0.6s ease-in' :
            'none',
        }}
      >
        <Image src={card.src} alt={card.caption} fill className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-sm font-black text-white leading-snug">{card.caption}</p>
          <p className="text-xs text-slate-300 font-medium mt-1 leading-snug">{card.sub}</p>
        </div>
        {/* Dot indicators */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {cards.map((_, i) => (
            <span key={i} className={`block h-1.5 rounded-full transition-all duration-300 ${
              i === active ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
            }`} />
          ))}
        </div>
      </div>
    </div>
  );
}
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">
      <Preloader />

      {/* ─── NAVBAR ─────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_1px_20px_rgba(15,23,42,0.08)] border-b border-slate-100'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <img src="/logo-v.svg" alt="VELIZO" className="h-8 w-auto group-hover:scale-105 transition-transform duration-200" />
            <span className="text-[17px] font-black tracking-tight leading-none">
              <span className={scrolled ? 'text-slate-900' : 'text-white'}>VELI</span><span className="text-primary">ZO</span>
            </span>
          </Link>

          {/* Desktop Nav Links — centered */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.href.startsWith('#') ? (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    scrolled
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    scrolled
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link
              href="/auth/register?tab=login"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                scrolled
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-[#084e96] transition-all duration-150 shadow-md hover:shadow-lg"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile: Sign In + Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/auth/register?tab=login"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                scrolled ? 'text-slate-700 hover:text-primary' : 'text-white/80 hover:text-white'
              }`}
            >
              Sign In
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
                scrolled ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── MOBILE DRAWER ──────────────────────────────────────────────── */}
      {/* Backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer panel */}
      <div className={`fixed top-0 right-0 bottom-0 z-[70] w-[280px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden ${
        mobileOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 h-[68px] border-b border-slate-100">
          <div className="flex items-center gap-2">
            <img src="/logo-v.svg" alt="VELIZO" className="h-7 w-auto" />
            <span className="text-base font-black">VELI<span className="text-primary">ZO</span></span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Drawer links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((link) =>
            link.href.startsWith('#') ? (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
              >
                {link.label}
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
              >
                {link.label}
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </Link>
            )
          )}
        </nav>

        {/* Drawer CTAs */}
        <div className="px-4 pb-8 pt-4 border-t border-slate-100 space-y-3">
          <Link
            href="/auth/register"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-[#084e96] transition-colors shadow-md"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/auth/register?tab=login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0b1329]">

        {/* Background image collage — 3 photos side by side with overlays */}
        <div className="absolute inset-0 flex">
          <div className="relative flex-1 overflow-hidden">
            <Image src="/hero-1.jpg" alt="" fill className="object-cover object-center opacity-25" priority />
          </div>
          <div className="relative flex-1 overflow-hidden">
            <Image src="/hero-2.jpg" alt="" fill className="object-cover object-center opacity-20" priority />
          </div>
          <div className="relative flex-1 overflow-hidden">
            <Image src="/hero-3.jpg" alt="" fill className="object-cover object-top opacity-25" priority />
          </div>
          {/* Unified dark gradient over all images */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1329]/60 via-[#0b1329]/70 to-[#0b1329]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1329]/80 via-transparent to-[#0b1329]/80" />
        </div>

        {/* Subtle dot grid on top */}
        <div className="absolute inset-0 dot-grid opacity-[0.06]" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-10 pt-28 sm:pt-32 pb-16 sm:pb-24">
          <div className="max-w-3xl">

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.04] mb-5">
              You deserve a job<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">that fits your life.</span>
            </h1>

            {/* Human-touch subtext — speaks to the struggle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed mb-4">
              Searching for the right job shouldn't feel like a dead end. VELIZO was built for people who are talented, ready, and just need the right door to open.
            </p>
            <p className="text-sm text-slate-400 max-w-lg leading-relaxed mb-10">
              We connect verified African professionals with global employers who are actively hiring — with smart matching, visa sponsorship support, and a Career Passport that makes your credentials speak for themselves.
            </p>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-4 mb-10">
              {[
                'No ghosting — real employer connections',
                'Visa sponsorship filters built in',
                'Matched to roles that actually fit you',
              ].map((point) => (
                <div key={point} className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  {point}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-[#084e96] transition-all shadow-lg hover:shadow-xl"
              >
                Build Your Career Passport <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/partnership"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white/80 border border-white/15 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all"
              >
                <Building2 className="h-4 w-4" /> Hire Global Talent
              </Link>
              <Link
                href="/auth/register?tab=login"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Sign In <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* ── Mobile sliding cards carousel ── */}
          <MobileCarousel />

          {/* 3 image cards — visible on large screens, shows the human stories */}
          <div className="hidden lg:grid grid-cols-3 gap-4 mt-20">
            {[
              { src: '/hero-1.jpg', caption: 'Stuck in the wrong role?', sub: 'You\'re not alone — and there\'s a way forward.' },
              { src: '/hero-2.jpg', caption: 'Reaching out into the void?', sub: 'VELIZO connects you to employers who actually respond.' },
              { src: '/hero-3.jpg', caption: 'Wrong career, right talent?', sub: 'Your skills deserve a global stage.' },
            ].map((card) => (
              <div key={card.src} className="relative rounded-2xl overflow-hidden h-52 group">
                <Image src={card.src} alt={card.caption} fill className="object-cover object-center group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xs font-black text-white leading-snug">{card.caption}</p>
                  <p className="text-[10px] text-slate-300 font-medium mt-0.5 leading-snug">{card.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="bg-[#0b1329] py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-black text-white mb-1">{s.value}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-16">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">The Process</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight max-w-lg">
              Three steps to your next chapter.
            </h2>
            <p className="text-slate-500 text-base mt-4 max-w-md leading-relaxed">
              No complicated process. No endless forms. Just a clear path from where you are to where you want to be.
            </p>
          </div>

          {/* Steps */}
          <div className="relative">
            {/* Vertical connector line — desktop only */}
            <div className="hidden md:block absolute left-[39px] top-10 bottom-10 w-px bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />

            <div className="space-y-12 md:space-y-16">

              {/* Step 1 */}
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
                <div className="flex items-center gap-4 md:flex-col md:items-center shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                    <Users className="h-9 w-9 text-white" />
                  </div>
                  <span className="text-xs font-black text-slate-300 uppercase tracking-widest md:mt-2">Step 01</span>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-2xl font-black text-slate-950 mb-3 tracking-tight">Build your Career Passport</h3>
                  <p className="text-slate-500 leading-relaxed mb-4">
                    Your Career Passport is more than a profile — it's a verified record of who you are professionally. Add your education, work history, skills, and documents. Employers see a complete, trustworthy picture of you from day one.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Verified credentials', 'Skills & experience', 'Document uploads', 'Public profile'].map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
                <div className="flex items-center gap-4 md:flex-col md:items-center shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-[#0b1329] flex items-center justify-center shadow-lg shrink-0">
                    <MapPin className="h-9 w-9 text-blue-400" />
                  </div>
                  <span className="text-xs font-black text-slate-300 uppercase tracking-widest md:mt-2">Step 02</span>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-2xl font-black text-slate-950 mb-3 tracking-tight">Get matched to roles that actually fit</h3>
                  <p className="text-slate-500 leading-relaxed mb-4">
                    We don't just show you every open job. We surface the ones that match your background, your goals, and your visa situation. No more applying into the void — every role you see is one you genuinely qualify for.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Visa sponsorship filter', 'Role compatibility', 'Location preferences', 'Salary range'].map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
                <div className="flex items-center gap-4 md:flex-col md:items-center shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                    <Globe className="h-9 w-9 text-white" />
                  </div>
                  <span className="text-xs font-black text-slate-300 uppercase tracking-widest md:mt-2">Step 03</span>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-2xl font-black text-slate-950 mb-3 tracking-tight">Apply, get hired, and relocate</h3>
                  <p className="text-slate-500 leading-relaxed mb-4">
                    One-click applications. Real-time status updates. Employers who actually respond. When you get the offer, we're still with you — tracking your application journey every step of the way until you land.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['One-click apply', 'Application tracking', 'Employer notifications', 'Relocation support'].map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-600">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 pt-12 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed">
              Thousands of professionals have already taken this path. Your turn.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-[#084e96] transition-all shadow-md hover:shadow-lg shrink-0"
            >
              Start Your Journey <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 px-6 bg-slate-50 overflow-hidden">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-16">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Built for Both Sides</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight max-w-xl">
              Tools that work for you — whoever you are.
            </h2>
            <p className="text-slate-500 text-base mt-4 max-w-md leading-relaxed">
              Whether you're looking for your next role or your next hire, VELIZO gives you what you actually need.
            </p>
          </div>

          {/* Two-column split */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Candidate column */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">For Candidates</p>
                  <p className="text-base font-black text-slate-900">Your career, your terms</p>
                </div>
              </div>
              <div className="space-y-6">
                {[
                  { icon: ShieldCheck, title: 'Verified Career Passport', desc: 'Your credentials, education, and work history — verified and trusted by employers worldwide.' },
                  { icon: MapPin, title: 'Smart Role Matching', desc: 'See only jobs that fit your skills, location goals, and visa eligibility. No noise, no wasted applications.' },
                  { icon: Globe, title: 'Visa Sponsorship Filter', desc: 'Filter directly for employers who sponsor work visas. Know before you apply.' },
                  { icon: TrendingUp, title: 'Career Coaching', desc: 'Resume feedback, interview prep, and career guidance — built into your journey, not sold separately.' },
                ].map((f) => (
                  <div key={f.title} className="flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                      <f.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 mb-1">{f.title}</p>
                      <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link href="/auth/register" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all">
                  Create your profile <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Employer column */}
            <div className="bg-[#0b1329] rounded-3xl p-8 border border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">For Employers</p>
                  <p className="text-base font-black text-white">Hire without the guesswork</p>
                </div>
              </div>
              <div className="space-y-6">
                {[
                  { icon: ShieldCheck, title: 'Pre-Verified Talent Pool', desc: 'Every candidate is verified before you see them. No fake profiles, no unqualified applicants wasting your time.' },
                  { icon: Briefcase, title: 'Targeted Job Posting', desc: 'Post roles that reach the right candidates — filtered by skill, experience level, and visa readiness.' },
                  { icon: TrendingUp, title: 'Live Hiring Analytics', desc: "Track job views, application rates, and candidate quality in real time. Know what's working." },
                  { icon: Star, title: 'Vetted Partnership Process', desc: 'Join through a structured onboarding. Candidates trust VELIZO because we only work with serious employers.' },
                ].map((f) => (
                  <div key={f.title} className="flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <f.icon className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white mb-1">{f.title}</p>
                      <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <Link href="/partnership" className="inline-flex items-center gap-2 text-sm font-bold text-blue-400 hover:gap-3 transition-all">
                  Become a partner <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="py-24 px-6 bg-[#0b1329] overflow-hidden">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-16">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Real Stories</p>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-lg">
              People who took the leap.
            </h2>
            <p className="text-slate-400 text-base mt-4 max-w-md leading-relaxed">
              These aren't case studies. These are real people who were exactly where you are — and found their way through.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                name: 'Amara Diallo', flag: '🇸🇳', journey: 'Dakar → Berlin',
                role: 'Software Engineer', company: 'FinTech startup, Germany',
                text: 'I had the skills but no idea how to get a German employer to take me seriously. VELIZO matched me in 2 weeks. The visa sponsorship filter alone saved me months.',
              },
              {
                name: 'Kwame Asante', flag: '🇬🇭', journey: 'Accra → Toronto',
                role: 'Data Analyst', company: 'Healthcare company, Canada',
                text: 'Three offers in my first month. The career coaching helped me rewrite my resume and actually prepare for interviews — not just practice generic questions.',
              },
              {
                name: 'Fatima Al-Hassan', flag: '🇳🇬', journey: 'Lagos → Amsterdam',
                role: 'UX Designer', company: 'SaaS company, Netherlands',
                text: 'European employers kept asking for "local experience". My Career Passport changed that conversation completely. They saw my credentials and stopped asking.',
              },
            ].map((t) => (
              <div key={t.name} className="bg-white/5 border border-white/10 rounded-3xl p-7 flex flex-col gap-6 hover:bg-white/8 transition-colors">
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-slate-300 text-sm leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
                {/* Person */}
                <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                    <span className="text-sm font-black text-blue-300">{t.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{t.name} <span className="font-normal">{t.flag}</span></p>
                    <p className="text-xs text-slate-500">{t.role} · {t.journey}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="relative py-24 px-6 bg-white overflow-hidden">
        {/* Subtle background accent */}
        <div className="absolute inset-0 dot-grid opacity-[0.04]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto">
          <div className="bg-[#0b1329] rounded-3xl px-10 py-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-10">

            {/* Left — copy */}
            <div className="max-w-lg">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Your move</p>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-5">
                The right job is<br />waiting for you.
              </h2>
              <p className="text-slate-400 text-base leading-relaxed">
                Thousands of professionals have already crossed borders through VELIZO. The only difference between them and you is that they started.
              </p>
            </div>

            {/* Right — actions */}
            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white bg-primary hover:bg-[#084e96] transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                Build Your Career Passport <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/partnership"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-slate-300 border border-white/15 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all whitespace-nowrap"
              >
                <Building2 className="h-4 w-4" /> Partner With Us
              </Link>
              <p className="text-center text-xs text-slate-600 mt-1">Free to join. No credit card required.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#0b1329] border-t border-white/5 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Top row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-white/10">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo-v.svg" alt="VELIZO" className="h-7 w-auto brightness-0 invert" />
                <span className="text-base font-black text-white">VELI<span className="text-primary">ZO</span></span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                Connecting verified African professionals with global employers who are actively hiring.
              </p>
            </div>

            {/* For Candidates */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">For Candidates</p>
              <div className="space-y-2.5">
                <Link href="/auth/register" className="block text-sm text-slate-400 hover:text-white transition-colors">Create Account</Link>
                <Link href="/auth/register?tab=login" className="block text-sm text-slate-400 hover:text-white transition-colors">Sign In</Link>
                <a href="#how-it-works" className="block text-sm text-slate-400 hover:text-white transition-colors">How It Works</a>
                <a href="#features" className="block text-sm text-slate-400 hover:text-white transition-colors">Features</a>
              </div>
            </div>

            {/* For Employers */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">For Employers</p>
              <div className="space-y-2.5">
                <Link href="/partnership" className="block text-sm text-slate-400 hover:text-white transition-colors">Partner With Us</Link>
                <Link href="/employer/login" className="block text-sm text-slate-400 hover:text-white transition-colors">Employer Login</Link>
                <a href="#features" className="block text-sm text-slate-400 hover:text-white transition-colors">Why VELIZO</a>
              </div>
            </div>

          </div>

          {/* Bottom row */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">Confidential — All Rights Reserved © 2026. CodeMateRwa LTD</p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-600">Built with</span>
              <span className="text-xs text-slate-500 mx-1">♥</span>
              <span className="text-xs text-slate-600">for African talent</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
