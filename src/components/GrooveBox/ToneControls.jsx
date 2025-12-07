import { useAtom } from "jotai";
import { soundControlsAtom } from "../../state/grooveState";

const sliders = [
  { key: "swing", label: "Swing (shuffle)", min: 0, max: 0.9, step: 0.01, suffix: "" },
  { key: "humanize", label: "Humanize", min: 0, max: 30, step: 1, suffix: "ms" },
  { key: "reverbWet", label: "Reverb", min: 0, max: 0.8, step: 0.01, suffix: "" },
  { key: "delayFeedback", label: "Delay fb", min: 0, max: 0.7, step: 0.01, suffix: "" },
  { key: "hatTone", label: "Hat tone", min: 150, max: 1200, step: 10, suffix: "Hz" },
  { key: "bassCutoff", label: "Bass cutoff", min: 80, max: 800, step: 10, suffix: "Hz" },
  { key: "padCutoff", label: "Pad cutoff", min: 200, max: 4000, step: 20, suffix: "Hz" },
  { key: "keysTranspose", label: "Transpose", min: -12, max: 12, step: 1, suffix: "st" },
  { key: "sidechain", label: "Sidechain", min: 0, max: 1, step: 1, suffix: "" },
];

export default function ToneControls({ action, fields, showArp = false }) {
  const [controls, setControls] = useAtom(soundControlsAtom);

  function onChange(key, value) {
    setControls((prev) => ({ ...prev, [key]: value }));
  }

  const visibleSliders = fields
    ? sliders.filter((s) => fields.includes(s.key))
    : sliders;

  return (
    <div className="tone-panel">
      <div className="tone-panel__header">
        <div className="tone-panel__right" style={{ width: "100%", justifyContent: "space-between" }}>
          {showArp ? (
            <label className="tone-toggle">
              <input
                type="checkbox"
                checked={controls.arpOn}
                onChange={(e) => onChange("arpOn", e.target.checked)}
              />
              <span>Arpegiateur</span>
            </label>
          ) : null}
          <label className="tone-toggle">
            <span>Gamme</span>
            <select
              value={controls.scale}
              onChange={(e) => onChange("scale", e.target.value)}
              style={{ marginLeft: 8 }}
            >
              <option value="major">Majeur</option>
              <option value="minor">Mineur</option>
              <option value="pentatonic">Pentatonique</option>
              <option value="dorian">Dorien</option>
              <option value="mixolydian">Mixolydien</option>
            </select>
          </label>
          {action ? <div className="tone-panel__actions">{action}</div> : null}
        </div>
      </div>

      <div className="tone-grid">
        {visibleSliders.map(({ key, label, min, max, step, suffix }) => {
          const value = controls[key];
          return (
            <label key={key} className="tone-control">
              <div className="tone-control__row">
                <span>{label}</span>
                <span className="tone-control__value">
                  {suffix === "st"
                    ? `${value} st`
                    : suffix === "ms"
                    ? `${value} ms`
                    : suffix === ""
                    ? key === "sidechain"
                      ? value ? "On" : "Off"
                      : value
                    : `${value}${suffix}`}
                </span>
              </div>
              {key === "sidechain" ? (
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => onChange(key, e.target.checked)}
                />
              ) : (
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value}
                  onChange={(e) => onChange(key, Number(e.target.value))}
                />
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
