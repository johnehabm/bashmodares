import { useState } from 'react';
import { Check, X, Eye, Clock, CheckCircle2, XCircle, Search } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { StatusBadge, Modal, EmptyState } from '../ui';
import type { EnrollmentStatus } from '../../types';

export function AdminEnrollments() {
  const { enrollments, updateEnrollmentStatus } = useApp();
  const [filter, setFilter] = useState<'all' | EnrollmentStatus>('all');
  const [search, setSearch] = useState('');
  const [viewing, setViewing] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const filtered = enrollments
    .filter((e) => (filter === 'all' ? true : e.status === filter))
    .filter((e) =>
      search ? e.studentName.includes(search) || e.courseTitle.includes(search) : true,
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const viewingEnr = enrollments.find((e) => e.id === viewing);

  const handleReject = () => {
    if (!rejecting) return;
    updateEnrollmentStatus(rejecting, 'rejected', rejectNote || 'إيصال غير صالح');
    setRejecting(null);
    setRejectNote('');
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الكورس..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pr-10"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'pending', label: 'معلقة' },
            { key: 'approved', label: 'مقبولة' },
            { key: 'rejected', label: 'مرفوضة' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                filter === f.key
                  ? 'bg-brand-600 text-white'
                  : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-8 w-8" />}
          title="لا توجد تسجيلات"
          description="لم يتم العثور على تسجيلات مطابقة للفلتر."
        />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-ink-200 bg-ink-50 text-xs font-900 text-ink-500 dark:border-ink-800 dark:bg-ink-800/50 dark:text-ink-400">
                <tr>
                  <th className="px-4 py-3">الطالب</th>
                  <th className="px-4 py-3">الكورس</th>
                  <th className="px-4 py-3">المبلغ</th>
                  <th className="px-4 py-3">التاريخ</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-ink-50 dark:hover:bg-ink-800/30">
                    <td className="px-4 py-3 font-bold text-ink-800 dark:text-ink-100">
                      {e.studentName}
                    </td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{e.courseTitle}</td>
                    <td className="px-4 py-3 font-900 text-brand-600 dark:text-brand-400">
                      {e.amount} ج.م
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-400">
                      {new Date(e.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewing(e.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-100 text-ink-600 hover:bg-ink-200 dark:bg-ink-800 dark:text-ink-300"
                          title="عرض الإيصال"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {e.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateEnrollmentStatus(e.id, 'approved')}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-700 hover:bg-brand-600 hover:text-white dark:bg-brand-900/40 dark:text-brand-300"
                              title="قبول"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setRejecting(e.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700 hover:bg-red-600 hover:text-white dark:bg-red-900/40 dark:text-red-300"
                              title="رفض"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View receipt modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="إيصال الدفع" maxWidth="max-w-2xl">
        {viewingEnr && (
          <div>
            <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-ink-50 p-3 dark:bg-ink-800/50">
                <p className="text-xs text-ink-400">الطالب</p>
                <p className="font-bold text-ink-800 dark:text-ink-100">{viewingEnr.studentName}</p>
              </div>
              <div className="rounded-xl bg-ink-50 p-3 dark:bg-ink-800/50">
                <p className="text-xs text-ink-400">المبلغ</p>
                <p className="font-bold text-brand-600">{viewingEnr.amount} ج.م</p>
              </div>
              <div className="rounded-xl bg-ink-50 p-3 dark:bg-ink-800/50">
                <p className="text-xs text-ink-400">الكورس</p>
                <p className="font-bold text-ink-800 dark:text-ink-100">{viewingEnr.courseTitle}</p>
              </div>
              <div className="rounded-xl bg-ink-50 p-3 dark:bg-ink-800/50">
                <p className="text-xs text-ink-400">التاريخ</p>
                <p className="font-bold text-ink-800 dark:text-ink-100">
                  {new Date(viewingEnr.createdAt).toLocaleString('ar-EG')}
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-ink-200 dark:border-ink-800">
              <img src={viewingEnr.receiptUrl} alt="إيصال" className="w-full" />
            </div>
            {viewingEnr.status === 'pending' && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    updateEnrollmentStatus(viewingEnr.id, 'approved');
                    setViewing(null);
                  }}
                  className="btn-primary flex-1"
                >
                  <CheckCircle2 className="h-4 w-4" /> قبول
                </button>
                <button
                  onClick={() => {
                    setRejecting(viewingEnr.id);
                    setViewing(null);
                  }}
                  className="btn-danger flex-1"
                >
                  <XCircle className="h-4 w-4" /> رفض
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject modal */}
      <Modal open={!!rejecting} onClose={() => setRejecting(null)} title="رفض التسجيل">
        <div className="space-y-4">
          <p className="text-sm text-ink-500 dark:text-ink-400">
            اكتب سبب الرفض (سيظهر للطالب):
          </p>
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="مثال: الإيصال غير واضح، يرجى إعادة الرفع"
            className="input min-h-[80px]"
          />
          <div className="flex gap-2">
            <button onClick={() => setRejecting(null)} className="btn-outline flex-1">
              إلغاء
            </button>
            <button onClick={handleReject} className="btn-danger flex-1">
              تأكيد الرفض
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
