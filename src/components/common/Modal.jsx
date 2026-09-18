import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ onClose, children, wide = false, size, labelledBy }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const sizeClass = size === 'reader' ? ' modal-reader' : (wide ? ' modal-wide' : '');

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className={`modal-panel${sizeClass}`}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        <button className="modal-close" onClick={onClose} aria-label="Закрыть"><X size={17} /></button>
        {children}
      </div>
    </div>
  );
}
