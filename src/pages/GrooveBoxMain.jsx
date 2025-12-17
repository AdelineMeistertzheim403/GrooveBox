import { useEffect, useRef, useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import GrooveBox from "../components/GrooveBox/GrooveBox";
import ToneControls from "../components/GrooveBox/ToneControls";
import TempoSlider from "../components/Controls/TempoSlider";
import CanvasVisualizer from "../components/Visualizer/CanvasVisualizer";
import {
  patternAtom,
  playingAtom,
  soundControlsAtom,
  currentStepAtom,
  muteAtom,
  soloAtom,
  volumeAtom,
  drumPresetAtom,
  patternLengthAtom,
  stepVelocityAtom,
  stepProbabilityAtom,
} from "../state/grooveState";
import { userAtom } from "../state/authAtom";
import { initTone } from "../audio/toneInit";
import { applyControls, updateTrackVolumes, applyDrumPresetMap } from "../audio/instruments";
import {
  startTransport,
  stopTransport,
  updateTransportControls,
  updateMutes,
  updateSolos,
  updateVolumes,
  updatePatternLengths,
  updateStepVelocities,
  updateStepProbabilities,
} from "../audio/transport";
import {
  savePatternRemote,
  listPatternsRemote,
  loadPatternRemote,
} from "../api/backend";
import { useNavigate } from "react-router-dom";
import "./groovebox.css";

export default function GrooveBoxMain() {
  const setPattern = useSetAtom(patternAtom);
  const [pattern] = useAtom(patternAtom);
  const [playing, setPlaying] = useAtom(playingAtom);
  const [controls, setControls] = useAtom(soundControlsAtom);
  const [, setCurrentStep] = useAtom(currentStepAtom);
  const [mutes] = useAtom(muteAtom);
  const [solos] = useAtom(soloAtom);
  const [volumes] = useAtom(volumeAtom);
  const [currentStep] = useAtom(currentStepAtom);
  const [drumPresets] = useAtom(drumPresetAtom);
  const [patternLengths, setPatternLengths] = useAtom(patternLengthAtom);
  const [stepVelocities, setStepVelocities] = useAtom(stepVelocityAtom);
  const [stepProbabilities, setStepProbabilities] = useAtom(stepProbabilityAtom);
  const [user] = useAtom(userAtom);
  const [remoteList, setRemoteList] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [loadSelection, setLoadSelection] = useState("");
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const navigate = useNavigate();
  const toneFields = [
    "swing",
    "humanize",
    "sidechain",
    "reverbWet",
    "delayFeedback",
    "hatTone",
    "bassCutoff",
    "padCutoff",
    "keysTranspose",
  ];
  const tapTimes = useRef([]);

  useEffect(() => {
    applyControls(controls);
    updateTransportControls(controls);
  }, [controls]);

  useEffect(() => {
    updateMutes(mutes);
  }, [mutes]);

  useEffect(() => {
    updateSolos(solos);
  }, [solos]);

  useEffect(() => {
    updateVolumes(volumes);
    updateTrackVolumes(volumes);
  }, [volumes]);

  useEffect(() => {
    updatePatternLengths(patternLengths);
  }, [patternLengths]);

  useEffect(() => {
    updateStepVelocities(stepVelocities);
  }, [stepVelocities]);

  useEffect(() => {
    updateStepProbabilities(stepProbabilities);
  }, [stepProbabilities]);

  useEffect(() => {
    applyDrumPresetMap(drumPresets);
  }, [drumPresets]);

  async function togglePlay() {
    if (!playing) {
      await initTone();
      startTransport(
        pattern,
        controls,
        mutes,
        solos,
        volumes,
        patternLengths,
        stepVelocities,
        stepProbabilities,
        setCurrentStep
      );
    } else {
      stopTransport(setCurrentStep);
    }
    setPlaying(!playing);
  }

  function handleTapTempo() {
    const now = performance.now();
    tapTimes.current = [now, ...tapTimes.current.filter((t) => now - t < 4000)];
    if (tapTimes.current.length < 2) return;
    const intervals = [];
    for (let i = 0; i < tapTimes.current.length - 1; i++) {
      intervals.push(tapTimes.current[i] - tapTimes.current[i + 1]);
    }
    const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.min(Math.max(60000 / avgMs, 60), 200);
    setControls((prev) => ({ ...prev, bpm: Math.round(bpm) }));
  }

  function randomizePattern(profile = "random") {
    const prob = {
      random: { kick: 0.3, snare: 0.25, hat: 0.5, clap: 0.2, bass: 0.15, fmBass: 0.15, pad: 0.25, keys: 0.18, kick808: 0.2, snare909: 0.2, sampler: 0.2 },
      house: { kick: 0.8, snare: 0.3, hat: 0.7, clap: 0.35, bass: 0.25, fmBass: 0.2, pad: 0.2, keys: 0.15, kick808: 0.1, snare909: 0.15, sampler: 0.1 },
      hiphop: { kick: 0.4, snare: 0.35, hat: 0.55, clap: 0.4, bass: 0.3, fmBass: 0.25, pad: 0.3, keys: 0.2, kick808: 0.35, snare909: 0.2, sampler: 0.25 },
      techno: { kick: 0.7, snare: 0.2, hat: 0.75, clap: 0.15, bass: 0.2, fmBass: 0.25, pad: 0.15, keys: 0.1, kick808: 0.45, snare909: 0.35, sampler: 0.15 },
    }[profile] || {};

    setPattern((prev) => {
      const next = {};
      Object.keys(prev).forEach((track) => {
        const p = prob[track] ?? 0.15;
        const len = patternLengths?.[track] || 16;
        const arr = new Array(32).fill(false).map((_, i) => (i < len ? Math.random() < p : false));
        next[track] = arr;
      });
      return next;
    });
  }

  function applyPreset(name) {
    const next = {};
    const emptyRow = () => new Array(32).fill(false);
    const fill = (steps) => {
      const arr = emptyRow();
      steps.forEach((i) => (arr[i % 32] = true));
      return arr;
    };
    if (name === "house") {
      next.kick = fill([0, 4, 8, 12]);
      next.hat = fill([2, 6, 10, 14]);
      next.snare = fill([4, 12]);
      next.clap = fill([4, 12]);
      next.kick808 = emptyRow();
      next.snare909 = fill([7, 15]);
      next.hat = fill([2, 6, 10, 14]);
      next.bass = fill([0, 7, 10]);
      next.fmBass = emptyRow();
      next.pad = fill([0, 8]);
      next.keys = fill([0, 8]);
      next.sampler = emptyRow();
    } else if (name === "hiphop") {
      next.kick = fill([0, 3, 7, 10, 12]);
      next.kick808 = fill([12]);
      next.snare = fill([4, 12]);
      next.snare909 = emptyRow();
      next.hat = fill([1, 3, 5, 7, 9, 11, 13, 15]);
      next.clap = fill([12]);
      next.bass = fill([0, 7, 10]);
      next.fmBass = emptyRow();
      next.pad = fill([0, 8]);
      next.keys = fill([0, 8]);
      next.sampler = fill([2, 6, 10, 14]);
    } else if (name === "techno") {
      next.kick = fill([0, 4, 8, 12]);
      next.kick808 = fill([2, 6, 10, 14]);
      next.snare = emptyRow();
      next.snare909 = fill([4, 12]);
      next.hat = fill([1, 3, 5, 7, 9, 11, 13, 15]);
      next.clap = fill([4, 12]);
      next.bass = fill([0, 6, 11]);
      next.fmBass = fill([2, 10, 14]);
      next.pad = fill([0, 8]);
      next.keys = emptyRow();
      next.sampler = fill([3, 7, 11, 15]);
    } else {
      return;
    }
    setPattern((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => {
    const keyMap = {
      q: "kick",
      w: "kick808",
      e: "snare",
      r: "snare909",
      t: "hat",
      y: "clap",
      u: "bass",
      i: "fmBass",
      o: "pad",
      p: "keys",
      "[": "sampler",
    };
    function onKeyDown(e) {
      const trackKey = keyMap[e.key.toLowerCase()];
      if (!trackKey) return;
      setPattern((prev) => {
        const copy = { ...prev };
        const row = [...copy[trackKey]];
        row[currentStep] = !row[currentStep];
        copy[trackKey] = row;
        return copy;
      });
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setPattern, currentStep]);

  function saveState() {
    if (user?.token) {
      const rawName = prompt("Nom de la création ?");
      const name = rawName?.trim();
      if (!name) return;
      const data = {
        pattern,
        mutes,
        solos,
        volumes,
        controls,
        patternLengths,
        stepVelocities,
        stepProbabilities,
      };
      savePatternRemote(user.token, name, data)
        .then((res) => {
          alert(`Création sauvegardée (id ${res.id})`);
        })
        .catch((e) => alert(e.message || "Erreur de sauvegarde"));
    } else {
      const data = {
        pattern,
        mutes,
        solos,
        volumes,
        controls,
        patternLengths,
        stepVelocities,
        stepProbabilities,
      };
      localStorage.setItem("groovebox-state", JSON.stringify(data));
      alert("Sauvegardé en local (connecte-toi pour sauvegarder côté serveur)");
    }
  }

  function loadState() {
    if (user?.token) {
      listPatternsRemote(user.token)
        .then((list) => {
          setRemoteList(list);
          if (!list?.length) {
            alert("Aucune création côté serveur");
            return;
          }
          const choice = prompt(
            "Choisir un id de pattern :\n" + list.map((p) => `${p.id} - ${p.name}`).join("\n")
          );
          const id = Number(choice);
          if (!id) return;
          return loadPatternRemote(user.token, id).then((data) => applyLoadedState(data.data));
        })
        .catch((e) => alert(e.message || "Erreur de chargement"));
    } else {
      try {
        const raw = localStorage.getItem("groovebox-state");
        if (!raw) return;
        const data = JSON.parse(raw);
        applyLoadedState(data);
      } catch (e) {
        console.error("Load failed", e);
      }
    }
  }

  function openSaveModal() {
    setSaveName((prev) => prev || "Ma creation");
    setModalMsg("");
    setShowSaveModal(true);
  }

  function openLoadModal() {
    setModalMsg("");
    setShowLoadModal(true);
  }

  useEffect(() => {
    if (showLoadModal && user?.token) {
      setRemoteLoading(true);
      listPatternsRemote(user.token)
        .then((list) => {
          setRemoteList(list || []);
          if (list?.length) setLoadSelection(String(list[0].id));
        })
        .catch((e) => setModalMsg(e.message || "Erreur de chargement"))
        .finally(() => setRemoteLoading(false));
    }
  }, [showLoadModal, user]);

  function performSave() {
    const data = {
      pattern,
      mutes,
      solos,
      volumes,
      controls,
      patternLengths,
      stepVelocities,
      stepProbabilities,
    };
    if (user?.token) {
      const name = (saveName || "").trim();
      if (!name) {
        setModalMsg("Choisis un nom.");
        return;
      }
      savePatternRemote(user.token, name, data)
        .then((res) => setModalMsg(`Création sauvegardée (id ${res.id})`))
        .catch((e) => setModalMsg(e.message || "Erreur de sauvegarde"));
    } else {
      localStorage.setItem("groovebox-state", JSON.stringify(data));
      setModalMsg("Sauvegardé en local (connecte-toi pour le serveur).");
    }
  }

  function performLoadLocal() {
    try {
      const raw = localStorage.getItem("groovebox-state");
      if (!raw) {
        setModalMsg("Aucune sauvegarde locale.");
        return;
      }
      const data = JSON.parse(raw);
      applyLoadedState(data);
      setModalMsg("Chargé depuis le stockage local.");
    } catch (e) {
      setModalMsg("Erreur de chargement local.");
    }
  }

  function performLoadRemote() {
    if (!user?.token) return;
    const id = Number(loadSelection);
    if (!id) {
      setModalMsg("Choisis une création.");
      return;
    }
    loadPatternRemote(user.token, id)
      .then((data) => {
        applyLoadedState(data.data);
        setModalMsg("Chargé depuis le serveur.");
      })
      .catch((e) => setModalMsg(e.message || "Erreur de chargement"));
  }

  function applyLoadedState(data) {
    if (!data) return;
    const safeData = typeof data === "string" ? (() => { try { return JSON.parse(data); } catch { return null; } })() : data;
    if (!safeData) return;
    const payload = safeData.data ? safeData.data : safeData;
    const d = typeof payload === "string" ? (() => { try { return JSON.parse(payload); } catch { return null; } })() : payload;
    if (!d) return;
    if (d.pattern) setPattern(d.pattern);
    if (d.mutes) updateMutes(d.mutes);
    if (d.solos) updateSolos(d.solos);
    if (d.volumes) {
      updateVolumes(d.volumes);
      updateTrackVolumes(d.volumes);
    }
    if (d.patternLengths) {
      setPatternLengths(d.patternLengths);
      updatePatternLengths(d.patternLengths);
    }
    if (d.stepVelocities) {
      setStepVelocities(d.stepVelocities);
      updateStepVelocities(d.stepVelocities);
    }
    if (d.stepProbabilities) {
      setStepProbabilities(d.stepProbabilities);
      updateStepProbabilities(d.stepProbabilities);
    }
    if (d.controls) {
      setControls(d.controls);
      applyControls(d.controls);
    }
  }

  function resetPattern() {
    setPattern((prev) => {
      const next = {};
      Object.keys(prev).forEach((k) => (next[k] = new Array(16).fill(false)));
      return next;
    });
  }

  return (
    <>
    <div className="groove-page">
      <div className="visualizer-bg" aria-hidden="true">
        <div className="visualizer-bars">
          <CanvasVisualizer />
        </div>
      </div>

      <div className="groove-content">
        <div className="groove-header">
          <div className="groove-title-row">
            <h1 className="groove-title">GrooveBox Visualizer</h1>
            <div className="title-actions">
              <button className="exit-btn" onClick={() => navigate("/help")}>
                Aide
              </button>
              <button className="exit-btn" onClick={() => navigate("/")}>
                Retour
              </button>
            </div>
          </div>
        </div>
        <div className="groove-layout">
          <div className="tone-side left">
            <ToneControls fields={toneFields} showArp />
          </div>

          <div className="groove-center">
            <GrooveBox />
            <div className="transport-row">
              <div className="tempo-inline">
                <TempoSlider
                  initialBpm={controls.bpm}
                  onBpmChange={(val) => setControls((prev) => ({ ...prev, bpm: val }))}
                />
              </div>
              <button className="play-toggle" onClick={togglePlay}>
                {playing ? "Stop" : "Start"}
              </button>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
              <button className="play-toggle" style={{ padding: "8px 16px" }} onClick={handleTapTempo}>
                Tap tempo
              </button>
              <button className="play-toggle" style={{ padding: "8px 16px" }} onClick={() => randomizePattern("random")}>
                Random
              </button>
              <button className="play-toggle" style={{ padding: "8px 16px" }} onClick={() => applyPreset("house")}>
                Preset House
              </button>
              <button className="play-toggle" style={{ padding: "8px 16px" }} onClick={() => applyPreset("hiphop")}>
                Preset HipHop
              </button>
              <button className="play-toggle" style={{ padding: "8px 16px" }} onClick={() => applyPreset("techno")}>
                Preset Techno
              </button>
              <button className="play-toggle" style={{ padding: "8px 16px" }} onClick={() => openSaveModal()}>
                Save
              </button>
              <button className="play-toggle" style={{ padding: "8px 16px" }} onClick={() => openLoadModal()}>
                Load
              </button>
              <button className="play-toggle" style={{ padding: "8px 16px" }} onClick={() => resetPattern()}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

      {showSaveModal ? (
        <div className="modal-backdrop" onClick={() => setShowSaveModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Sauvegarder</h3>
            <p className="modal-desc">
              Choisis un nom. Connecte-toi pour sauvegarder côté serveur, sinon la sauvegarde reste locale.
            </p>
            <input
              className="modal-input"
              placeholder="Nom de la création"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            />
            <div className="modal-actions">
              <button className="modal-btn" onClick={() => setShowSaveModal(false)}>
                Annuler
              </button>
              <button className="modal-btn primary" onClick={performSave}>
                Sauvegarder
              </button>
            </div>
            {modalMsg ? <div className="modal-msg">{modalMsg}</div> : null}
          </div>
        </div>
      ) : null}

      {showLoadModal ? (
        <div className="modal-backdrop" onClick={() => setShowLoadModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Charger une création</h3>
            <p className="modal-desc">
              {user?.token
                ? "Sélectionne une création sauvegardée sur le serveur ou charge ta sauvegarde locale."
                : "Tu n'es pas connecté : charge la sauvegarde locale."}
            </p>
            {user?.token ? (
              <div className="modal-field">
                <label>Créations serveur</label>
                <select
                  className="modal-select"
                  disabled={remoteLoading || !remoteList.length}
                  value={loadSelection}
                  onChange={(e) => setLoadSelection(e.target.value)}
                >
                  {remoteList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (#{p.id})
                    </option>
                  ))}
                </select>
                <button className="modal-btn primary" disabled={remoteLoading || !remoteList.length} onClick={performLoadRemote}>
                  {remoteLoading ? "Chargement..." : "Charger sélection"}
                </button>
              </div>
            ) : null}
            <div className="modal-field">
              <label>Chargement local</label>
              <button className="modal-btn" onClick={performLoadLocal}>
                Charger depuis le stockage local
              </button>
            </div>
            <div className="modal-actions">
              <button className="modal-btn" onClick={() => setShowLoadModal(false)}>
                Fermer
              </button>
            </div>
            {modalMsg ? <div className="modal-msg">{modalMsg}</div> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
