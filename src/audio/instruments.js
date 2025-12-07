import * as Tone from "tone";

// Master bus to avoid clipping/saturation
const limiter = new Tone.Limiter(-4).toDestination();
const masterCompressor = new Tone.Compressor({
  threshold: -8,
  ratio: 2.5,
  attack: 0.002,
  release: 0.12,
}).connect(limiter);
const masterGain = new Tone.Gain(1.1).connect(masterCompressor);

// FX bus (shared reverb/delay)
const reverb = new Tone.Reverb({
  decay: 2.4,
  wet: 0.18,
  preDelay: 0.025,
});
const delay = new Tone.FeedbackDelay("8n", 0.14);
delay.wet.value = 0.2;

const fxBus = new Tone.Gain(0.4);
fxBus.chain(delay, reverb, masterGain);

// Per-track gains to allow volume automation/mixing
export const trackGains = {
  kick: new Tone.Gain(1).connect(masterGain),
  kick808: new Tone.Gain(0.95).connect(masterGain),
  snare: new Tone.Gain(0.9).connect(masterGain),
  snare909: new Tone.Gain(0.9).connect(masterGain),
  hat: new Tone.Gain(0.8).connect(masterGain),
  clap: new Tone.Gain(0.85).connect(masterGain),
  bass: new Tone.Gain(0.95).connect(masterGain),
  fmBass: new Tone.Gain(0.95).connect(masterGain),
  pad: new Tone.Gain(0.8).connect(masterGain),
  keys: new Tone.Gain(0.82).connect(masterGain),
  sampler: new Tone.Gain(0.9).connect(masterGain),
};

Object.values(trackGains).forEach((gain) => gain.connect(fxBus));

export const trackMeters = Object.fromEntries(
  Object.keys(trackGains).map((key) => {
    const meter = new Tone.Meter({ smoothing: 0.5, normalRange: true });
    trackGains[key].connect(meter);
    return [key, meter];
  })
);

const padFilter = new Tone.Filter(1200, "lowpass", { Q: 0.8 });
const padChorus = new Tone.Chorus(1.5, 0.4, 0.35).start();
const keysVibrato = new Tone.Vibrato(6, 0.08);

export const kick = new Tone.MembraneSynth({
  pitchDecay: 0.015,
  octaves: 8,
  oscillator: { type: "sine" },
  envelope: { attack: 0.0005, decay: 0.6, sustain: 0 },
}).connect(trackGains.kick);
kick.volume.value = 4; // bring the main kick forward

// Short transient layer to add click/punch to the kick
export const kickTransient = new Tone.Synth({
  oscillator: { type: "sine" },
  envelope: { attack: 0.0004, decay: 0.05, sustain: 0, release: 0.03 },
}).connect(trackGains.kick);
kickTransient.volume.value = 6;

export const kick808 = new Tone.MembraneSynth({
  pitchDecay: 0.01,
  octaves: 7,
  oscillator: { type: "sine" },
  envelope: { attack: 0.0008, decay: 1.4, sustain: 0 },
}).connect(trackGains.kick808);
kick808.volume.value = 3;

export const kick808Transient = new Tone.Synth({
  oscillator: { type: "triangle" },
  envelope: { attack: 0.0006, decay: 0.08, sustain: 0, release: 0.04 },
}).connect(trackGains.kick808);
kick808Transient.volume.value = 5;

export const snare = new Tone.NoiseSynth({
  noise: { type: "white" },
  envelope: { attack: 0.002, decay: 0.18, sustain: 0 }
}).connect(trackGains.snare);
snare.volume.value = 1;

export const snare909 = new Tone.NoiseSynth({
  noise: { type: "pink" },
  envelope: { attack: 0.001, decay: 0.28, sustain: 0, release: 0.02 },
  filterEnvelope: { baseFrequency: 800, octaves: 2.5 }
}).connect(trackGains.snare909);
snare909.volume.value = 1.5;

export const hat = new Tone.MetalSynth({
  frequency: 450,
  envelope: { attack: 0.0008, decay: 0.08, release: 0.01 },
  harmonicity: 5.1,
  modulationIndex: 32,
  resonance: 5000,
  octaves: 2
}).connect(trackGains.hat);

export const clap = new Tone.NoiseSynth({
  noise: { type: "pink" },
  envelope: { attack: 0.002, decay: 0.25 },
  filterEnvelope: { baseFrequency: 800, octaves: 1.5 }
}).connect(trackGains.clap);

