import { useState } from 'react';
import { Upload, CheckCircle2, ShieldAlert, Smartphone, Hash } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { supabase } from '../lib/supabase';

interface EnrollmentFlowProps {
  courseId: string;
  price: number;
}

export function EnrollmentFlow({ courseId, price }: EnrollmentFlowProps) {
  const { createEnrollment } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentAccount, setPaymentAccount] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('يرجى اختيار صورة الإيصال');
      return;
    }
    if (!paymentMethod) {
      alert('يرجى اختيار طريقة الدفع');
      return;
    }
    if (!paymentAccount) {
      alert('يرجى إدخال الرقم أو الحساب المحول منه');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('receipts').getPublicUrl(filePath);

      await createEnrollment({
        courseId,
        receiptUrl: data.publicUrl,
        paymentMethod: paymentMethod,
        paymentAccount: paymentAccount
      });

    } catch (error: any) {
      alert(`حدث خطأ أثناء الرفع: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-ink-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#171a36]">
      <div className="mb-6 flex items-start gap-4 rounded-xl bg-brand-50 p-4 dark:bg-brand-900/10">
        <ShieldAlert className="mt-0.5 h-5 w-5 text-brand-600 dark:text-brand-400" />
        <div>
          <h4 className="font-bold text-ink-900 dark:text-white">خطوات تفعيل الكورس</h4>
          <p className="mt-1 text-sm text-ink-600 dark:text-ink-400">
            قم بتحويل مبلغ <span className="font-bold text-brand-600 dark:text-brand-400">{price} ج.م</span> على أرقام المنصة، ثم املأ البيانات التالية وارفع صورة الإيصال.
          </p>
        </div>
      </div>

      <form onSubmit={handleUpload} className="space-y-4">
        {/* اختيار طريقة الدفع */}
        <div>
          <label className="mb-1 block text-sm font-bold text-ink-700 dark:text-ink-300 flex items-center gap-2">
            <Smartphone className="h-4 w-4" /> طريقة الدفع (المحفظة)
          </label>
          <select
            required
            className="input-field"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="">اختر طريقة الدفع...</option>
            <option value="فودافون كاش">فودافون كاش</option>
            <option value="انستا باي (InstaPay)">انستا باي (InstaPay)</option>
            <option value="اتصالات كاش">اتصالات كاش</option>
            <option value="أورنج كاش">أورنج كاش</option>
            <option value="وي باي (We Pay)">وي باي (We Pay)</option>
            <option value="تحويل بنكي">تحويل بنكي</option>
          </select>
        </div>

        {/* رقم الحساب المحول منه */}
        <div>
          <label className="mb-1 block text-sm font-bold text-ink-700 dark:text-ink-300 flex items-center gap-2">
            <Hash className="h-4 w-4" /> الرقم أو الحساب المحول منه
          </label>
          <input
            type="text"
            required
            placeholder="مثال: 01012345678 أو حساب Instapay"
            className="input-field"
            value={paymentAccount}
            onChange={(e) => setPaymentAccount(e.target.value)}
          />
        </div>

        {/* رفع الإيصال */}
        <div>
          <label className="mb-1 block text-sm font-bold text-ink-700 dark:text-ink-300 flex items-center gap-2">
            <Upload className="h-4 w-4" /> صورة الإيصال (سكرين شوت)
          </label>
          <div className="relative mt-2 rounded-xl border-2 border-dashed border-ink-200 p-6 text-center transition-colors hover:border-brand-500 dark:border-white/10 dark:hover:border-brand-500">
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            {file ? (
              <div className="flex flex-col items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
                <span className="text-sm font-bold">{file.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-ink-500 dark:text-ink-400">
                <Upload className="h-8 w-8" />
                <span className="text-sm font-medium">اضغط هنا أو اسحب الصورة لإرفاق الإيصال</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isUploading || !file || !paymentMethod || !paymentAccount}
          className="btn-primary mt-6 w-full"
        >
          {isUploading ? 'جاري إرسال الطلب...' : 'إرسال لتفعيل الكورس'}
        </button>
      </form>
    </div>
  );
}