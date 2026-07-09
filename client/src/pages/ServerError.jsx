import React from 'react';
import { Link } from 'react-router-dom';
import { ServerCrash } from 'lucide-react';

function ServerError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 text-center backdrop-blur-md">
        
        {/* Warning Icon Card */}
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(244,63,94,0.15)] animate-pulse">
          <ServerCrash className="w-8 h-8 text-rose-400" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-white animate-bounce">500</h1>
          <h2 className="text-xl font-bold text-slate-200">Internal Server Error</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Oops! Something went wrong on our servers. We have been notified of the crash and are working to resolve it.
          </p>
        </div>

        {/* Return Button */}
        <div className="pt-4 border-t border-slate-800">
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-semibold rounded-xl transition duration-200 shadow-lg shadow-violet-500/25 cursor-pointer"
          >
            Retry Connection
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ServerError;
