import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-8">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ⚠️
            </div>
            <h1 className="text-2xl font-bold text-charcoal mb-2 font-raleway">
              Something went wrong
            </h1>
            <p className="text-neutral-500 text-sm mb-6">
              We encountered an unexpected display error. Please reload the page to continue.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all text-sm shadow-sm"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 py-3 px-4 bg-neutral-100 text-charcoal font-bold rounded-xl hover:bg-neutral-200 transition-all text-sm"
              >
                Go to Home
              </button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left text-xs bg-neutral-100 p-3 rounded-lg overflow-auto max-h-40">
                <summary className="font-bold text-neutral-700 cursor-pointer">
                  Error details
                </summary>
                <pre className="mt-2 text-red-600 whitespace-pre-wrap font-mono">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
