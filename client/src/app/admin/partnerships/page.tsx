'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, Clock, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

type Request = {
  id: string;
  company_name: string;
  registration_number: string;
  country: string;
  industry: string;
  company_size: string;
  website: string | null;
  hiring_description: string;
  contact_name: string;
  contact_title: string;
  contact_email: string;
  contact_phone: string;
  logo_file_url: string | null;
  registration_cert_url: string | null;
  tax_document_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
};

const STATUS_STYLES = {
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
};

const STATUS_ICONS = {
  pending:  <Clock className="h-3.5 w-3.5" />,
  approved: <CheckCircle2 className="h-3.5 w-3.5" />,
  rejected: <XCircle className="h-3.5 w-3.5" />,
};

export default function AdminPartnershipsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    const { data } = await supabase
      .from('partnership_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests(data ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    setUpdating(id);
    await supabase.from('partnership_requests').update({ status }).eq('id', id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    setUpdating(null);
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#0b1329] px-6 py-8 border-b border-white/10">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-2xl font-black text-white">Partnership Requests</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                filter === f
                  ? 'bg-[#0b1329] text-white border-[#0b1329]'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {f} <span className="ml-1 opacity-60">({counts[f]})</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">No {filter === 'all' ? '' : filter} requests found.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Row */}
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="text-sm font-black text-slate-900">{r.company_name}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_STYLES[r.status]}`}>
                        {STATUS_ICONS[r.status]} {r.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {r.industry} · {r.country} · {r.company_size} employees · {r.contact_email}
                    </p>
                    <p className="text-xs text-slate-400">
                      Submitted {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {r.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(r.id, 'approved')}
                          disabled={updating === r.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(r.id, 'rejected')}
                          disabled={updating === r.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-all disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                      {expanded === r.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded === r.id && (
                  <div className="border-t border-slate-100 px-6 py-5 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Detail label="Registration No." value={r.registration_number} />
                      <Detail label="Company Size" value={r.company_size} />
                      {r.website && <Detail label="Website" value={r.website} link />}
                      <Detail label="Hiring For" value={r.hiring_description} />
                    </div>
                    <div className="space-y-3">
                      <Detail label="Contact" value={`${r.contact_name} — ${r.contact_title}`} />
                      <Detail label="Phone" value={r.contact_phone} />
                      <div className="flex flex-col gap-1.5 pt-1">
                        {r.logo_file_url && <DocLink label="Company Logo" url={r.logo_file_url} />}
                        {r.registration_cert_url && <DocLink label="Registration Cert" url={r.registration_cert_url} />}
                        {r.tax_document_url && <DocLink label="Tax Document" url={r.tax_document_url} />}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value, link }: { label: string; value: string; link?: boolean }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline font-medium">{value}</a>
      ) : (
        <p className="text-sm text-slate-700 font-medium">{value}</p>
      )}
    </div>
  );
}

function DocLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
    >
      <ExternalLink className="h-3.5 w-3.5" /> {label}
    </a>
  );
}
