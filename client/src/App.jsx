import React from 'react';

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 text-center backdrop-blur-md">
        <div className="w-16 h-16 bg-violet-600/10 border border-violet-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(139,92,246,0.15)] animate-pulse">
          <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            URL Shortener Pro
          </h1>
          <p className="text-sm text-slate-400">
            A premium, high-performance link management application.
          </p>
        </div>
        <div className="pt-4 border-t border-slate-800">
          <div className="text-xs font-semibold text-violet-400 bg-violet-950/40 border border-violet-900/50 rounded-full px-3 py-1 inline-block">
            Tailwind CSS v4 Connected Successfully
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
