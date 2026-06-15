'use client';

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS: Array<{ key: string; action: string }> = [
  { key: 'R', action: 'Refresh data' },
  { key: 'H', action: 'Toggle history chart' },
  { key: '?', action: 'Open this shortcuts help' },
  { key: 'Esc', action: 'Close this dialog' },
];

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-brand-border bg-brand-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-100">
            Keyboard Shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-brand-muted hover:text-gray-200"
          >
            ✕
          </button>
        </div>
        <ul className="space-y-2">
          {SHORTCUTS.map((s) => (
            <li
              key={s.key}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-300">{s.action}</span>
              <kbd className="rounded border border-brand-border bg-brand-bg px-2 py-0.5 font-mono text-xs text-gray-200">
                {s.key}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
