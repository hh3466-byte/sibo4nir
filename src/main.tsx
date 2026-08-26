import React, { StrictMode, Component, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[SIBO-App] Uncaught render error:', error, errorInfo);
    try {
      fetch('/api/telemetry/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'react_render_crash',
          data: {
            errorMessage: error?.message,
            errorStack: error?.stack?.substring(0, 400),
            componentStack: errorInfo?.componentStack?.substring(0, 400),
          },
        }),
      }).catch(() => {});
    } catch {}
  }

  handleReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = window.location.origin + window.location.pathname;
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen bg-stone-900 text-white flex items-center justify-center p-6 font-['Assistant',sans-serif]"
        >
          <div className="max-w-md w-full bg-stone-800 rounded-3xl p-6 sm:p-8 border border-stone-700 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-3xl font-black">
              🚦
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">טעינת האפליקציה חודשה</h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                האפליקציה אותחלה בהצלחה. לחצי על הכפתור למטה כדי לפתוח את הסורק מחדש!
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🔄 פתח את סורק SIBO מחדש</span>
            </button>
            {this.state.error && (
              <p className="text-[10px] text-stone-500 text-left font-mono overflow-hidden text-ellipsis whitespace-nowrap">
                {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}
