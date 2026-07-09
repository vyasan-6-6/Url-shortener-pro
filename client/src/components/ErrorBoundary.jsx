import React, { Component } from 'react';
import { AlertOctagon } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // 1. Catches the error and triggers the fallback UI render state
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // 2. Logs error details (can hook up to external logging services like Sentry here)
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Premium fallback UI for unexpected frontend crashes
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6 backdrop-blur-md">
            
            <div className="w-16 h-16 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse">
              <AlertOctagon className="w-8 h-8 text-red-500" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-white">Something Went Wrong</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                An unexpected JavaScript error occurred in the browser. We apologize for the inconvenience.
              </p>
              {this.state.error && (
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-[10px] text-red-400 font-mono text-left max-h-24 overflow-auto break-all">
                  {this.state.error.toString()}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold rounded-xl transition duration-200 shadow-lg cursor-pointer"
              >
                Reload Application
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
