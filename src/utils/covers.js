const esc = (value) => String(value || '').replace(/[&<>"\']/g, (ch) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
}[ch]));

// Universal editorial placeholder: a refined eye inspired by the site favicon.
export function fallbackNewsImage(item = {}) {
  const category = esc(item?.category || 'Новости');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#09082d"/><stop offset=".52" stop-color="#21145a"/><stop offset="1" stop-color="#080b25"/></linearGradient>
      <linearGradient id="iris" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d45cff"/><stop offset=".48" stop-color="#7545ff"/><stop offset="1" stop-color="#ff5ba8"/></linearGradient>
      <radialGradient id="glow"><stop stop-color="#b36aff" stop-opacity=".3"/><stop offset="1" stop-color="#b36aff" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1200" height="675" rx="28" fill="url(#bg)"/>
    <circle cx="600" cy="337" r="260" fill="url(#glow)"/>
    <path d="M280 337c92-112 202-168 320-168s228 56 320 168c-92 112-202 168-320 168S372 449 280 337Z" fill="#0d0b39" stroke="url(#iris)" stroke-width="14"/>
    <ellipse cx="600" cy="337" rx="102" ry="102" fill="url(#iris)"/>
    <ellipse cx="600" cy="337" rx="47" ry="70" fill="#08072d"/>
    <circle cx="628" cy="302" r="18" fill="#fff" fill-opacity=".72"/>
    <circle cx="600" cy="337" r="82" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="3"/>
    <text x="600" y="575" text-anchor="middle" fill="#dcd7ff" fill-opacity=".72" font-family="Arial,sans-serif" font-size="26" font-weight="700" letter-spacing="2">${category}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const coverMap = {};
export const avatarMap = {};
export const fallbackCovers = [];
export const remoteNewsImage = () => fallbackNewsImage();
