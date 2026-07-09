import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 text-center backdrop-blur-md">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-white">404</h1>
          <h2 className="text-xl font-bold text-slate-200">Page Not Found</h2>
          <p className="text-sm text-slate-400">
            The link you followed may be broken or the page may have been removed.
          </p>
        </div>
        <div className="pt-4 border-t border-slate-800">
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-sm font-semibold rounded-xl transition duration-200 shadow-lg shadow-violet-500/25"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
