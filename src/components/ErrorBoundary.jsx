import React from 'react'

// Error Boundary component
// Learning: React error handling, lifecycle methods, and graceful degradation

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error Boundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
    
    // You could also send this to a service like Sentry
    // logErrorToService(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    })
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-6">
            <div className="text-red-600 text-6xl">⚠️</div>
            <h1 className="text-2xl font-bold text-red-800 text-center">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-600 text-center">
              The app encountered an unexpected error. Don't worry, your data is safe!
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="w-full">
                <summary className="cursor-pointer text-red-600 font-medium">
                  Error Details (Development Mode)
                </summary>
                <div className="mt-4 p-4 bg-red-50 rounded-lg overflow-auto">
                  <p className="text-sm font-mono text-red-800">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="mt-2 text-xs text-red-700 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
            
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-md"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-md"
              >
                Reload Page
              </button>
            </div>
            
            <p className="text-sm text-gray-500 text-center">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary