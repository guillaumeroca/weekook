import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f2f4fc] flex items-center justify-center px-4">
          <div className="text-center max-w-[400px]">
            <div className="w-16 h-16 mx-auto bg-[#c1a0fd]/10 rounded-full flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c1a0fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="text-[20px] font-bold text-[#111125] mb-2">
              Une erreur est survenue
            </h1>
            <p className="text-[14px] text-[#111125]/50 mb-6">
              Nous sommes désolés, quelque chose s'est mal passé. Veuillez rafraîchir la page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-[#c1a0fd] text-white font-semibold text-[14px] rounded-[12px] hover:bg-[#b090ed] transition-all"
            >
              Rafraîchir la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
