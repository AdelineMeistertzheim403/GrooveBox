import StepButton from "./StepButton";
import { useEffect, useState } from "react";
import { getTrackLevel, updateTrackVolumes } from "../../audio/instruments";

export default function Track({
  name,
  trackKey,
  pattern,
  setPattern,
  currentStep,
  mute,
  solo,
  volume,
  setMute,
  setSolo,
  setVolume,
  preset,
  presetOptions,
  setPreset,
  length,
  setLength,
  velocities,
  setVelocities,
  probabilities,
  setProbabilities,
}) {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    let raf;
    function tick() {
      const val = getTrackLevel(trackKey);
      setLevel(val);
      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => cancelAnimationFrame(raf);
  }, [trackKey]);

  function ensureArrays() {
    // keep arrays at least 32 long so length changes don't lose data
    setPattern((prev) => {
      const copy = { ...prev };
      const row = Array.isArray(copy[trackKey]) ? [...copy[trackKey]] : [];
      while (row.length < 32) row.push(false);
      copy[trackKey] = row;
      return copy;
    });
    setVelocities((prev) => {
      const copy = { ...prev };
      const row = Array.isArray(copy[trackKey]) ? [...copy[trackKey]] : [];
      while (row.length < 32) row.push(1);
      copy[trackKey] = row;
      return copy;
    });
    setProbabilities((prev) => {
      const copy = { ...prev };
      const row = Array.isArray(copy[trackKey]) ? [...copy[trackKey]] : [];
      while (row.length < 32) row.push(1);
      copy[trackKey] = row;
      return copy;
    });
  }

  function toggleStep(index) {
    ensureArrays();
    setPattern((prev) => {
      const copy = { ...prev };
      const row = [...copy[trackKey]];
      row[index] = !row[index];
      copy[trackKey] = row;
      return copy;
    });
  }

  function cycleVelocity(index) {
    const states = [1, 1.25, 0.75];
    setVelocities((prev) => {
      const copy = { ...prev };
      const row = [...(copy[trackKey] || [])];
      while (row.length <= index) row.push(1);
      const current = row[index] ?? 1;
      const idx = states.findIndex((s) => Math.abs(s - current) < 0.02);
      const next = states[(idx + 1) % states.length];
      row[index] = next;
      copy[trackKey] = row;
      return copy;
    });
  }

  function cycleProbability(index) {
    const states = [1, 0.7, 0.4];
    setProbabilities((prev) => {
      const copy = { ...prev };
      const row = [...(copy[trackKey] || [])];
      while (row.length <= index) row.push(1);
      const current = row[index] ?? 1;
      const idx = states.findIndex((s) => Math.abs(s - current) < 0.02);
      const next = states[(idx + 1) % states.length];
      row[index] = next;
      copy[trackKey] = row;
      return copy;
    });
  }

  const currentLength = length || 16;
  const velRow = velocities?.[trackKey] || [];
  const probRow = probabilities?.[trackKey] || [];

  return (
    <div className="track">
      <div className="label">{name}</div>
      <div className="track-toggles">
        <button
          className={`solo-btn ${solo ? "soloed" : ""}`}
          onClick={() => setSolo(!solo)}
          aria-pressed={solo}
          title="Solo"
        >
          Solo
        </button>
        <button
          className={`mute-btn ${mute ? "muted" : ""}`}
          onClick={() => setMute(!mute)}
          aria-pressed={mute}
          title="Mute"
        >
          {mute ? "Muted" : "Mute"}
        </button>
        {presetOptions ? (
          <select
            value={preset}
            onChange={(e) => setPreset && setPreset(e.target.value)}
            style={{
              fontSize: 12,
              padding: "4px 6px",
              borderRadius: 8,
              background: "#0d1018",
              color: "#cdd6e8",
              border: "1px solid #1f2533",
            }}
          >
            {presetOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : null}
        {setLength ? (
          <select
            className="step-length-select"
            value={currentLength}
            onChange={(e) => setLength(Number(e.target.value))}
            title="Longueur du pattern pour cette piste"
          >
            {[8, 12, 16, 32].map((len) => (
              <option key={len} value={len}>
                {len} pas
              </option>
            ))}
          </select>
        ) : null}
      </div>
      <div className="track-steps">
        {pattern[trackKey].slice(0, currentLength).map((active, index) => (
          <StepButton
            key={index}
            active={active}
            isPlaying={currentStep % currentLength === index}
            velocity={velRow[index] ?? 1}
            probability={probRow[index] ?? 1}
            onClick={() => toggleStep(index)}
            onAltClick={() => cycleProbability(index)}
            onRightClick={() => cycleVelocity(index)}
          />
        ))}
      </div>
      <label className="vol-slider" title="Volume piste">
        <input
          type="range"
          min={0}
          max={1.6}
          step={0.01}
          value={volume}
          onChange={(e) => {
            const val = Number(e.target.value);
            setVolume(val);
            updateTrackVolumes({ [trackKey]: val });
          }}
        />
        <span className="vol-value">{volume.toFixed(2)}</span>
        <div
          style={{
            width: 80,
            height: 8,
            borderRadius: 6,
            background: "#1b1f2a",
            overflow: "hidden",
            marginLeft: 6,
            border: "1px solid #1f2533",
          }}
        >
          <div
            style={{
              width: `${Math.round(level * 100)}%`,
              height: "100%",
              background: "linear-gradient(90deg, #24e3ff, #84ff6b)",
              transition: "width 60ms linear",
            }}
          />
        </div>
      </label>
    </div>
  );
}
