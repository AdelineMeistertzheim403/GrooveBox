import * as Tone from "tone";
import {
  kick,
  kickTransient,
  kick808,
  kick808Transient,
  snare,
  snare909,
  hat,
  clap,
  bass,
  fmBass,
  pad,
  keys,
  trackGains,
  sampler,
} from "./instruments";

const basePadNotes = ["C3", "E3", "G3", "B3", "D4"]; // legacy fallback
const baseKeysNotes = ["C4", "E4", "G4", "B4", "D5"];
const scaleMap = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 3, 5, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
};

let controlsRef = {
  keysTranspose: 0,
  arpOn: false,
  humanize: 0,
  scale: "major",
};
let mutesRef = {};
let solosRef = {};
let volumesRef = {};
let patternLengthsRef = {};
let velocitiesRef = {};
let probabilitiesRef = {};

const instrumentMap = {
  kick: {
    synth: kick,
    note: "C1",
    dur: "8n",
    onTrigger: (time) => kickTransient.triggerAttackRelease("C5", "32n", time),
  },
  kick808: {
    synth: kick808,
    note: "A0",
    dur: "8n",
    onTrigger: (time) => kick808Transient.triggerAttackRelease("E4", "16n", time),
  },
  snare: { synth: snare, note: undefined, dur: "16n" },
  snare909: { synth: snare909, note: undefined, dur: "16n" },
  hat: { synth: hat, note: undefined, dur: "16n" },
  clap: { synth: clap, note: undefined, dur: "16n" },
  bass: { synth: bass, note: "C2", dur: "8n" },
  fmBass: { synth: fmBass, note: "C1", dur: "8n" },
  pad: { synth: pad, note: basePadNotes, dur: "4n" },
  keys: { synth: keys, note: baseKeysNotes, dur: "8n" },
  sampler: { synth: sampler, note: "C3", dur: "16n" },
};

export function updateTransportControls(nextControls = {}) {
  controlsRef = { ...controlsRef, ...nextControls };
  if (typeof nextControls.bpm === "number") {
    Tone.Transport.bpm.value = nextControls.bpm;
  }
  if (typeof nextControls.swing === "number") {
    const swing = Math.min(Math.max(nextControls.swing, 0), 0.9);
    Tone.Transport.swing = swing;
    Tone.Transport.swingSubdivision = "16n";
  }
}

export function updateMutes(mutes = {}) {
  mutesRef = { ...mutesRef, ...mutes };
}

export function updateSolos(solos = {}) {
  solosRef = { ...solosRef, ...solos };
}

export function updateVolumes(volumes = {}) {
  volumesRef = { ...volumesRef, ...volumes };
  Object.entries(volumesRef).forEach(([key, value]) => {
    if (!trackGains[key]) return;
    const vol = Math.min(Math.max(value, 0), 1.6);
    trackGains[key].gain.rampTo(vol, 0.06);
  });
}

export function updatePatternLengths(lengths = {}) {
  patternLengthsRef = { ...patternLengthsRef, ...lengths };
}

export function updateStepVelocities(velocities = {}) {
  velocitiesRef = { ...velocitiesRef, ...velocities };
}

export function updateStepProbabilities(probabilities = {}) {
  probabilitiesRef = { ...probabilitiesRef, ...probabilities };
}

export function startTransport(
  pattern,
  controls,
  mutes = {},
  solos = {},
  volumes = {},
  lengths = {},
  velocities = {},
  probabilities = {},
  setStep
) {
  updateTransportControls(controls);
  updateMutes(mutes);
  updateSolos(solos);
  updateVolumes(volumes);
  updatePatternLengths(lengths);
  updateStepVelocities(velocities);
  updateStepProbabilities(probabilities);
  Tone.Transport.bpm.value = controls?.bpm ?? 120;

  Tone.Transport.scheduleRepeat((time) => {
    const ticksPerStep = Tone.Transport.PPQ / 4; // 16th note
    const maxSteps = Math.max(
      16,
      ...Object.values(patternLengthsRef || {}).map((v) => Number(v) || 0)
    );
    const step = Math.floor((Tone.Transport.ticks / ticksPerStep) % maxSteps);
    if (typeof setStep === "function") setStep(step);
    const transpose = controlsRef.keysTranspose || 0;

    const intervals = scaleMap[controlsRef.scale] || scaleMap.major;
    const chord = intervals.slice(0, 5).map((interval, i) =>
      Tone.Frequency("C3").transpose(interval + transpose + Math.floor(i / intervals.length) * 12)
    );
    const keyScale = intervals.slice(0, 5).map((interval, i) =>
      Tone.Frequency("C4").transpose(interval + transpose + Math.floor(i / intervals.length) * 12)
    );

    const dynamicMap = {
      ...instrumentMap,
      pad: {
        ...instrumentMap.pad,
        note: controlsRef.arpOn ? [chord[step % chord.length]] : chord,
      },
      keys: {
        ...instrumentMap.keys,
        note: controlsRef.arpOn
          ? [keyScale[step % keyScale.length]]
          : [keyScale[0]],
      },
    };

    Object.entries(dynamicMap).forEach(([key, { synth, note, dur, onTrigger }]) => {
      const hasSolo = Object.values(solosRef).some(Boolean);
      if (hasSolo && !solosRef?.[key]) return;
      if (mutesRef?.[key]) return;
      const len = Math.max(1, patternLengthsRef?.[key] || 16);
      const idx = step % len;
      if (!pattern?.[key]?.[idx]) return;
      const prob = Math.min(Math.max(probabilitiesRef?.[key]?.[idx] ?? 1, 0), 1);
      if (Math.random() > prob) return;
      const velocity = Math.min(Math.max(velocitiesRef?.[key]?.[idx] ?? 1, 0.2), 1.6);
      const humanize = Math.min(Math.max(controlsRef.humanize || 0, 0), 30) / 1000;
      const jitter = (Math.random() - 0.5) * humanize;
      const triggerTime = time + jitter;
      if (typeof onTrigger === "function") onTrigger(triggerTime);
      if (note === undefined || note === null) {
        synth.triggerAttackRelease(dur, triggerTime, velocity);
      } else {
        synth.triggerAttackRelease(note, dur, triggerTime, velocity);
      }

      // Sidechain ducking on kicks to pads/keys/sampler
      if ((key === "kick" || key === "kick808") && controlsRef?.sidechain !== false) {
        const targets = ["pad", "keys", "sampler"];
        targets.forEach((tKey) => {
          const base = volumesRef?.[tKey] ?? trackGains[tKey]?.gain.value ?? 1;
          const g = trackGains[tKey]?.gain;
          if (!g) return;
          const now = triggerTime;
          g.cancelScheduledValues(now);
          g.setValueAtTime(base, now);
          g.linearRampToValueAtTime(base * 0.55, now + 0.03);
          g.linearRampToValueAtTime(base, now + 0.22);
        });
      }
    });
  }, "16n");

  Tone.Transport.start();
}

export function stopTransport(setStep) {
  Tone.Transport.stop();
  Tone.Transport.cancel();
  if (typeof setStep === "function") setStep(0);
}
