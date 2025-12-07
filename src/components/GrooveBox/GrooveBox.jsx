import { useAtom } from "jotai";
import {
  patternAtom,
  currentStepAtom,
  muteAtom,
  soloAtom,
  volumeAtom,
  drumPresetAtom,
  patternLengthAtom,
  stepVelocityAtom,
  stepProbabilityAtom,
} from "../../state/grooveState";
import Track from "./Track";
import "./groovebox.css";

export default function GrooveBox() {
  const [pattern, setPattern] = useAtom(patternAtom);
  const [currentStep] = useAtom(currentStepAtom);
  const [mutes, setMutes] = useAtom(muteAtom);
  const [solos, setSolos] = useAtom(soloAtom);
  const [volumes, setVolumes] = useAtom(volumeAtom);
  const [drumPresets, setDrumPresets] = useAtom(drumPresetAtom);
  const [patternLengths, setPatternLengths] = useAtom(patternLengthAtom);
  const [stepVelocities, setStepVelocities] = useAtom(stepVelocityAtom);
  const [stepProbabilities, setStepProbabilities] = useAtom(stepProbabilityAtom);
  const tracks = [
    { name: "Kick", trackKey: "kick" },
    { name: "808 Kick", trackKey: "kick808" },
    { name: "Snare", trackKey: "snare" },
    { name: "909 Snare", trackKey: "snare909" },
    { name: "Hi-Hat", trackKey: "hat" },
    { name: "Clap", trackKey: "clap" },
    { name: "Bass", trackKey: "bass" },
    { name: "FM Bass", trackKey: "fmBass" },
      { name: "Pad", trackKey: "pad" },
      { name: "Keys", trackKey: "keys" },
      { name: "Sampler", trackKey: "sampler" },
    ];
  const presetOptions = {
    kick: ["Punch", "Deep", "Clicky"],
    kick808: ["Boom808", "Short808", "Click808"],
    snare: ["Tight", "Roomy", "ClapSnare"],
    snare909: ["Classic909", "Fat909", "Snappy909"],
    hat: ["Tight", "Bright", "Dark"],
    clap: ["Wide", "Sharp", "Big"],
    bass: ["Warm", "Pluck", "Growl"],
    fmBass: ["SoftFM", "Metallic", "Crunch"],
    pad: ["Airy", "Warm", "Glass"],
    keys: ["Soft", "Glassy", "Organ"],
    sampler: ["Perc", "Short", "Soft"],
  };

  return (
    <div className="groovebox">
      {tracks.map(({ name, trackKey }) => (
        <Track
          key={trackKey}
          name={name}
          trackKey={trackKey}
          pattern={pattern}
          currentStep={currentStep}
          mute={mutes[trackKey]}
          solo={solos[trackKey]}
          volume={volumes[trackKey]}
          preset={drumPresets[trackKey]}
          presetOptions={presetOptions[trackKey]}
          length={patternLengths[trackKey]}
          setLength={(val) =>
            setPatternLengths((prev) => ({
              ...prev,
              [trackKey]: val,
            }))
          }
          velocities={stepVelocities}
          setVelocities={setStepVelocities}
          probabilities={stepProbabilities}
          setProbabilities={setStepProbabilities}
          setMute={(val) =>
            setMutes((prev) => ({
              ...prev,
              [trackKey]: typeof val === "boolean" ? val : !prev[trackKey],
            }))
          }
          setSolo={(val) =>
            setSolos((prev) => ({
              ...prev,
              [trackKey]: typeof val === "boolean" ? val : !prev[trackKey],
            }))
          }
          setVolume={(val) =>
            setVolumes((prev) => ({
              ...prev,
              [trackKey]: Math.min(Math.max(val, 0), 1.6),
            }))
          }
          setPreset={
            presetOptions[trackKey]
              ? (val) =>
                  setDrumPresets((prev) => ({
                    ...prev,
                    [trackKey]: val,
                  }))
              : undefined
          }
          setPattern={setPattern}
        />
      ))}
    </div>
  );
}
