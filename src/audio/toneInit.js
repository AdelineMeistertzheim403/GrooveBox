import * as Tone from "tone";

export async function initTone() {
  await Tone.start();
  console.log("Tone.js ready");
}
