import * as Tone from "tone";

const analyser = new Tone.Analyser("fft", 64);
Tone.Destination.connect(analyser);

export function getFFT() {
  return analyser.getValue();
}