export const bass = new Tone.MonoSynth({
  oscillator: { type: "triangle" },
  filter: { Q: 1, type: "lowpass", frequency: 360 },
  envelope: { attack: 0.008, decay: 0.18, sustain: 0.7, release: 0.3 },
  filterEnvelope: { attack: 0.008, decay: 0.15, sustain: 0.35, release: 0.28, baseFrequency: 80, octaves: 2.4 }
}).connect(trackGains.bass);
bass.volume.value = 2;

export const fmBass = new Tone.FMSynth({
  harmonicity: 0.6,
  modulationIndex: 10,
  oscillator: { type: "sawtooth" },
  envelope: { attack: 0.008, decay: 0.22, sustain: 0.45, release: 0.12 },
  modulation: { type: "triangle" },
  modulationEnvelope: { attack: 0.008, decay: 0.18, sustain: 0.25, release: 0.12 }
}).connect(trackGains.fmBass);
fmBass.volume.value = 1.8;

export const pad = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "triangle" },
  envelope: { attack: 0.16, decay: 0.32, sustain: 0.6, release: 1.3 },
}).chain(padFilter, padChorus, trackGains.pad);
pad.volume.value = -2;

export const keys = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "sine" },
  envelope: { attack: 0.015, decay: 0.16, sustain: 0.65, release: 0.45 },
}).connect(keysVibrato).connect(trackGains.keys);
keys.volume.value = 1.5;

export const sampler = new Tone.Sampler({
  urls: {
    C3: "/samples/perc.wav",
  },
  attack: 0.001,
  release: 0.2,
}).connect(trackGains.sampler);
sampler.volume.value = -2;

