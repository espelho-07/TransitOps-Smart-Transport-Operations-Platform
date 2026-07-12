import React, { Component } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Button from './ui/Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an exception:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoDashboard = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 select-none space-y-6">
          <div className="h-16 w-16 bg-danger/10 text-danger flex items-center justify-center rounded-2xl animate-bounce">
            <AlertTriangle size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-text-main uppercase tracking-tight">Something went wrong</h2>
            <p className="text-text-secondary text-xs max-w-sm mx-auto leading-relaxed font-semibold">
              An unexpected runtime error was caught during platform rendering.
            </p>
            {this.state.error && (
              <pre className="mt-4 p-3 bg-hover/10 text-danger border border-border/80 rounded-xl text-[10px] font-mono text-left max-w-md overflow-x-auto mx-auto leading-relaxed">
                {this.state.error.toString()}
              </pre>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={this.handleReload} className="font-bold flex items-center gap-1.5">
              <RotateCcw size={14} />
              <span>Reload Page</span>
            </Button>
            <Button variant="info" size="sm" onClick={this.handleGoDashboard} className="font-bold flex items-center gap-1.5">
              <Home size={14} />
              <span>Go Dashboard</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
