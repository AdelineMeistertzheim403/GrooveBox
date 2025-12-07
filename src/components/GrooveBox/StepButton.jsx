export default function StepButton({
  active,
  onClick,
  onAltClick,
  onRightClick,
  isPlaying,
  velocity = 1,
  probability = 1,
}) {
  const velClass = velocity > 1.05 ? "step-accent" : velocity < 0.9 ? "step-ghost" : "";
  const probClass = probability < 0.9 ? "step-prob" : "";
  return (
    <button
      onClick={(e) => {
        if (e.altKey) {
          e.preventDefault();
          onAltClick?.();
          return;
        }
        onClick?.();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onRightClick?.();
      }}
      className={`step ${active ? "active" : ""} ${isPlaying ? "playing" : ""} ${velClass} ${probClass}`}
      title={`Vel ${velocity.toFixed(2)} • Prob ${(probability * 100).toFixed(0)}% (Alt=prob, clic droit=accent)`}
    />
  );
}
