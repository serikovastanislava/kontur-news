import logoImage from '../../assets/kontur-logo-generated.png';

export default function Logo({ compact = false, children }) {
  return (
    <div className={`logo ${compact ? 'logo-compact' : ''}`}>
      <span className="logo-icon">
        <img
          className="logo-mark"
          src={logoImage}
          alt=""
          aria-hidden="true"
        />
      </span>
      <div className="logo-word-col">
        <span className="logo-word">КОНТУР</span>
        {children}
      </div>
    </div>
  );
}
