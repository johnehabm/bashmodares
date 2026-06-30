import { useState } from 'react';
import { Megaphone, Plus, Trash2, Power, PowerOff } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { EmptyState } from '../ui';

export function AdminAnnouncements() {
  const { announcements, addAnnouncement, toggleAnnouncement, deleteAnnouncement } = useApp();
  const [text, setText] = useState('');

  const handleAdd = () => {
    if (!text.trim()) return;
    addAnnouncement(text.trim());
    setText('');
  };

  return (
    <div className="max-w-2xl">
      <div className="card mb-6 p-5">
        <h3 className="mb-3 flex items-center gap-2 font-900 text-ink-900 dark:text-white">
          <Megaphone className="h-5 w-5 text-brand-600" />
          إضافة إشعار جديد
        </h3>
        <p className="mb-3 text-xs text-ink-400">
          سيظهر الإشعار النشط في شريط أعلى الموقع لجميع الزوار.
        </p>
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="مثال: تنبيه: امتحان الشهر يوم السبت..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd} className="btn-primary shrink-0">
            <Plus className="h-4 w-4" /> نشر
          </button>
        </div>
      </div>

      <h3 className="mb-3 text-sm font-900 text-ink-700 dark:text-ink-200">الإشعارات الحالية</h3>
      {announcements.length === 0 ? (
        <EmptyState icon={<Megaphone className="h-8 w-8" />} title="لا توجد إشعارات" />
      ) : (
        <div className="space-y-2">
          {announcements.map((a) => (
            <div key={a.id} className="card flex items-center gap-3 p-4">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.active ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300' : 'bg-ink-100 text-ink-400 dark:bg-ink-800'}`}>
                <Megaphone className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold text-ink-800 dark:text-ink-100">{a.text}</p>
                <p className="text-xs text-ink-400">{new Date(a.createdAt).toLocaleString('ar-EG')}</p>
              </div>
              <button
                onClick={() => toggleAnnouncement(a.id)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${a.active ? 'bg-brand-100 text-brand-700 hover:bg-brand-600 hover:text-white dark:bg-brand-900/40 dark:text-brand-300' : 'bg-ink-100 text-ink-500 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300'}`}
                title={a.active ? 'إيقاف' : 'تفعيل'}
              >
                {a.active ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
              </button>
              <button
                onClick={() => deleteAnnouncement(a.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700 hover:bg-red-600 hover:text-white dark:bg-red-900/40 dark:text-red-300"
                title="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
