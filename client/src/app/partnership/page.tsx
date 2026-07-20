'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowRight, ArrowLeft, Building2, User, FileText, CheckCircle2, Upload, X } from 'lucide-react';

const STEPS = ['Company Info', 'Contact Person', 'Documents', 'Review & Submit'];

const INDUSTRIES = ['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Construction', 'Hospitality', 'Agriculture', 'Other'];
const COMPANY_SIZES = ['1–10', '11–50', '51–200', '201–500', '500+'];

type FormData = {
  company_name: string;
  registration_number: string;
  country: string;
  industry: string;
  company_size: string;
  website: string;
  hiring_description: string;
  contact_name: string;
  contact_title: string;
  contact_email: string;
  contact_phone: string;
  logo_file: File | null;
  registration_cert: File | null;
  tax_document: File | null;
};

const initial: FormData = {
  company_name: '', registration_number: '', country: '', industry: '',
  company_size: '', website: '', hiring_description: '',
  contact_name: '', contact_title: '', contact_email: '', contact_phone: '',
  logo_file: null, registration_cert: null, tax_document: null,
};

async function uploadFile(file: File, path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from('partnership-docs')
    .upload(path, file, { upsert: true });
  if (error) return null;
  const { data: urlData } = supabase.storage.from('partnership-docs').getPublicUrl(data.path);
  return urlData.publicUrl;
}

