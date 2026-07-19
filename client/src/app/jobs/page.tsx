'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import { 
  Briefcase, 
  MapPin, 
  Search, 
  DollarSign, 
  Filter, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Globe,
  SlidersHorizontal,
  X,
  Plus
} from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRemote, setSelectedRemote] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [onlySponsorship, setOnlySponsorship] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('jobs_with_companies')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data) setJobs(data);
      } catch (err) {
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Compute dynamic categories based on live database jobs
  const categories = useMemo(() => {
    const list = jobs.map(j => j.category).filter(Boolean);
    return ['All', ...Array.from(new Set(list))];
  }, [jobs]);

  // Client-side filtering logic
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // 1. Text Search
      const searchStr = `${job.title} ${job.company_name} ${job.city} ${job.country} ${job.category}`.toLowerCase();
      const matchesSearch = searchQuery.trim() === '' || searchStr.includes(searchQuery.toLowerCase());

      // 2. Category Filter
      const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;

      // 3. Remote Filter
      const matchesRemote = selectedRemote === 'All' || job.remote_type === selectedRemote.toLowerCase();

      // 4. Employment Type Filter
      const matchesType = selectedType === 'All' || job.employment_type === selectedType.toLowerCase();

      // 5. Visa Sponsorship
      const matchesSponsorship = !onlySponsorship || job.visa_sponsorship === true;

      return matchesSearch && matchesCategory && matchesRemote && matchesType && matchesSponsorship;
    });
  }, [jobs, searchQuery, selectedCategory, selectedRemote, selectedType, onlySponsorship]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedRemote('All');
    setSelectedType('All');
    setOnlySponsorship(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <Header />
      
      {/* Decorative branding top bar accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#0a5fcc] via-indigo-500 to-[#0a5fcc]" />

      <main className="max-w-6xl mx-auto px-4 py-8 w-full flex-1 flex flex-col">
        {/* Page Title Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Briefcase className="h-5.5 w-5.5 text-primary" /> Browse Placements
            </h1>
            <p className="text-xs text-slate-455 font-bold mt-0.5">
              Explore open positions and filter international roles targeting global candidates
            </p>
          </div>
          <button 
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-3xs hover:bg-slate-50"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>

        {/* Layout split: filters and results */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          
          {/* ─── FILTERS SIDEBAR (DESKTOP) ─── */}
          <div className="hidden md:block md:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-primary" /> Search Filters
              </h3>
              {(searchQuery || selectedCategory !== 'All' || selectedRemote !== 'All' || selectedType !== 'All' || onlySponsorship) && (
                <button 
                  onClick={handleClearFilters}
                  className="text-[10px] text-slate-400 hover:text-primary font-black uppercase tracking-wider transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {/* Category selector */}
              <div>
                <label className="block text-[9px] font-black text-slate-450 mb-1.5 uppercase tracking-wider">Job Category</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 transition-all cursor-pointer"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                  ))}
                </select>
              </div>

              {/* Remote option selector */}
              <div>
                <label className="block text-[9px] font-black text-slate-455 mb-1.5 uppercase tracking-wider">Workplace Type</label>
                <select 
                  value={selectedRemote}
                  onChange={(e) => setSelectedRemote(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 transition-all cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="Remote">Full Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              {/* Employment type selector */}
              <div>
                <label className="block text-[9px] font-black text-slate-455 mb-1.5 uppercase tracking-wider">Employment Type</label>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50 transition-all cursor-pointer"
                >
                  <option value="All">All Job Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              {/* Visa Sponsorship Checkbox Toggle */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={onlySponsorship}
                    onChange={(e) => setOnlySponsorship(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-primary focus:ring-primary/20 accent-[#0a5fcc] cursor-pointer"
                  />
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors block">Visa Sponsorship</span>
                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Sponsorship available only</span>
                  </div>
                </label>
              </div>
            </div>

            {/* AI Assistant Callout */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-xl p-4 text-center space-y-3 pt-4">
              <div className="flex flex-col items-center">
                <div className="h-8.5 w-8.5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-1">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-300 animate-pulse" />
                </div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-wider">Need Application Help?</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold mt-1">Get AI coaching feedback on your CV and interview skills.</p>
              </div>
              <Link href="/coach" className="block w-full py-2 bg-[#0a5fcc] hover:bg-blue-600 text-white text-[10px] font-black rounded-xl transition-colors shadow-sm">
                Open AI Assistant
              </Link>
            </div>
          </div>

          {/* ─── MAIN COLUMN: SEARCH & JOB CARDS ─── */}
          <div className="md:col-span-3 space-y-5">
            {/* Search Input Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <Search className="h-5 w-5 text-slate-400 shrink-0 ml-1.5" />
              <input 
                type="text" 
                placeholder="Search placements by job title, company, category, country or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-semibold text-slate-700 outline-none border-none placeholder-slate-400 bg-transparent"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 shrink-0 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category horizontal quick filter pills */}
            {categories.length > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 custom-scrollbar">
                {categories.map(cat => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shrink-0 transition-all ${
                        active 
                          ? 'bg-gradient-to-r from-primary to-[#084e96] border-transparent text-white shadow-3xs scale-102' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Job Listings List */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-400 font-semibold text-xs flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Scanning published placements...</span>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white p-12 text-center text-slate-400 font-semibold text-xs rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-2">
                <Briefcase className="h-10 w-10 text-slate-350 mb-1" />
                <p className="text-slate-800 text-sm font-extrabold">No Placements Found</p>
                <p className="text-slate-400 font-bold max-w-[280px] mt-0.5 leading-relaxed">We couldn't find any job placements matching your selected search query or filters.</p>
                <button 
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <Link 
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-primary/50 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer block relative group overflow-hidden"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {/* Company Logo Widget */}
                      <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 overflow-hidden shadow-3xs">
                        {job.logo_url ? (
                          <img src={job.logo_url} alt={job.company_name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-primary font-black text-sm">{job.company_name?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      {/* Job Metadata details */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-extrabold text-[#0a5fcc] tracking-wide uppercase">
                            {job.company_name}
                          </span>
                          {job.company_verified && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100 shrink-0 uppercase tracking-wider">
                              <ShieldCheck className="h-2.5 w-2.5" /> Partner
                            </span>
                          )}
                          {job.visa_sponsorship && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100 shrink-0 uppercase tracking-wider">
                              <Globe className="h-2.5 w-2.5" /> Sponsorship
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#0a5fcc] transition-colors leading-snug truncate">
                          {job.title}
                        </h3>

                        {/* Attribute Badges */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-slate-500 font-semibold pt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {job.city || job.country} ({job.remote_type})
                          </span>
                          <span className="flex items-center gap-1 capitalize">
                            <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {job.employment_type?.replace('-', ' ') || 'Full Time'}
                          </span>
                          {(job.salary_min || job.salary_max) && (
                            <span className="flex items-center gap-0.5">
                              <DollarSign className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              {job.salary_min ? `${job.currency || '$'}${Number(job.salary_min).toLocaleString()}` : ''}
                              {job.salary_min && job.salary_max ? ' - ' : ''}
                              {job.salary_max ? `${job.currency || '$'}${Number(job.salary_max).toLocaleString()}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-stretch justify-end sm:self-center shrink-0">
                      <span className="text-[10px] font-black text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-1 uppercase tracking-wider">
                        View Details <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ─── MOBILE FILTER DRAWER OVERLAY ─── */}
      {isMobileFilterOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 space-y-5 animate-slideUp shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                Filter Placements
              </h3>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-[9px] font-black text-slate-450 mb-1.5 uppercase tracking-wider">Job Category</label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                  ))}
                </select>
              </div>

              {/* Remote */}
              <div>
                <label className="block text-[9px] font-black text-slate-450 mb-1.5 uppercase tracking-wider">Workplace Type</label>
                <select 
                  value={selectedRemote}
                  onChange={(e) => setSelectedRemote(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50"
                >
                  <option value="All">All Types</option>
                  <option value="Remote">Full Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-[9px] font-black text-slate-450 mb-1.5 uppercase tracking-wider">Employment Type</label>
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary bg-slate-50"
                >
                  <option value="All">All Job Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              {/* Sponsorship */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={onlySponsorship}
                    onChange={(e) => setOnlySponsorship(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-primary focus:ring-primary/20 accent-[#0a5fcc]"
                  />
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-700">Visa Sponsorship</span>
                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Sponsorship available only</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button 
                onClick={() => { handleClearFilters(); setIsMobileFilterOpen(false); }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-xl uppercase tracking-wider transition-colors"
              >
                Reset
              </button>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-[#084e96] text-white text-xs font-black rounded-xl uppercase tracking-wider shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
