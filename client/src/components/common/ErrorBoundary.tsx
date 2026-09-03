import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('ErrorBoundary captured runtime error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-4 font-sans" dir="rtl">
          <div className="max-w-md w-full bg-card border border-line rounded-2xl p-6 shadow-xl text-center space-y-5">
            <div className="w-14 h-14 bg-accent-dim text-accent rounded-2xl mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-black text-ink">تم احتواء الخطأ البرمجي بنجاح</h2>
              <p className="text-xs text-sub leading-relaxed">
                واجهت الواجهة استثناءً غير متوقع، ولكن مسوداتك وبياناتك المحفوظة بقيت محمية تماماً في الذاكرة الآمنة دون أي ضياع.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-bg border border-line rounded-xl p-3 text-[11px] text-muted text-left font-mono overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة تحميل التطبيق</span>
              </button>

              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-bg hover:bg-line text-ink border border-line rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>الرئيسية</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
