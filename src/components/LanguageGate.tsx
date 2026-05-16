'use client';

import { useEffect, useState } from 'react';
import { Language, translations } from '@/lib/translations';

export function LanguageGate() {
  const [show, setShow] = useState(false);
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const langCookie = cookies.find(row => row.startsWith('aro-lang='));
    if (!langCookie) {
      setShow(true);
    }
  }, []);

  const handleSelect = (l: Language) => {
    setLang(l);
    // Set cookie that lasts 1 year
    document.cookie = `aro-lang=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
    setShow(false);
    window.location.reload(); 
  };

  if (!show) return null;

  const languages = [
    { code: 'en', name: 'English', label: 'Default' },
    { code: 'hi', name: 'हिन्दी', label: 'Hindi' },
    { code: 'te', name: 'తెలుగు', label: 'Telugu' },
    { code: 'kn', name: 'ಕನ್ನಡ', label: 'Kannada' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0F19]/95 backdrop-blur-xl animate-in fade-in duration-700">
      <div className="max-w-xl w-full p-12 text-center">
        <div className="mb-12">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Welcome to Aro</h1>
          <p className="text-gray-400 uppercase tracking-widest text-xs font-bold">Select your preferred language</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code as Language)}
              className="group p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all text-left relative overflow-hidden"
            >
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-emerald-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">{l.name}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">{l.label}</p>
            </button>
          ))}
        </div>

        <p className="mt-12 text-[10px] text-gray-600 uppercase tracking-[0.2em] font-black">
          Precision Agriculture • Multi-Lingual Intelligence
        </p>
      </div>
    </div>
  );
}
