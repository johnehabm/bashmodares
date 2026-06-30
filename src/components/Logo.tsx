export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* هنا الأيقونة الـ PNG بتاعتك */}
      <div className="flex items-center justify-center">
        <img
          src="/my-logo.png" // تأكد إن اسم ملف الأيقونة عندك هو logo.png، لو اسمه غير كده غيره هنا
          alt="Al-Bashmodares Logo"
          className="h-10 w-10 object-contain"
        />
      </div>

      <div className="flex flex-col leading-none">
        <span className="font-display text-lg font-900 text-ink-900 dark:text-white">
          البشمدرس
        </span>
        <span className="text-[10px] font-bold tracking-wide text-brand-600 dark:text-brand-400">
          AL-BASHMODARES
        </span>
      </div>
    </div>
  );
}