const drumPresets = {
  kick: {
    Punch: { pitchDecay: 0.012, octaves: 8, volume: 5, transientVol: 7.5, attack: 0.0004, decay: 0.5 },
    Deep: { pitchDecay: 0.03, octaves: 6, volume: 3.4, transientVol: 4, attack: 0.0008, decay: 0.9 },
    Clicky: { pitchDecay: 0.008, octaves: 9, volume: 3.2, transientVol: 8.5, attack: 0.0003, decay: 0.35 },
  },
  kick808: {
    Boom808: { pitchDecay: 0.028, octaves: 7, volume: 3.8, transientVol: 5.5, attack: 0.0008, decay: 1.4 },
    Short808: { pitchDecay: 0.018, octaves: 6.5, volume: 3.2, transientVol: 4.5, attack: 0.0006, decay: 0.7 },
    Click808: { pitchDecay: 0.012, octaves: 7.5, volume: 3, transientVol: 7, attack: 0.0004, decay: 0.5 },
  },
  snare: {
    Tight: { decay: 0.16, volume: 1, noise: "white", filterBase: 1400, filterOct: 2 },
    Roomy: { decay: 0.32, volume: 1.4, noise: "pink", filterBase: 800, filterOct: 3.2 },
    ClapSnare: { decay: 0.22, volume: 1.2, noise: "brown", filterBase: 1000, filterOct: 2.4 },
  },
  snare909: {
    Classic909: { decay: 0.26, volume: 1.5, noise: "pink", filterBase: 900, filterOct: 2.2 },
    Fat909: { decay: 0.34, volume: 1.8, noise: "brown", filterBase: 650, filterOct: 2.8 },
    Snappy909: { decay: 0.18, volume: 1.3, noise: "white", filterBase: 1400, filterOct: 2 },
  },
  hat: {
    Tight: { frequency: 650, decay: 0.07, resonance: 5200, harmonicity: 5, modIndex: 32 },
    Bright: { frequency: 1100, decay: 0.12, resonance: 7200, harmonicity: 7, modIndex: 40 },
    Dark: { frequency: 420, decay: 0.1, resonance: 3200, harmonicity: 4, modIndex: 22 },
  },
  clap: {
    Wide: { decay: 0.24, color: "pink", volume: 0, filterBase: 900, filterOct: 1.4 },
    Sharp: { decay: 0.16, color: "white", volume: 0.9, filterBase: 1400, filterOct: 2 },
    Big: { decay: 0.32, color: "pink", volume: 1.4, filterBase: 700, filterOct: 1.8 },
  },
  bass: {
    Warm: {
      oscillator: { type: "triangle" },
      filterFreq: 360,
      env: { attack: 0.01, decay: 0.22, sustain: 0.7, release: 0.32 },
      filterEnv: { attack: 0.012, decay: 0.18, sustain: 0.4, release: 0.28, base: 90, oct: 2.4 },
      volume: 2,
    },
    Pluck: {
      oscillator: { type: "sawtooth" },
      filterFreq: 520,
      env: { attack: 0.006, decay: 0.14, sustain: 0.4, release: 0.2 },
      filterEnv: { attack: 0.01, decay: 0.14, sustain: 0.2, release: 0.18, base: 120, oct: 3.2 },
      volume: 1.2,
    },
    Growl: {
      oscillator: { type: "square" },
      filterFreq: 260,
      env: { attack: 0.012, decay: 0.28, sustain: 0.55, release: 0.36 },
      filterEnv: { attack: 0.012, decay: 0.22, sustain: 0.4, release: 0.3, base: 80, oct: 2.8 },
      volume: 2.8,
    },
  },
  fmBass: {
    SoftFM: {
      harmonicity: 0.7,
      modulationIndex: 8,
      carrier: "sine",
      mod: "triangle",
      env: { attack: 0.01, decay: 0.18, sustain: 0.5, release: 0.18 },
      modEnv: { attack: 0.01, decay: 0.16, sustain: 0.3, release: 0.16 },
      volume: 1.5,
    },
    Metallic: {
      harmonicity: 1.2,
      modulationIndex: 18,
      carrier: "sawtooth",
      mod: "square",
      env: { attack: 0.006, decay: 0.2, sustain: 0.35, release: 0.14 },
      modEnv: { attack: 0.008, decay: 0.16, sustain: 0.25, release: 0.12 },
      volume: 2.1,
    },
    Crunch: {
      harmonicity: 0.5,
      modulationIndex: 24,
      carrier: "square",
      mod: "sawtooth",
      env: { attack: 0.004, decay: 0.16, sustain: 0.2, release: 0.12 },
      modEnv: { attack: 0.006, decay: 0.12, sustain: 0.15, release: 0.1 },
      volume: 2.6,
    },
  },
  pad: {
    Airy: {
      oscillator: { type: "triangle" },
      env: { attack: 0.2, decay: 0.4, sustain: 0.7, release: 1.5 },
      detune: -5,
      volume: -2,
    },
    Warm: {
      oscillator: { type: "sawtooth" },
      env: { attack: 0.35, decay: 0.5, sustain: 0.65, release: 2 },
      detune: -8,
      volume: -1,
    },
    Glass: {
      oscillator: { type: "sine" },
      env: { attack: 0.1, decay: 0.4, sustain: 0.55, release: 1.2 },
      detune: 4,
      volume: -3,
    },
  },
  keys: {
    Soft: {
      oscillator: { type: "sine" },
      env: { attack: 0.012, decay: 0.16, sustain: 0.65, release: 0.5 },
      detune: -3,
      volume: 1,
    },
    Glassy: {
      oscillator: { type: "triangle" },
      env: { attack: 0.006, decay: 0.18, sustain: 0.5, release: 0.4 },
      detune: 6,
      volume: 1.6,
    },
    Organ: {
      oscillator: { type: "square" },
      env: { attack: 0.01, decay: 0.24, sustain: 0.8, release: 0.6 },
      detune: 0,
      volume: 2,
    },
  },
  sampler: {
    Perc: { attack: 0.001, release: 0.2, volume: -2, rate: 1 },
    Short: { attack: 0.001, release: 0.1, volume: -3, rate: 1.1 },
    Soft: { attack: 0.01, release: 0.3, volume: -4, rate: 0.95 },
  },
};

