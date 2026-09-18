import { Check, X, Info } from 'lucide-react';
import { useApp } from '../../state/store';

const icons = { success: Check, error: X, info: Info };

export default function ToastStack() {
  const { toasts, dismissToast } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map(t => {
        const Icon = icons[t.kind] || Info;
        return (
          <div className={`toast ${t.kind}`} key={t.id} onClick={() => dismissToast(t.id)}>
            <b><Icon size={10} /></b>
            <span>{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
}
