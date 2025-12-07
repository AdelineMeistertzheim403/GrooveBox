import { useState, useEffect } from "react";
import "./TempoSlider.css";

const TempoSlider = ({ initialBpm = 120, onBpmChange }) => {
  const [bpm, setBpm] = useState(initialBpm);

  useEffect(() => {
    setBpm(initialBpm);
  }, [initialBpm]);

  useEffect(() => {
    if (typeof onBpmChange === "function") {
      onBpmChange(bpm);
    }
  }, [bpm]);

  const adjust = (delta) => {
    setBpm((prev) => Math.min(Math.max(prev + delta, 60), 200));
  };

  return (
    <div className="bpm-slider">
      <div className="bpm-readout">
        <span className="bpm-label">BPM</span>
        <span className="bpm-value">{bpm}</span>
      </div>
      <input
        type="range"
        min={60}
        max={200}
        step={1}
        value={bpm}
        onChange={(e) => setBpm(Number(e.target.value))}
      />
      <div className="bpm-buttons">
        <button onClick={() => adjust(-5)} aria-label="Decrease BPM">-5</button>
        <button onClick={() => adjust(-1)} aria-label="Decrease BPM">-1</button>
        <button onClick={() => adjust(1)} aria-label="Increase BPM">+1</button>
        <button onClick={() => adjust(5)} aria-label="Increase BPM">+5</button>
      </div>
    </div>
  );
};

export default TempoSlider;