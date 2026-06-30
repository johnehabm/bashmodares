import type { ReactNode } from 'react';

export function StatusBadge({
  status,
}: {
  status: 'pending' | 'approved' | 'rejected';
}) {
  const map: Record<string, { label: string; cls: string }> = {
    pending: {
      label: 'قيد المراجعة',
      cls: 'bg-gold-100 text-gold-700 dark:bg-gold-900/40 dark:text-gold-300',
    },
    approved: {
      label: 'مقبول',
      cls: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
    },
    rejected: {
      label: 'مرفوض',
      cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    },
  };
  const s = map[status];
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-300 bg-white/50 px-6 py-16 text-center dark:border-ink-700 dark:bg-ink-900/50">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-500">
        {icon}
      </div>
      <h3 className="text-lg font-900 text-ink-800 dark:text-ink-100">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-ink-500 dark:text-ink-400">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm animate-fade-in" />
      <div
        className={`relative my-4 max-h-[90vh] w-full ${maxWidth} animate-scale-in overflow-y-auto rounded-2xl border border-ink-200 bg-white p-6 shadow-soft dark:border-ink-800 dark:bg-ink-900`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-900 text-ink-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700 dark:hover:bg-ink-800"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
