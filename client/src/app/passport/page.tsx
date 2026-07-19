'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { supabase } from '@/lib/supabase';
import {
  ShieldCheck,
  User,
  Mail,
  Award,
  FileText,
  CheckCircle,
  HelpCircle,
  FolderOpen,
  Bookmark,
  CreditCard,
  LogOut,
  ChevronDown,
  Building2,
  Clock,
  Camera,
  Trash2,
  Eye,
  X,
  Upload,
  Sparkles
} from 'lucide-react';

type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
  banner_url?: string | null;
  created_at: string;
};

type Passport = {
  career_score?: number;
  trust_score?: number;
  identity_verified?: boolean;
  education_verified?: boolean;
  employment_verified?: boolean;
};

function AvatarMenu({ onUpload, onView, onDelete, hasImage, onClose }: {
  onUpload: () => void; onView: () => void; onDelete: () => void; hasImage: boolean; onClose: () => void;
}) {
  return (
    <div className="absolute z-50 mt-1 top-full left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden w-44 text-xs font-bold">
      <button onClick={() => { onUpload(); onClose(); }} className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-slate-50 transition-colors text-slate-700">
        <Upload className="h-3.5 w-3.5 text-[#0a5fcc]" />{hasImage ? 'Change Photo' : 'Upload Photo'}
      </button>
      {hasImage && (<>
        <button onClick={() => { onView(); onClose(); }} className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-slate-50 transition-colors text-slate-700 border-t border-slate-100">
          <Eye className="h-3.5 w-3.5 text-slate-400" />View Photo
        </button>
        <button onClick={() => { onDelete(); onClose(); }} className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-red-50 transition-colors text-red-500 border-t border-slate-100">
          <Trash2 className="h-3.5 w-3.5" />Remove Photo
        </button>
      </>)}
    </div>
  );
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
      <button className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors" onClick={onClose}>
        <X className="h-5 w-5 text-white" />
      </button>
      <img src={src} alt="Profile Photo" className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

export default function PassportPage() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [passport, setPassport] = useState<Passport | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState<'avatar' | 'banner' | null>(null);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    verification: true, documents: false, savedJobs: false, subscription: false, help: false,
  });

  const toggleSection = (section: string) => setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/auth/login'); return; }
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profileData) {
          setProfile(profileData as Profile);
          if (profileData.role === 'candidate') {
            const { data: passportData } = await supabase.from('career_passports').select('*').eq('candidate_id', session.user.id).maybeSingle();
            if (!passportData) {
              const { data: newPassport } = await supabase.from('career_passports').insert({ candidate_id: session.user.id, career_score: 15, identity_verified: false, education_verified: false, employment_verified: false }).select().single();
              if (newPassport) setPassport(newPassport);
            } else { setPassport(passportData); }
          }
        }
      } catch (err) { console.error('Passport load error:', err); } finally { setLoading(false); }
    };
    fetchData();
  }, [router]);

  const uploadFile = async (file: File, field: 'avatar_url' | 'banner_url') => {
    if (!profile) return;
    setUploading(field === 'avatar_url' ? 'avatar' : 'banner');
    try {
      const ext = file.name.split('.').pop();
      const path = `${profile.id}/${field === 'avatar_url' ? 'avatar' : 'banner'}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      await supabase.from('profiles').update({ [field]: publicUrl, updated_at: new Date().toISOString() }).eq('id', profile.id);
      setProfile((prev) => prev ? { ...prev, [field]: publicUrl } : prev);
    } catch (err) { console.error('Upload error:', err); } finally { setUploading(null); }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) uploadFile(file, 'avatar_url'); };
  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) uploadFile(file, 'banner_url'); };
  const handleDeleteAvatar = async () => { if (!profile) return; await supabase.from('profiles').update({ avatar_url: null }).eq('id', profile.id); setProfile((prev) => prev ? { ...prev, avatar_url: null } : prev); };
  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/auth/login'); };

  const isCandidate = profile?.role === 'candidate';
  const initials = profile?.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const joinedDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

  const AccordionList = () => (
    <div className="space-y-3">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <button onClick={() => toggleSection('verification')} className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
          <div className="flex items-center gap-3 text-left">
            <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"><ShieldCheck className="h-4 w-4 text-[#0a5fcc]" /></div>
            <div>
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Verification Milestones</h3>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5">KYC checks and trust scores</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isCandidate && <span className="text-[9px] font-black text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">{passport?.career_score ?? 0} pts</span>}
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${expandedSections.verification ? 'rotate-180' : ''}`} />
          </div>
        </button>
        {expandedSections.verification && (
          <div className="border-t border-slate-100 px-4 py-4 space-y-2.5">
            {isCandidate ? (
              <>
                {[{ icon: User, label: 'Identity Verification', desc: 'Government ID & KYC check', key: 'identity_verified' }, { icon: Award, label: 'Education Certification', desc: 'Degree records & academic background', key: 'education_verified' }, { icon: FileText, label: 'Employment Reference', desc: 'Verified by previous hiring managers', key: 'employment_verified' }].map(({ icon: Icon, label, desc, key }) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-start gap-2.5"><Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" /><div><h4 className="text-[11px] font-extrabold text-slate-800">{label}</h4><p className="text-[9px] text-slate-400 font-semibold mt-0.5">{desc}</p></div></div>
                    {(passport as any)?.[key] ? <span className="px-2 py-0.5 text-[8px] font-black bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 flex items-center gap-0.5 uppercase tracking-wider shrink-0"><CheckCircle className="h-2.5 w-2.5" /> Done</span> : <span className="px-2 py-0.5 text-[8px] font-black bg-slate-100 text-slate-500 rounded-full border border-slate-200 uppercase tracking-wider shrink-0">Pending</span>}
                  </div>
                ))}
              </>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex items-start gap-2.5"><Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" /><div><h4 className="text-[11px] font-extrabold text-slate-800">Employer Verification</h4><p className="text-[9px] text-slate-400 font-semibold mt-0.5">Company registry & authorization check</p></div></div>
                <span className="px-2 py-0.5 text-[8px] font-black bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 flex items-center gap-0.5 uppercase shrink-0"><CheckCircle className="h-2.5 w-2.5" /> Verified</span>
              </div>
            )}
          </div>
        )}
      </div>

      {isCandidate && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <button onClick={() => toggleSection('documents')} className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
            <div className="flex items-center gap-3 text-left">
              <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"><FolderOpen className="h-4 w-4 text-[#0a5fcc]" /></div>
              <div><h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">My Documents</h3><p className="text-[9px] text-slate-400 font-bold mt-0.5">CV, passport and credential files</p></div>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${expandedSections.documents ? 'rotate-180' : ''}`} />
          </button>
          {expandedSections.documents && (
            <div className="border-t border-slate-100 px-4 py-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0"><FileText className="h-4 w-4 text-slate-400 shrink-0" /><div className="min-w-0"><p className="text-[11px] font-black text-slate-800 truncate">VELIZO_Career_Passport.pdf</p><p className="text-[9px] text-slate-400 font-semibold mt-0.5">Primary credential document</p></div></div>
                <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">Active</span>
              </div>
            </div>
          )}
        </div>
      )}

      {isCandidate && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <button onClick={() => toggleSection('savedJobs')} className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
            <div className="flex items-center gap-3 text-left">
              <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"><Bookmark className="h-4 w-4 text-[#0a5fcc]" /></div>
              <div><h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Saved Placements</h3><p className="text-[9px] text-slate-400 font-bold mt-0.5">Bookmarked job openings</p></div>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${expandedSections.savedJobs ? 'rotate-180' : ''}`} />
          </button>
          {expandedSections.savedJobs && (
            <div className="border-t border-slate-100 px-4 py-8 text-center">
              <Bookmark className="h-6 w-6 text-slate-300 mx-auto mb-2" /><p className="text-xs font-bold text-slate-700">No Saved Placements</p><p className="text-[10px] text-slate-400 mt-1">Bookmark listings to access them here.</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <button onClick={() => toggleSection('subscription')} className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
          <div className="flex items-center gap-3 text-left">
            <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"><CreditCard className="h-4 w-4 text-[#0a5fcc]" /></div>
            <div><h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Billing & Plan</h3><p className="text-[9px] text-slate-400 font-bold mt-0.5">Manage payments & subscription</p></div>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${expandedSections.subscription ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.subscription && (
          <div className="border-t border-slate-100 px-4 py-4">
            <div className="p-3 bg-gradient-to-br from-[#0a5fcc]/5 to-indigo-500/5 border border-blue-100 rounded-xl flex items-center justify-between gap-3 flex-wrap">
              <div><p className="text-[9px] font-black text-[#0a5fcc] uppercase tracking-wider">Active Plan</p><h4 className="text-[11px] font-black text-slate-800 mt-0.5">Free Verification Tier</h4><p className="text-[9px] text-slate-400 font-semibold mt-0.5">Upgrade to unlock agent pitches.</p></div>
              <button className="px-3 py-1.5 text-[9px] font-black text-white bg-[#0a5fcc] hover:bg-blue-700 rounded-lg transition-colors shadow-sm cursor-pointer">Upgrade</button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <button onClick={() => toggleSection('help')} className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
          <div className="flex items-center gap-3 text-left">
            <div className="h-8 w-8 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"><HelpCircle className="h-4 w-4 text-[#0a5fcc]" /></div>
            <div><h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Help Center</h3><p className="text-[9px] text-slate-400 font-bold mt-0.5">FAQs and support</p></div>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${expandedSections.help ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.help && (
          <div className="border-t border-slate-100 px-4 py-4 space-y-2.5">
            {[{ q: 'How do I verify my education?', a: 'Verification is automatic when you link your credentials CV, or through agency screening checks.' }, { q: 'Is there visa sponsor support?', a: 'Yes! Target roles display visa sponsorship directly on their listing before you apply.' }].map(({ q, a }) => (
              <div key={q} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-[11px] font-extrabold text-slate-800">{q}</p><p className="text-[9px] text-slate-400 font-semibold leading-relaxed mt-0.5">{a}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleSignOut} className="w-full py-3.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-black uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer">
        <LogOut className="h-4 w-4" />Sign Out
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#0a5fcc] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-400">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-20 md:pb-0">
      <Header />
      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />
      <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerFileChange} />
      {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}

      {/* MOBILE */}
      <div className="md:hidden flex flex-col">
        <div className="relative w-full h-44 bg-gradient-to-br from-[#0b1329] via-[#0a5fcc] to-indigo-700 overflow-hidden">
          {profile?.banner_url ? (
            <img src={profile.banner_url} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <>
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 opacity-10 w-32 h-32 rounded-full bg-white blur-3xl" />
              <Sparkles className="absolute bottom-5 right-6 h-8 w-8 text-white/20" />
            </>
          )}
          <button onClick={() => bannerInputRef.current?.click()} disabled={uploading === 'banner'} className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-black transition-all cursor-pointer">
            {uploading === 'banner' ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="h-3 w-3" />}
            Edit Cover
          </button>
        </div>

        <div className="relative px-4 -mt-10 flex items-end gap-3 mb-3">
          <div className="relative shrink-0">
            <div className="h-20 w-20 rounded-2xl border-4 border-slate-100 shadow-lg bg-gradient-to-br from-[#0a5fcc] to-indigo-600 flex items-center justify-center text-white text-2xl font-black overflow-hidden cursor-pointer" onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}>
              {uploading === 'avatar' ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : profile?.avatar_url ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-lg">{initials}</span>}
            </div>
            <button onClick={() => setAvatarMenuOpen(!avatarMenuOpen)} className="absolute -bottom-1.5 -right-1.5 h-6 w-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow cursor-pointer hover:bg-slate-50 transition-colors">
              <Camera className="h-3 w-3 text-slate-600" />
            </button>
            {avatarMenuOpen && <AvatarMenu hasImage={!!profile?.avatar_url} onUpload={() => avatarInputRef.current?.click()} onView={() => profile?.avatar_url && setLightboxSrc(profile.avatar_url)} onDelete={handleDeleteAvatar} onClose={() => setAvatarMenuOpen(false)} />}
          </div>
          <div className="pb-1 min-w-0">
            <h1 className="text-base font-black text-slate-900 leading-tight truncate">{profile?.full_name}</h1>
            <span className="text-[9px] font-black uppercase tracking-wider text-[#0a5fcc] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 inline-block mt-0.5">{profile?.role === 'candidate' ? 'Job Seeker' : profile?.role || 'Employer'}</span>
          </div>
        </div>

        <div className="px-4 mb-4 space-y-1">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold"><Mail className="h-3 w-3 text-slate-400 shrink-0" /><span className="truncate">{profile?.email}</span></div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold"><Clock className="h-3 w-3 text-slate-400 shrink-0" /><span>Joined {joinedDate}</span></div>
        </div>

        {isCandidate && (
          <div className="px-4 mb-5">
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-3 flex items-center justify-between">
              <div><p className="text-[9px] font-black text-teal-700 uppercase tracking-wider">Career Passport Score</p><p className="text-xl font-black text-teal-600 leading-tight mt-0.5">{passport?.career_score ?? 0}<span className="text-xs font-bold text-teal-400"> / 100</span></p></div>
              <ShieldCheck className="h-8 w-8 text-teal-300" />
            </div>
          </div>
        )}

        <div className="px-4 pb-4"><AccordionList /></div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="relative w-full h-52 lg:h-64 rounded-3xl overflow-hidden bg-gradient-to-br from-[#0b1329] via-[#0a5fcc] to-indigo-700 shadow-lg group">
            {profile?.banner_url ? (
              <img src={profile.banner_url} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 w-96 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
                <Sparkles className="absolute bottom-8 right-12 h-12 w-12 text-white/10" />
                <p className="absolute bottom-5 left-6 text-white/30 text-xs font-black uppercase tracking-widest">VELIZO Career Network</p>
              </>
            )}
            <button onClick={() => bannerInputRef.current?.click()} disabled={uploading === 'banner'} className="absolute bottom-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-xl px-4 py-2 flex items-center gap-2 text-[11px] font-black transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow">
              {uploading === 'banner' ? <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              Edit Cover
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 px-6 pt-0 pb-5 -mt-8 relative z-10">
            <div className="flex items-end gap-5 -translate-y-8 mb-0">
              <div className="relative shrink-0">
                <div className="h-24 w-24 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-[#0a5fcc] to-indigo-600 flex items-center justify-center text-white text-3xl font-black overflow-hidden cursor-pointer" onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}>
                  {uploading === 'avatar' ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : profile?.avatar_url ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : <span>{initials}</span>}
                </div>
                <button onClick={() => setAvatarMenuOpen(!avatarMenuOpen)} className="absolute -bottom-1.5 -right-1.5 h-7 w-7 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow cursor-pointer hover:bg-slate-50 transition-colors">
                  <Camera className="h-3.5 w-3.5 text-slate-600" />
                </button>
                {avatarMenuOpen && <AvatarMenu hasImage={!!profile?.avatar_url} onUpload={() => avatarInputRef.current?.click()} onView={() => profile?.avatar_url && setLightboxSrc(profile.avatar_url)} onDelete={handleDeleteAvatar} onClose={() => setAvatarMenuOpen(false)} />}
              </div>
              <div className="flex-1 min-w-0 mb-1">
                <h1 className="text-lg font-black text-slate-900 leading-tight truncate">{profile?.full_name}</h1>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0a5fcc] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100 inline-block mt-1">{profile?.role === 'candidate' ? 'Job Seeker' : profile?.role || 'Employer'}</span>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold"><Mail className="h-3 w-3 text-slate-400" />{profile?.email}</span>
                  <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold"><Clock className="h-3 w-3 text-slate-400" />Joined {joinedDate}</span>
                </div>
              </div>
              {isCandidate && (
                <div className="shrink-0 text-right mb-1">
                  <p className="text-[9px] font-black text-teal-600 uppercase tracking-wider">Passport Score</p>
                  <p className="text-3xl font-black text-teal-500 leading-tight">{passport?.career_score ?? 0}</p>
                  <p className="text-[8px] text-teal-300 font-bold">/ 100 pts</p>
                </div>
              )}
            </div>
            <div className="-mt-6 border-t border-slate-100" />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-5 items-start">
            <div className="col-span-1 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">About</h3>
                <div className="space-y-2.5 text-[11px] text-slate-600 font-semibold">
                  <div className="flex items-center gap-2.5"><Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="truncate">{profile?.email}</span></div>
                  <div className="flex items-center gap-2.5"><Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span>Joined {joinedDate}</span></div>
                  <div className="flex items-center gap-2.5"><ShieldCheck className="h-3.5 w-3.5 text-teal-500 shrink-0" /><span className="text-teal-600 font-bold">{isCandidate ? `Score: ${passport?.career_score ?? 0} pts` : 'Verified Partner'}</span></div>
                </div>
              </div>
              <button onClick={handleSignOut} className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-[10px] font-black uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer">
                <LogOut className="h-3.5 w-3.5" />Sign Out
              </button>
            </div>
            <div className="col-span-2"><AccordionList /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
