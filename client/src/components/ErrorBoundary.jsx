import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`${this.props.gameType || "Game"} Error:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const gameType = this.props.gameType || "game";
      const gameName =
        gameType === "chess"
          ? "Chess"
          : gameType === "color"
          ? "Color Prediction"
          : "Game";

      return (
        <div className={`${gameType}-game`}>
          <div className="error-screen">
            <h2>Something went wrong</h2>
            <p>
              The {gameName} game encountered an error. Please try refreshing
              the page.
            </p>
            <button onClick={() => window.location.reload()}>
              Refresh Page
            </button>
            <details style={{ marginTop: "10px" }}>
              <summary>Error Details</summary>
              <pre style={{ fontSize: "12px", color: "#666" }}>
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