export function applyDrumPreset(trackKey, presetName) {
  const preset = drumPresets[trackKey]?.[presetName];
  if (!preset) return;
  if (trackKey === "kick") {
    kick.set({
      pitchDecay: preset.pitchDecay,
      octaves: preset.octaves,
      envelope: { attack: preset.attack, decay: preset.decay, sustain: 0 },
    });
    kick.volume.value = preset.volume;
    kickTransient.volume.value = preset.transientVol;
  } else if (trackKey === "kick808") {
    kick808.set({
      pitchDecay: preset.pitchDecay,
      octaves: preset.octaves,
      envelope: { attack: preset.attack, decay: preset.decay, sustain: 0 },
    });
    kick808.volume.value = preset.volume;
    kick808Transient.volume.value = preset.transientVol;
  } else if (trackKey === "snare") {
    snare.set({
      envelope: { attack: 0.002, decay: preset.decay, sustain: 0 },
      filterEnvelope: { baseFrequency: preset.filterBase, octaves: preset.filterOct },
    });
    snare.noise.type = preset.noise;
    snare.volume.value = preset.volume;
  } else if (trackKey === "snare909") {
    snare909.set({
      envelope: { attack: 0.001, decay: preset.decay, sustain: 0, release: 0.02 },
      filterEnvelope: { baseFrequency: preset.filterBase, octaves: preset.filterOct },
      noise: { type: preset.noise },
    });
    snare909.volume.value = preset.volume;
  } else if (trackKey === "hat") {
    hat.set({
      frequency: preset.frequency,
      envelope: { attack: 0.0008, decay: preset.decay, release: 0.01 },
      resonance: preset.resonance,
      harmonicity: preset.harmonicity,
      modulationIndex: preset.modIndex,
    });
  } else if (trackKey === "clap") {
    clap.set({
      envelope: { attack: 0.002, decay: preset.decay },
      noise: { type: preset.color },
      filterEnvelope: { baseFrequency: preset.filterBase, octaves: preset.filterOct },
    });
    clap.volume.value = preset.volume;
  } else if (trackKey === "bass") {
    bass.set({
      oscillator: preset.oscillator,
      filter: { frequency: preset.filterFreq, Q: 1, type: "lowpass" },
      envelope: preset.env,
      filterEnvelope: {
        attack: preset.filterEnv.attack,
        decay: preset.filterEnv.decay,
        sustain: preset.filterEnv.sustain,
        release: preset.filterEnv.release,
        baseFrequency: preset.filterEnv.base,
        octaves: preset.filterEnv.oct,
      },
    });
    bass.volume.value = preset.volume;
  } else if (trackKey === "fmBass") {
    fmBass.set({
      harmonicity: preset.harmonicity,
      modulationIndex: preset.modulationIndex,
      oscillator: { type: preset.carrier },
      modulation: { type: preset.mod },
      envelope: preset.env,
      modulationEnvelope: preset.modEnv,
    });
    fmBass.volume.value = preset.volume;
  } else if (trackKey === "pad") {
    pad.set({
      oscillator: preset.oscillator,
      envelope: preset.env,
      detune: preset.detune,
    });
    pad.volume.value = preset.volume;
  } else if (trackKey === "keys") {
    keys.set({
      oscillator: preset.oscillator,
      envelope: preset.env,
      detune: preset.detune,
    });
    keys.volume.value = preset.volume;
  } else if (trackKey === "sampler") {
    sampler.set({
      attack: preset.attack,
      release: preset.release,
    });
    sampler.volume.value = preset.volume;
    sampler.playbackRate = preset.rate;
  }
}

export function applyDrumPresetMap(map = {}) {
  Object.entries(map).forEach(([k, v]) => applyDrumPreset(k, v));
}

export function applyControls({
  reverbWet,
  delayFeedback,
  hatTone,
  bassCutoff,
  padCutoff,
  keysTranspose,
  scale,
} = {}) {
  if (typeof reverbWet === "number") {
    reverb.wet.value = Math.min(Math.max(reverbWet, 0), 0.8);
  }
  if (typeof delayFeedback === "number") {
    delay.feedback.value = Math.min(Math.max(delayFeedback, 0), 0.6);
  }
  if (typeof hatTone === "number") {
    hat.frequency.value = Math.min(Math.max(hatTone, 100), 1200);
  }
  if (typeof bassCutoff === "number") {
    bass.filter.frequency.value = Math.min(Math.max(bassCutoff, 80), 800);
  }
  if (typeof padCutoff === "number") {
  padFilter.frequency.value = Math.min(Math.max(padCutoff, 200), 4000);
  }
  if (typeof keysTranspose === "number") {
    keys.set({ detune: keysTranspose * 100 });
    pad.set({ detune: keysTranspose * 100 });
  }
}

export function updateTrackVolumes(volumes = {}) {
  Object.entries(volumes).forEach(([key, value]) => {
    if (!trackGains[key]) return;
    const vol = Math.min(Math.max(value, 0), 1.6);
    trackGains[key].gain.rampTo(vol, 0.08);
  });
}

export function getTrackLevel(key) {
  const meter = trackMeters[key];
  if (!meter) return 0;
  const v = meter.getValue();
  const lvl = Array.isArray(v) ? v[0] : v;
  if (Number.isNaN(lvl)) return 0;
  return Math.min(Math.max(lvl, 0), 1);
}
