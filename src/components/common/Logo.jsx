export default function Logo({ compact = false }) {
  return (
    <div className={`logo ${compact ? "logo-compact" : ""}`}>
      <svg className="logo-mark" viewBox="0 0 86 86" aria-hidden="true">
        <path d="M12 14 53 5v64l-41 9z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round"/>
        <path d="M21 23 45 17v42l-24 6z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
        <path d="M31 41 46 48 31 55" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M56 31c-4-10 4-17 11-14 1-10 16-11 19-1 9-4 18 5 13 14 9 2 11 14 3 19 3 9-7 15-15 11-5 8-18 6-20-4-9 3-16-8-11-15z"
              fill="currentColor" opacity=".95"/>
        <path d="M70 55c-1 8-4 16-9 24M76 54c2 9 3 18 0 27M82 52c5 8 8 15 9 23M64 56c-6 8-10 15-13 22M86 49c7 4 10 8 13 13"
              fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
        <circle cx="72" cy="38" r="7" fill="#09051d"/>
        <circle cx="88" cy="31" r="4" fill="#09051d"/>
      </svg>
      <span className="logo-word">КОНТУР</span>
    </div>
  );
}