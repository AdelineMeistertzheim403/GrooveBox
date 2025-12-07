import { atom } from "jotai";

const makeSteps = (len = 32, fillVal = false) => new Array(len).fill(fillVal);

export const patternAtom = atom({
  kick: makeSteps(),
  snare: makeSteps(),
  hat: makeSteps(),
  clap: makeSteps(),
  bass: makeSteps(),
  kick808: makeSteps(),
  snare909: makeSteps(),
  fmBass: makeSteps(),
  pad: makeSteps(),
  keys: makeSteps(),
  sampler: makeSteps(),
});

export const playingAtom = atom(false);

export const soundControlsAtom = atom({
  bpm: 120,
  swing: 0,
  humanize: 0,
  scale: "major",
  sidechain: true,
  reverbWet: 0.2,
  delayFeedback: 0.18,
  hatTone: 450,
  bassCutoff: 180,
  padCutoff: 900,
  keysTranspose: 0,
  arpOn: false,
});

export const currentStepAtom = atom(0);

export const muteAtom = atom({
  kick: false,
  kick808: false,
  snare: false,
  snare909: false,
  hat: false,
  clap: false,
  bass: false,
  fmBass: false,
  pad: false,
  keys: false,
  sampler: false,
});

export const soloAtom = atom({
  kick: false,
  kick808: false,
  snare: false,
  snare909: false,
  hat: false,
  clap: false,
  bass: false,
  fmBass: false,
  pad: false,
  keys: false,
  sampler: false,
});

export const volumeAtom = atom({
  kick: 1,
  kick808: 0.95,
  snare: 0.9,
  snare909: 0.9,
  hat: 0.8,
  clap: 0.85,
  bass: 0.95,
  fmBass: 0.95,
  pad: 0.8,
  keys: 0.82,
  sampler: 0.9,
});

export const drumPresetAtom = atom({
  kick: "Punch",
  kick808: "Boom808",
  snare: "Tight",
  snare909: "Classic909",
  hat: "Tight",
  clap: "Wide",
  bass: "Warm",
  fmBass: "SoftFM",
  pad: "Airy",
  keys: "Soft",
  sampler: "Perc",
});

export const patternLengthAtom = atom({
  kick: 16,
  kick808: 16,
  snare: 16,
  snare909: 16,
  hat: 16,
  clap: 16,
  bass: 16,
  fmBass: 16,
  pad: 16,
  keys: 16,
  sampler: 16,
});

export const stepVelocityAtom = atom({
  kick: makeSteps(32, 1),
  kick808: makeSteps(32, 1),
  snare: makeSteps(32, 1),
  snare909: makeSteps(32, 1),
  hat: makeSteps(32, 1),
  clap: makeSteps(32, 1),
  bass: makeSteps(32, 1),
  fmBass: makeSteps(32, 1),
  pad: makeSteps(32, 1),
  keys: makeSteps(32, 1),
  sampler: makeSteps(32, 1),
});

export const stepProbabilityAtom = atom({
  kick: makeSteps(32, 1),
  kick808: makeSteps(32, 1),
  snare: makeSteps(32, 1),
  snare909: makeSteps(32, 1),
  hat: makeSteps(32, 1),
  clap: makeSteps(32, 1),
  bass: makeSteps(32, 1),
  fmBass: makeSteps(32, 1),
  pad: makeSteps(32, 1),
  keys: makeSteps(32, 1),
  sampler: makeSteps(32, 1),
});
