import logoImage from '../../assets/kontur-logo-generated.png';

export default function Logo({ compact = false }) {
  return (
    <div className={`logo ${compact ? 'logo-compact' : ''}`}>
      <img
        className="logo-mark"
        src={logoImage}
        alt=""
        aria-hidden="true"
      />
      <span className="logo-word">КОНТУР</span>
    </div>
  );
}
