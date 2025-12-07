import { useNavigate, Link } from "react-router-dom";
import "./help.css";

export default function Help() {
  const navigate = useNavigate();
  return (
    <main className="help-page">
      <div className="help-hero">
        <div>
          <p className="help-eyebrow">GrooveBox</p>
          <h1 className="help-title">Guide d’utilisation</h1>
          <p className="help-subtitle">
            Voici les commandes et astuces pour tirer le maximum de la GrooveBox : patterns, effets,
            presets, sauvegarde et contrôles en temps réel.
          </p>
          <div className="help-actions">
            <button className="help-btn primary" onClick={() => navigate("/groove")}>
              Retour à la GrooveBox
            </button>
            <button className="help-btn ghost" onClick={() => navigate("/")}>
              Accueil
            </button>
          </div>
        </div>
      </div>

      <section className="help-grid">
        <article className="help-card">
          <h2>Transport & tempo</h2>
          <ul>
            <li><strong>Start/Stop</strong> : lance ou arrête le pattern.</li>
            <li><strong>BPM slider</strong> : règle le tempo (Tap tempo pour le caler à la main).</li>
            <li><strong>Swing</strong> : ajoute du shuffle sur les doubles-croches.</li>
            <li><strong>Humanize</strong> : léger décalage aléatoire (ms) pour un groove vivant.</li>
          </ul>
        </article>

        <article className="help-card">
          <h2>Pas et variations</h2>
          <ul>
            <li><strong>Clic</strong> : active/désactive un pas.</li>
            <li><strong>Clic droit</strong> : cycle accent → normal → ghost (vélocité).</li>
            <li><strong>Alt + clic</strong> : cycle probabilité 100% → 70% → 40%.</li>
            <li><strong>Longueur piste</strong> : 8/12/16/32 pas par piste pour des polymètres.</li>
            <li><strong>Vu-mètre</strong> : visualise le niveau par piste à droite.</li>
          </ul>
        </article>

        <article className="help-card">
          <h2>Mix & routing</h2>
          <ul>
            <li><strong>Solo / Mute</strong> sur chaque piste.</li>
            <li><strong>Volume piste</strong> + sidechain (Kick/808 qui duck Pad/Keys/Sampler si activé).</li>
            <li><strong>FX globaux</strong> : Reverb, Delay feedback, Tone hat, Cutoff basse/pad, Transpose.</li>
            <li><strong>Arp + Gamme</strong> : arpégiateur et sélection d’échelle (majeur, mineur, etc.).</li>
          </ul>
        </article>

        <article className="help-card">
          <h2>Gammes & arpégiateur</h2>
          <ul>
            <li><strong>Gammes dispo</strong> : Majeur, Mineur, Pentatonique, Dorien, Mixolydien.</li>
            <li><strong>Transpose</strong> : déplace toutes les notes de Keys/Pad par demi-tons (–12 à +12).</li>
            <li><strong>Arpégiateur</strong> : quand activé, Pad/Keys jouent la note de la gamme correspondant au pas courant (au lieu d’un accord ou note fixe).</li>
            <li><strong>Harmonie rapide</strong> : change la gamme + transpose pour tester des couleurs (ex. Mineur + transpose +2).</li>
          </ul>
        </article>

        <article className="help-card">
          <h2>Instruments & presets</h2>
          <ul>
            <li><strong>Presets</strong> sur chaque piste (kick, 808, snares, hats, clap, bass, FM bass, pad, keys, sampler).</li>
            <li><strong>Sampler</strong> : joue un one-shot (perc) synchronisé au pattern.</li>
            <li><strong>Patterns rapides</strong> : boutons Random / House / HipHop / Techno génèrent des grooves.</li>
          </ul>
        </article>

        <article className="help-card">
          <h2>Clavier & raccourcis</h2>
          <ul>
            <li><strong>Q W E R T Y U I O P [</strong> : togglent le pas courant pour Kick, 808, Snare, 909, Hat, Clap, Bass, FM Bass, Pad, Keys, Sampler.</li>
            <li><strong>Alt + clic pas</strong> : probabilité ; <strong>clic droit</strong> : accent/ghost.</li>
          </ul>
        </article>

        <article className="help-card">
          <h2>Gestion des états</h2>
          <ul>
            <li><strong>Save / Load</strong> : sauvegarde l’état complet (pattern, volumes, presets, longueurs, contrôles) en local.</li>
            <li><strong>Reset</strong> : efface toutes les notes.</li>
          </ul>
        </article>

        <article className="help-card wide">
          <h2>Conseils rapides</h2>
          <ul>
            <li>Combine <strong>swing</strong> + <strong>humanize</strong> léger pour un groove plus organique.</li>
            <li>Utilise les <strong>polymètres</strong> (12/32) sur hats ou percs pour casser la répétition.</li>
            <li>Active le <strong>sidechain</strong> si le pad/bass masquent la batterie.</li>
            <li>Accents sur les temps forts (1 & 9) et ghosts sur les contretemps pour des patterns dynamiques.</li>
          </ul>
        </article>
      </section>
      <div className="help-bottom-actions">
        <Link to="/groove" className="help-btn primary">Retour à la GrooveBox</Link>
      </div>
    </main>
  );
}
