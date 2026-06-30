import { useState } from 'react';
import { KeyRound, Ban, CheckCircle2, Search, Mail, Phone, Calendar } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Modal, EmptyState } from '../ui';

export function AdminStudents() {
  const { users, enrollments, resetStudentPassword, toggleStudentAccess } = useApp();
  const [search, setSearch] = useState('');
  const [resetting, setResetting] = useState<string | null>(null);
  const [newPass, setNewPass] = useState('');

  const students = users.filter((u) => u.role === 'student');
  const filtered = students.filter((s) =>
    search ? s.name.includes(search) || s.email.toLowerCase().includes(search.toLowerCase()) : true,
  );

  const handleReset = () => {
    if (!resetting || !newPass) return;
    resetStudentPassword(resetting, newPass);
    setResetting(null);
    setNewPass('');
  };

  return (
    <div>
      <div className="mb-5">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="بحث بالاسم أو البريد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pr-10"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Search className="h-8 w-8" />} title="لا يوجد طلاب" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => {
            const disabled = s.password === '__DISABLED__';
            const enrCount = enrollments.filter((e) => e.studentId === s.id && e.status === 'approved').length;
            return (
              <div key={s.id} className="card p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 font-display text-lg font-900 text-white">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate font-900 text-ink-900 dark:text-white">{s.name}</h3>
                    <p className="truncate text-xs text-ink-400">{s.email}</p>
                  </div>
                  {disabled ? (
                    <span className="badge bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                      <Ban className="h-3.5 w-3.5" /> موقوف
                    </span>
                  ) : (
                    <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                      <CheckCircle2 className="h-3.5 w-3.5" /> نشط
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-ink-500 dark:text-ink-400">
                  {s.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5" /> <span dir="ltr">{s.phone}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" /> {s.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" /> {new Date(s.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                  <p className="font-bold text-brand-600 dark:text-brand-400">{enrCount} كورس نشط</p>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setResetting(s.id)}
                    className="btn-outline flex-1 text-xs"
                  >
                    <KeyRound className="h-3.5 w-3.5" /> كلمة المرور
                  </button>
                  <button
                    onClick={() => toggleStudentAccess(s.id)}
                    className={`flex-1 text-xs ${disabled ? 'btn-primary' : 'btn-danger'}`}
                  >
                    {disabled ? 'تفعيل' : 'إيقاف'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!resetting} onClose={() => setResetting(null)} title="إعادة تعيين كلمة المرور">
        <div className="space-y-4">
          <p className="text-sm text-ink-500 dark:text-ink-400">
            أدخل كلمة المرور الجديدة للطالب:
          </p>
          <input
            type="text"
            className="input"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            placeholder="كلمة مرور جديدة"
          />
          <div className="flex gap-2">
            <button onClick={() => setResetting(null)} className="btn-outline flex-1">إلغاء</button>
            <button onClick={handleReset} className="btn-primary flex-1">تعيين</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
