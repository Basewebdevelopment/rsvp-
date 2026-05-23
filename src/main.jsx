import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          textAlign: "center",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          color: "#2c2418",
          background: "#faf7f2",
        }}>
          <p style={{ letterSpacing: "0.3em", fontSize: 11, textTransform: "uppercase", color: "#8a7962" }}>
            Wedding Reception
          </p>
          <h1 style={{ fontSize: "2rem", fontWeight: 400, margin: "1rem 0", fontStyle: "italic" }}>
            Something went wrong
          </h1>
          <p style={{ maxWidth: 420, color: "#6b5d4a", lineHeight: 1.6 }}>
            {this.state.error.message || "The page failed to load."}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: "1.5rem",
              padding: "0.85rem 1.5rem",
              border: "1px solid #c4b49a",
              borderRadius: 4,
              background: "#fff",
              cursor: "pointer",
              letterSpacing: "0.2em",
              fontSize: 11,
              textTransform: "uppercase",
            }}
          >
            Try Again
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>
);
