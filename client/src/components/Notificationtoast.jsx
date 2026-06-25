
import { useEffect } from 'react';

const ICONS = {
  TASK_OVERDUE:   '⚠️',
  TASK_COMPLETED: '✅',
};

const COLORS = {
  TASK_OVERDUE:   'border-red-500 bg-red-950 text-red-100',
  TASK_COMPLETED: 'border-green-500 bg-green-950 text-green-100',
};

/**
 * @param {{ type, title, message, id }} notification
 * @param {function} onDismiss
 */
export default function NotificationToast({ notification, onDismiss }) {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const colorClass = COLORS[notification.type] || 'border-zinc-500 bg-zinc-800 text-zinc-100';
  const icon       = ICONS[notification.type]  || 'ℹ️';

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full border-l-4 rounded-lg p-4 shadow-xl
        flex items-start gap-3 animate-slide-in ${colorClass}`}
      role="alert"
    >
      <span className="text-xl mt-0.5 shrink-0">{icon}</span>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-snug truncate">{notification.title}</p>
        <p className="text-xs opacity-80 mt-0.5 leading-snug">{notification.message}</p>
      </div>

      <button
        onClick={onDismiss}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}