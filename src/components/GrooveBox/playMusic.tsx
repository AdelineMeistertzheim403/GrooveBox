import React from "react";
import { Link } from "react-router-dom";

type PlayMusicProps = {
  onStart?: () => void;
  label?: string;
  to?: string;
  containerStyle?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  useDefaultPosition?: boolean;
};

function PlayMusic({
  onStart,
  to,
  label = "GrooveBox Visualizer",
  containerStyle,
  buttonStyle,
  useDefaultPosition = true,
}: PlayMusicProps) {
  const containerStyles = useDefaultPosition ? styles.container : {};
  const content = (
    <button
      type="button"
      onClick={onStart}
      style={{ ...styles.button, ...buttonStyle }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ ...containerStyles, ...containerStyle }}>
      {to ? (
        <Link to={to} style={{ textDecoration: "none" }}>
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}

const styles = {
  container: {
    position: "fixed",
    top: "16px",
    right: "20px",
    zIndex: 1000,
  },
  button: {
    padding: "10px 18px",
    fontSize: "15px",
    borderRadius: "8px",
    background: "#0cc151",
    color: "#042027",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    boxShadow: "0 3px 8px rgba(0,0,0,0.4)",
  },
};

export default PlayMusic;