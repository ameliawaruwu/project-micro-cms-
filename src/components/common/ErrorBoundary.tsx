import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F7] flex flex-col items-center justify-center p-6 text-[#241A1A] font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E8DDDE] shadow-xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F5E8EA] flex items-center justify-center text-[#66000E]">
              <AlertTriangle className="w-7 h-7 text-[#66000E]" />
            </div>
            <h2 className="text-xl font-bold text-[#241A1A]">Terjadi Sedikit Kendala</h2>
            <p className="text-sm text-[#5F5652] leading-relaxed">
              Aplikasi mengalami gangguan sementara. Silakan muat ulang halaman untuk melanjutkan.
            </p>
            {this.state.error && (
              <div className="text-left bg-rose-50 border border-rose-200 p-3 rounded-xl max-h-40 overflow-y-auto">
                <p className="text-xs font-mono text-rose-700 font-bold">{this.state.error.name}: {this.state.error.message}</p>
                {this.state.error.stack && (
                  <pre className="text-[10px] font-mono text-rose-600 mt-1 whitespace-pre-wrap">{this.state.error.stack.split('\n').slice(0, 4).join('\n')}</pre>
                )}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-[#66000E] text-white font-medium text-sm hover:bg-[#801010] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Muat Ulang Halaman</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