export default function PartnershipPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initial);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof FormData, value: string | File | null) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const ts = Date.now();
      const [logo_file_url, registration_cert_url, tax_document_url] = await Promise.all([
        form.logo_file ? uploadFile(form.logo_file, `logos/${ts}-${form.logo_file.name}`) : Promise.resolve(null),
        form.registration_cert ? uploadFile(form.registration_cert, `certs/${ts}-${form.registration_cert.name}`) : Promise.resolve(null),
        form.tax_document ? uploadFile(form.tax_document, `tax/${ts}-${form.tax_document.name}`) : Promise.resolve(null),
      ]);

      const { error: dbError } = await supabase.from('partnership_requests').insert({
        company_name: form.company_name,
        registration_number: form.registration_number,
        country: form.country,
        industry: form.industry,
        company_size: form.company_size,
        website: form.website || null,
        hiring_description: form.hiring_description,
        contact_name: form.contact_name,
        contact_title: form.contact_title,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        logo_file_url,
        registration_cert_url,
        tax_document_url,
      });

      if (dbError) throw dbError;
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0b1329] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Application Received</h1>
          <p className="text-slate-400 leading-relaxed mb-2">
            Thank you, <span className="text-white font-bold">{form.contact_name}</span>. We've received your partnership request for <span className="text-white font-bold">{form.company_name}</span>.
          </p>
          <p className="text-slate-500 text-sm mb-8">Our team will review your application and reach out to <span className="text-slate-300">{form.contact_email}</span> within 3–5 business days.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-primary hover:bg-[#084e96] transition-all">
            Back to Home <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#0b1329] px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="text-slate-400 hover:text-white text-sm font-semibold transition-colors mb-6 inline-block">← Back to VELIZO</Link>
          <h1 className="text-3xl font-black text-white mb-2">Partner With Us</h1>
          <p className="text-slate-400 text-sm">Access verified African talent ready to relocate globally.</p>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mt-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-primary text-white' : 'bg-white/10 text-slate-500'
                }`}>
                  {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                <span className={`text-xs font-bold hidden sm:block ${i === step ? 'text-white' : 'text-slate-500'}`}>{s}</span>
                {i < STEPS.length - 1 && <div className={`h-px w-6 sm:w-10 ${i < step ? 'bg-emerald-500' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">

          {/* Step 1 — Company Info */}
          {step === 0 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-black text-slate-900">Company Information</h2>
              </div>
              <Field label="Company Name *" value={form.company_name} onChange={v => set('company_name', v)} placeholder="Acme Corp Ltd" />
              <Field label="Registration Number *" value={form.registration_number} onChange={v => set('registration_number', v)} placeholder="REG-123456" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Country *" value={form.country} onChange={v => set('country', v)} placeholder="Germany" />
                <SelectField label="Industry *" value={form.industry} onChange={v => set('industry', v)} options={INDUSTRIES} />
              </div>
              <SelectField label="Company Size *" value={form.company_size} onChange={v => set('company_size', v)} options={COMPANY_SIZES} />
              <Field label="Website" value={form.website} onChange={v => set('website', v)} placeholder="https://yourcompany.com" />
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">What roles are you hiring for? *</label>
                <textarea
                  value={form.hiring_description}
                  onChange={e => set('hiring_description', e.target.value)}
                  rows={3}
                  placeholder="We're looking for software engineers, data analysts..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 2 — Contact Person */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-black text-slate-900">Contact Person</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name *" value={form.contact_name} onChange={v => set('contact_name', v)} placeholder="Jane Smith" />
                <Field label="Job Title *" value={form.contact_title} onChange={v => set('contact_title', v)} placeholder="HR Manager" />
              </div>
              <Field label="Work Email *" value={form.contact_email} onChange={v => set('contact_email', v)} placeholder="jane@company.com" type="email" />
              <Field label="Phone Number *" value={form.contact_phone} onChange={v => set('contact_phone', v)} placeholder="+49 123 456 7890" type="tel" />
            </div>
          )}

          {/* Step 3 — Documents */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-black text-slate-900">Documents</h2>
              </div>
              <p className="text-sm text-slate-500">Upload your company documents to verify your partnership request. All files are stored securely.</p>
              <FileUpload label="Company Logo" file={form.logo_file} onChange={f => set('logo_file', f)} accept="image/*" />
              <FileUpload label="Registration Certificate *" file={form.registration_cert} onChange={f => set('registration_cert', f)} accept=".pdf,.jpg,.png" />
              <FileUpload label="Tax Document" file={form.tax_document} onChange={f => set('tax_document', f)} accept=".pdf,.jpg,.png" />
            </div>
          )}

          {/* Step 4 — Review */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-black text-slate-900 mb-6">Review & Submit</h2>
              <ReviewSection title="Company">
                <ReviewRow label="Name" value={form.company_name} />
                <ReviewRow label="Reg. Number" value={form.registration_number} />
                <ReviewRow label="Country" value={form.country} />
                <ReviewRow label="Industry" value={form.industry} />
                <ReviewRow label="Size" value={form.company_size} />
                {form.website && <ReviewRow label="Website" value={form.website} />}
                <ReviewRow label="Hiring for" value={form.hiring_description} />
              </ReviewSection>
              <ReviewSection title="Contact">
                <ReviewRow label="Name" value={form.contact_name} />
                <ReviewRow label="Title" value={form.contact_title} />
                <ReviewRow label="Email" value={form.contact_email} />
                <ReviewRow label="Phone" value={form.contact_phone} />
              </ReviewSection>
              <ReviewSection title="Documents">
                <ReviewRow label="Logo" value={form.logo_file?.name || '—'} />
                <ReviewRow label="Registration Cert" value={form.registration_cert?.name || '—'} />
                <ReviewRow label="Tax Document" value={form.tax_document?.name || '—'} />
              </ReviewSection>
              {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!isStepValid(step, form)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-[#084e96] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all disabled:opacity-60"
              >
                {loading ? 'Submitting...' : 'Submit Application'} {!loading && <CheckCircle2 className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function isStepValid(step: number, form: FormData): boolean {
  if (step === 0) return !!(form.company_name && form.registration_number && form.country && form.industry && form.company_size && form.hiring_description);
  if (step === 1) return !!(form.contact_name && form.contact_title && form.contact_email && form.contact_phone);
  if (step === 2) return !!form.registration_cert;
  return true;
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
      >
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function FileUpload({ label, file, onChange, accept }: { label: string; file: File | null; onChange: (f: File | null) => void; accept: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{label}</label>
      {file ? (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50">
          <span className="text-sm text-emerald-700 font-semibold truncate">{file.name}</span>
          <button onClick={() => onChange(null)} className="ml-3 text-slate-400 hover:text-red-500 transition-colors shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-slate-300 hover:border-primary hover:bg-blue-50/30 cursor-pointer transition-all">
          <Upload className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-500">Click to upload</span>
          <input type="file" accept={accept} className="hidden" onChange={e => onChange(e.target.files?.[0] ?? null)} />
        </label>
      )}
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{title}</p>
      <div className="bg-slate-50 rounded-xl p-4 space-y-2">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-slate-400 font-semibold w-28 shrink-0">{label}</span>
      <span className="text-slate-800 font-medium break-all">{value}</span>
    </div>
  );
}
