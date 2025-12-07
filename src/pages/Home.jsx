import PlayMusic from "../components/GrooveBox/playMusic";
import AuthPanel from "../components/Auth/AuthPanel";

export default function Home() {
  return (
    <main className="home">
      <div className="home__glow" aria-hidden="true" />
      <section className="home__panel">
        <p className="home__eyebrow">GrooveBox</p>
        <h1 className="home__title">Compose une boucle en quelques clics</h1>
        <p className="home__text">
          Active les pistes, lance le transport, et observe les visuels reagir au son.
        </p>
        <PlayMusic
          to="/groove"
          label="Ouvrir la GrooveBox"
          useDefaultPosition={false}
          containerStyle={{ marginTop: "12px" }}
        />
        <div className="home__auth">
          <AuthPanel />
        </div>
      </section>
    </main>
  );
}
