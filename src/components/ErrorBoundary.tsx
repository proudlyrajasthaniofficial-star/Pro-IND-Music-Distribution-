import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white p-4">
          <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h1 className="text-2xl font-bold mb-4">Oops! Something went wrong</h1>
            
            <p className="text-gray-400 mb-8 max-w-sm mx-auto text-sm">
              We've encountered an unexpected glitch. Our team has been notified. 
              {this.state.error && (
                <span className="block mt-2 font-mono text-xs text-red-400/80 bg-red-500/5 p-2 rounded truncate">
                  {this.state.error.message}
                </span>
              )}
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 group"
            >
              <RefreshCcw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
