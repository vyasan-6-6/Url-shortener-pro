import React from 'react';
import { AlertOctagon } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6 backdrop-blur-md">
        
        {/* Error Warning Icon */}
        <div className="w-16 h-16 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse">
          <AlertOctagon className="w-8 h-8 text-red-500" />
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Something Went Wrong</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            An unexpected JavaScript error occurred in the browser. We apologize for the inconvenience.
          </p>
          {error && (
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-[10px] text-red-400 font-mono text-left max-h-24 overflow-auto break-all">
              {error.message || error.toString()}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              if (resetErrorBoundary) {
                resetErrorBoundary();
              }
              window.location.reload();
            }}
            className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold rounded-xl transition duration-200 shadow-lg cursor-pointer"
          >
            Reload Application
          </button>
        </div>

      </div>
    </div>
  );
}

export default ErrorFallback;
