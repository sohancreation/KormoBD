import React, { useState, useRef } from 'react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Application, OfferLetterData } from '../types';
import { 
  FileText, 
  Printer, 
  Download, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  PenTool, 
  RotateCcw, 
  Building2, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  Clock, 
  Eye, 
  Briefcase,
  Check,
  ChevronRight,
  Stamp
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OfferLetterBuilderProps {
  initialCandidate?: Application | null;
  onOfferSent?: (offer: OfferLetterData) => void;
}

export const OfferLetterBuilder: React.FC<OfferLetterBuilderProps> = ({
  initialCandidate,
  onOfferSent
}) => {
  const { applications, jobs, updateApplicationStatus } = useJobs();
  const { currentCompany } = useAuth();
  const { isBangla } = useLanguage();

  // Selected candidate from pipeline
  const [selectedAppId, setSelectedAppId] = useState<string>(
    initialCandidate?.id || applications[0]?.id || ''
  );
  const matchedApp = applications.find(a => a.id === selectedAppId) || applications[0];

  // Offer Letter fillable form fields
  const [candidateName, setCandidateName] = useState(matchedApp?.candidateName || 'Tanvir Ahmed');
  const [candidateEmail, setCandidateEmail] = useState(matchedApp?.candidateEmail || 'tanvir.ahmed@devbd.org');
  const [candidateAddress, setCandidateAddress] = useState('House 42, Road 11, Banani, Dhaka-1213, Bangladesh');
  const [jobTitle, setJobTitle] = useState(matchedApp?.jobTitle || 'Lead Full-Stack Engineer');
  const [department, setDepartment] = useState('Platform Engineering');
  const [monthlySalaryBdt, setMonthlySalaryBdt] = useState<number>(185000);
  const [bonusStructure, setBonusStructure] = useState(
    'Two (2) Festival Bonuses equivalent to 100% of basic monthly salary each, disbursed on Eid-ul-Fitr and Eid-ul-Adha, plus performance-based annual discretionary bonus.'
  );
  const [stockOptions, setStockOptions] = useState(
    '5,000 ESOP units (approx 0.25% equity ownership) subject to standard 4-year vesting schedule with a 1-year cliff.'
  );
  const [joiningDate, setJoiningDate] = useState('2026-10-15');
  const [probationMonths, setProbationMonths] = useState<number>(3);
  const [workLocation, setWorkLocation] = useState('Hybrid (Gulshan-2, Dhaka / 2 Days Remote per week)');
  const [reportingManager, setReportingManager] = useState('VP of Engineering / Principal Architect');
  const [workingHours, setWorkingHours] = useState('Sunday to Thursday, 9:30 AM – 6:00 PM BST');
  const [offerExpiryDate, setOfferExpiryDate] = useState('2026-10-05');
  const [benefitsList, setBenefitsList] = useState<string[]>([
    'Comprehensive Family Health & Hospitalization Insurance (Bupa/Delta Life)',
    'Contributory Provident Fund with 10% company matching contribution',
    'Annual Equipment & Home Office Allowance (৳ 60,000)',
    'Subsidized Catered Gourmet Lunch & Wellness Gym Membership'
  ]);

  // Status & Digital Signature workflow
  const [offerStatus, setOfferStatus] = useState<'draft' | 'sent' | 'accepted'>('draft');
  const [recruiterSignerName, setRecruiterSignerName] = useState('Tanzeem Ahmed');
  const [recruiterSignerTitle, setRecruiterSignerTitle] = useState('Director of Talent & Operations');
  const [isCandidateSigned, setIsCandidateSigned] = useState(false);
  const [candidateSignatureName, setCandidateSignatureName] = useState('');

  // Active view tab: 'editor' or 'preview'
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');

  // Sync candidate fields when app changes
  const handleSelectApp = (appId: string) => {
    setSelectedAppId(appId);
    const app = applications.find(a => a.id === appId);
    if (app) {
      setCandidateName(app.candidateName);
      setCandidateEmail(app.candidateEmail);
      setJobTitle(app.jobTitle);
    }
  };

  // Format BDT
  const formatBDT = (amount: number) => {
    return '৳ ' + amount.toLocaleString('en-IN');
  };

  // Convert numbers to words (Bengali/English style for contracts)
  const numberToWordsBdt = (num: number): string => {
    if (isBangla) {
      if (num === 185000) return 'এক লক্ষ পঁচাশি হাজার টাকা মাত্র';
      if (num === 150000) return 'এক লক্ষ পঞ্চাশ হাজার টাকা মাত্র';
      if (num === 200000) return 'দুই লক্ষ টাকা মাত্র';
      if (num === 250000) return 'দুই লক্ষ পঞ্চাশ হাজার টাকা মাত্র';
      return `${num.toLocaleString('en-IN')} টাকা মাত্র`;
    }
    if (num === 185000) return 'One Lakh Eighty-Five Thousand Taka Only';
    if (num === 150000) return 'One Lakh Fifty Thousand Taka Only';
    if (num === 200000) return 'Two Lakh Taka Only';
    if (num === 250000) return 'Two Lakh Fifty Thousand Taka Only';
    return `${num.toLocaleString('en-IN')} Taka Only`;
  };

  // Handle Send Offer
  const handleSendOffer = () => {
    setOfferStatus('sent');
    if (matchedApp) {
      updateApplicationStatus(matchedApp.id, 'selected');
    }
    confetti({ particleCount: 50, spread: 70 });
  };

  // Simulate Candidate Digital Acceptance
  const handleCandidateAccept = () => {
    setIsCandidateSigned(true);
    setCandidateSignatureName(candidateName);
    setOfferStatus('accepted');
    if (matchedApp) {
      updateApplicationStatus(matchedApp.id, 'selected');
    }
    confetti({ particleCount: 90, spread: 100 });
  };

  // Print Document
  const handlePrint = () => {
    window.print();
  };

  const getStatusLabel = () => {
    if (!isBangla) return `Status: ${offerStatus}`;
    switch (offerStatus) {
      case 'draft': return 'স্ট্যাটাস: খসড়া (Draft)';
      case 'sent': return 'স্ট্যাটাস: প্রেরিত (Sent)';
      case 'accepted': return 'স্ট্যাটাস: গৃহীত (Accepted)';
      default: return offerStatus;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-emerald-950 text-white p-6 rounded-2xl border border-neutral-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <FileText className="w-3 h-3 text-emerald-400" />
                {isBangla ? 'বাংলাদেশি এক্সিকিউটিভ অফার প্রটোকল' : 'Bangladesh Executive Offer Protocol'}
              </span>
              <span className="text-xs text-neutral-400">
                • {isBangla ? 'বিডিটি (৳) বেতন ও ডিজিটাল স্বাক্ষর' : 'BDT Compensation & Digital Signatures'}
              </span>
            </div>
            <h1 className="text-2xl font-bold mt-1 text-white">
              {isBangla ? 'অফার লেটার বিল্ডার ও ডিজিটাল স্বাক্ষর ওয়ার্কফ্লো' : 'Offer Letter Builder & Digital Signature Workflow'}
            </h1>
            <p className="text-xs text-neutral-300 mt-1 max-w-2xl leading-relaxed">
              {isBangla 
                ? 'বাংলাদেশি শ্রম আইন ও করপোরেট মান অনুযায়ী আনুষ্ঠানিক অফার লেটার তৈরি করুন — মাসিক বেতন (টাকায়), উৎসব বোনাস, ইকুইটি শেয়ার এবং উভয়পক্ষের ডিজিটাল সিগনেচার সহ।' 
                : 'Generate formal corporate offer letters formatted with Bangladeshi labor standards, compensation in BDT (৳), equity allocations, and dual digital signature execution.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="px-3 py-1.5 bg-neutral-800/80 rounded-xl text-xs font-semibold text-neutral-200 border border-neutral-700 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              {isBangla ? 'প্রার্থী:' : 'Candidate:'}
            </span>
            <select
              value={selectedAppId}
              onChange={e => handleSelectApp(e.target.value)}
              className="bg-neutral-800 text-white text-xs border border-neutral-700 rounded-xl p-2 font-medium focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {applications.map(a => (
                <option key={a.id} value={a.id}>
                  {a.candidateName} — {a.jobTitle}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mode Switcher & Quick Actions */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'preview' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isBangla ? 'ডকুমেন্ট প্রিভিউ ও স্বাক্ষর' : 'Document Preview & Sign'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'editor' ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{isBangla ? 'শর্তাবলী সম্পাদনা' : 'Edit Offer Terms'}</span>
            </button>
          </div>

          {/* Workflow Status Badge */}
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${
            offerStatus === 'accepted' 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
              : offerStatus === 'sent' 
              ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' 
              : 'bg-neutral-100 text-neutral-700'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current" />
            {getStatusLabel()}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isBangla ? 'প্রিন্ট / পিডিএফ হিসেবে সংরক্ষণ' : 'Print / Save as PDF'}</span>
          </button>

          {offerStatus === 'draft' && (
            <button
              type="button"
              onClick={handleSendOffer}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isBangla ? 'প্রার্থীকে অফার লেটার পাঠান' : 'Send Official Offer to Candidate'}</span>
            </button>
          )}

          {offerStatus === 'sent' && !isCandidateSigned && (
            <button
              type="button"
              onClick={handleCandidateAccept}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Stamp className="w-3.5 h-3.5" />
              <span>{isBangla ? 'প্রার্থীর ডিজিটাল স্বাক্ষর সিমুলেট করুন' : 'Simulate Candidate Digital Signing'}</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: EDIT OFFER PARAMETERS FORM */}
      {activeTab === 'editor' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs space-y-6">
          <h3 className="font-bold text-sm text-neutral-900 pb-3 border-b border-neutral-100">
            {isBangla ? 'বেতন ও চাকরির শর্তাবলী কাস্টমাইজ করুন' : 'Customize Compensation & Employment Terms'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                {isBangla ? 'প্রার্থীর পূর্ণ নাম' : 'Candidate Full Name'}
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={e => setCandidateName(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-neutral-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                {isBangla ? 'প্রার্থীর ইমেইল' : 'Candidate Email'}
              </label>
              <input
                type="email"
                value={candidateEmail}
                onChange={e => setCandidateEmail(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-neutral-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                {isBangla ? 'পদবী / ডেজিগনেশন' : 'Designation / Role Title'}
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-neutral-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                {isBangla ? 'বিভাগ / ডিপার্টমেন্ট' : 'Department'}
              </label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-neutral-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                {isBangla ? 'মাসিক মূল বেতন (বিডিটি ৳)' : 'Monthly Base Salary (BDT ৳)'}
              </label>
              <input
                type="number"
                value={monthlySalaryBdt}
                onChange={e => setMonthlySalaryBdt(Number(e.target.value))}
                className="w-full p-2.5 border rounded-xl bg-neutral-50 font-bold text-emerald-800"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                {isBangla ? 'বার্ষিক সমতুল্য:' : 'Annual Equivalent:'} {formatBDT(monthlySalaryBdt * 12)} / {isBangla ? 'বছর' : 'year'}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                {isBangla ? 'যোগদানের তারিখ' : 'Joining / Commencement Date'}
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={e => setJoiningDate(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-neutral-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                {isBangla ? 'প্রবেশন সময়কাল (মাস)' : 'Probation Period (Months)'}
              </label>
              <select
                value={probationMonths}
                onChange={e => setProbationMonths(Number(e.target.value))}
                className="w-full p-2.5 border rounded-xl bg-neutral-50"
              >
                <option value={3}>{isBangla ? '৩ মাস প্রবেশন' : '3 Months Probation'}</option>
                <option value={6}>{isBangla ? '৬ মাস প্রবেশন' : '6 Months Probation'}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                {isBangla ? 'কাজের স্থান ও কাজের ধরন' : 'Work Location Model'}
              </label>
              <input
                type="text"
                value={workLocation}
                onChange={e => setWorkLocation(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-neutral-50"
              />
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                {isBangla ? 'স্টক অপশন / ESOP ইকুইটি প্ল্যান' : 'Stock Options / ESOP Equity Plan'}
              </label>
              <input
                type="text"
                value={stockOptions}
                onChange={e => setStockOptions(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-neutral-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">
                {isBangla ? 'বোনাস কাঠামো (উৎসব ও পারফরম্যান্স)' : 'Bonus Structure (Festival & Performance)'}
              </label>
              <textarea
                rows={2}
                value={bonusStructure}
                onChange={e => setBonusStructure(e.target.value)}
                className="w-full p-2.5 border rounded-xl bg-neutral-50"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              {isBangla ? 'সংরক্ষণ করুন ও ডকুমেন্ট প্রিভিউ দেখুন ➔' : 'Save & Preview Document ➔'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE LETTER PREVIEW & DIGITAL SIGNATURE PAD */}
      {activeTab === 'preview' && (
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-md max-w-4xl mx-auto print:p-0 print:border-none print:shadow-none space-y-8 font-sans text-neutral-800">
          {/* Formal Company Letterhead */}
          <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-black text-lg">
                  K
                </div>
                <div>
                  <h2 className="text-xl font-black text-neutral-900 tracking-tight uppercase">
                    {currentCompany?.name || 'KORMO BD TECHNOLOGIES LTD.'}
                  </h2>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    {isBangla 
                      ? 'কর্পোরেট প্রধান কার্যালয়: লেভেল ১২, ক্রিস্টাল টাওয়ার, গুলশান-২, ঢাকা-১২১২, বাংলাদেশ' 
                      : 'Corporate Head Office: Level 12, Crystal Tower, Gulshan-2, Dhaka-1212, Bangladesh'}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-neutral-500">
              <span className="font-bold text-neutral-900 block">Ref: KBD/OFFER/2026/089</span>
              <span>
                {isBangla ? 'তারিখ:' : 'Date:'} {new Date().toLocaleDateString(isBangla ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Addressee */}
          <div className="text-xs space-y-1">
            <p className="font-bold text-neutral-900 text-sm">{candidateName}</p>
            <p className="text-neutral-600">{candidateAddress}</p>
            <p className="text-neutral-600">Email: {candidateEmail}</p>
          </div>

          {/* Subject Line */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-900">
            {isBangla 
              ? `বিষয়: "${jobTitle}" পদে চাকুরির আনুষ্ঠানিক নিয়োগপত্র (অফার লেটার)` 
              : `Subject: Official Offer of Employment for the Position of "${jobTitle}"`}
          </div>

          {/* Opening Paragraph */}
          <div className="text-xs leading-relaxed space-y-3 text-neutral-700">
            <p>
              {isBangla ? 'প্রিয়' : 'Dear'} <strong>{candidateName}</strong>,
            </p>
            <p>
              {isBangla 
                ? <><strong>{currentCompany?.name || 'Kormo BD Technologies Ltd.'}</strong>-এর পক্ষ থেকে, আমরা অত্যন্ত আনন্দের সাথে আপনাকে আমাদের <strong>{department}</strong> টিমে <strong>{jobTitle}</strong> পদে চাকুরির এই আনুষ্ঠানিক অফার প্রদান করছি।</>
                : <>On behalf of <strong>{currentCompany?.name || 'Kormo BD Technologies Ltd.'}</strong>, we are delighted to offer you the position of <strong>{jobTitle}</strong> in our <strong>{department}</strong> team.</>}
            </p>
            <p>
              {isBangla 
                ? 'আমাদের নিয়োগ কমিটি এবং টেকনিক্যাল প্যানেলের সাথে ইন্টারভিউ ও মূল্যায়নে আপনার স্থাপত্যিক দক্ষতা, সমস্যা সমাধানের গভীরতা ও সততা আমাদের মুগ্ধ করেছে। আমরা অত্যন্ত আস্থাবান যে আপনার অভিজ্ঞতা আমাদের প্রযুক্তিগত অগ্রগতিতে অনন্য ভূমিকা রাখবে।' 
                : 'Following your interviews and technical assessments with our engineering committee, we were immensely impressed by your problem-solving capabilities, domain expertise, and cultural alignment. We are confident you will make a profound impact on our technology roadmap.'}
            </p>
          </div>

          {/* Key Employment & Compensation Summary Table */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden text-xs">
            <div className="bg-neutral-900 text-white font-bold p-3 text-xs flex items-center justify-between">
              <span>{isBangla ? 'নিয়োগ ও পারিশ্রমিক সারসংক্ষেপ (টাকা)' : 'Employment & Compensation Summary (BDT)'}</span>
              <span className="text-[10px] font-mono text-emerald-400">
                {isBangla ? 'সম্পূর্ণ গোপনীয়' : 'Strictly Confidential'}
              </span>
            </div>

            <div className="divide-y divide-neutral-200">
              <div className="p-3 grid grid-cols-3 bg-white">
                <span className="font-semibold text-neutral-600">{isBangla ? 'পদবী' : 'Designation'}</span>
                <span className="col-span-2 font-bold text-neutral-900">{jobTitle}</span>
              </div>
              <div className="p-3 grid grid-cols-3 bg-neutral-50/50">
                <span className="font-semibold text-neutral-600">{isBangla ? 'বিভাগ' : 'Department'}</span>
                <span className="col-span-2 text-neutral-900">{department}</span>
              </div>
              <div className="p-3 grid grid-cols-3 bg-white">
                <span className="font-semibold text-neutral-600">{isBangla ? 'মাসিক মোট বেতন' : 'Monthly Gross Salary'}</span>
                <span className="col-span-2 font-bold text-emerald-700 text-sm">
                  {formatBDT(monthlySalaryBdt)} <span className="text-xs font-normal text-neutral-500">({numberToWordsBdt(monthlySalaryBdt)})</span>
                </span>
              </div>
              <div className="p-3 grid grid-cols-3 bg-neutral-50/50">
                <span className="font-semibold text-neutral-600">{isBangla ? 'বার্ষিক সমতুল্য' : 'Annual Gross Equivalent'}</span>
                <span className="col-span-2 font-bold text-neutral-900">
                  {formatBDT(monthlySalaryBdt * 12)} / {isBangla ? 'বছর' : 'year'}
                </span>
              </div>
              <div className="p-3 grid grid-cols-3 bg-white">
                <span className="font-semibold text-neutral-600">{isBangla ? 'উৎসব ও বোনাস কাঠামো' : 'Bonus Allocation'}</span>
                <span className="col-span-2 text-neutral-800 leading-snug">{bonusStructure}</span>
              </div>
              <div className="p-3 grid grid-cols-3 bg-neutral-50/50">
                <span className="font-semibold text-neutral-600">{isBangla ? 'ইকুইটি / স্টক অপশন' : 'Equity / Stock Options'}</span>
                <span className="col-span-2 text-neutral-800 leading-snug">{stockOptions}</span>
              </div>
              <div className="p-3 grid grid-cols-3 bg-white">
                <span className="font-semibold text-neutral-600">{isBangla ? 'প্রস্তাবিত যোগদানের তারিখ' : 'Proposed Joining Date'}</span>
                <span className="col-span-2 font-bold text-neutral-900">{joiningDate}</span>
              </div>
              <div className="p-3 grid grid-cols-3 bg-neutral-50/50">
                <span className="font-semibold text-neutral-600">{isBangla ? 'প্রবেশন সময়কাল' : 'Probation Period'}</span>
                <span className="col-span-2 text-neutral-900">
                  {probationMonths} {isBangla ? 'মাস (যোগদানের তারিখ থেকে)' : 'months from joining date'}
                </span>
              </div>
              <div className="p-3 grid grid-cols-3 bg-white">
                <span className="font-semibold text-neutral-600">{isBangla ? 'কাজের মডেল ও অফিস' : 'Working Model & Office'}</span>
                <span className="col-span-2 text-neutral-900">{workLocation}</span>
              </div>
              <div className="p-3 grid grid-cols-3 bg-neutral-50/50">
                <span className="font-semibold text-neutral-600">{isBangla ? 'কর্মঘণ্টা' : 'Working Hours'}</span>
                <span className="col-span-2 text-neutral-900">{workingHours}</span>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-neutral-900">
              {isBangla ? 'কোম্পানির কর্পোরেট সুযোগ-সুবিধাসমূহ:' : 'Standard Corporate Perks & Benefits:'}
            </h4>
            <ul className="list-disc list-inside space-y-1 text-neutral-700">
              {benefitsList.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>

          {/* Dual Digital Signature Blocks */}
          <div className="pt-6 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
            {/* Employer / Recruiter Signature */}
            <div className="space-y-3">
              <span className="font-bold text-neutral-900 block">
                {isBangla ? 'কোম্পানির পক্ষে স্বাক্ষরিত:' : 'Signed on Behalf of Company:'}
              </span>
              <div className="h-20 border-b-2 border-neutral-800 flex flex-col justify-end pb-2">
                <span className="font-serif italic text-lg text-indigo-900 font-bold">
                  {recruiterSignerName}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {isBangla ? 'কোরমো বিডি এন্টারপ্রাইজ কী দ্বারা ডিজিটালি যাচাইকৃত' : 'Digitally Verified via Kormo BD Enterprise Key'}
                </span>
              </div>
              <div>
                <p className="font-bold text-neutral-900">{recruiterSignerName}</p>
                <p className="text-neutral-500">{recruiterSignerTitle}</p>
                <p className="text-[11px] text-neutral-400">Kormo BD Technologies Ltd.</p>
              </div>
            </div>

            {/* Candidate Acceptance Digital Signature Block */}
            <div className="space-y-3">
              <span className="font-bold text-neutral-900 block">
                {isBangla ? 'প্রার্থীর সম্মতি ও স্বীকৃতি:' : 'Candidate Acceptance & Acknowledgement:'}
              </span>
              <div className="h-20 border-b-2 border-neutral-800 flex flex-col justify-end pb-2">
                {isCandidateSigned ? (
                  <>
                    <span className="font-serif italic text-lg text-emerald-800 font-bold">
                      {candidateSignatureName}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> {isBangla ? 'ডিজিটালি স্বাক্ষরিত' : 'Digitally Signed on'} {new Date().toLocaleDateString(isBangla ? 'bn-BD' : 'en-GB')}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-neutral-400 italic">
                    {offerStatus === 'sent' 
                      ? (isBangla ? 'প্রার্থীর ডিজিটাল স্বাক্ষরের অপেক্ষায়' : 'Awaiting candidate digital signature') 
                      : (isBangla ? 'অফার প্রেরণের অপেক্ষায়' : 'Pending offer dispatch')}
                  </span>
                )}
              </div>
              <div>
                <p className="font-bold text-neutral-900">{candidateName}</p>
                <p className="text-neutral-500">{isBangla ? 'প্রার্থীর স্বাক্ষর' : 'Candidate Signature'}</p>
                <p className="text-[11px] text-neutral-400">
                  {isBangla ? 'গ্রহণের তারিখ:' : 'Date of Acceptance:'} {isCandidateSigned ? (isBangla ? 'আজ' : 'Today') : (isBangla ? 'অপেক্ষমাণ' : 'Pending')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
