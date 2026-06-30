import { X, Download } from 'lucide-react';
import { useRef } from 'react';
import * as htmlToImage from 'html-to-image';

interface CertificateProps {
    studentName: string;
    courseTitle: string;
    onClose: () => void;
}

export function Certificate({ studentName, courseTitle, onClose }: CertificateProps) {
    const certificateRef = useRef<HTMLDivElement>(null);

    const handleDownloadImage = async () => {
        if (!certificateRef.current) return;

        try {
            const dataUrl = await htmlToImage.toPng(certificateRef.current, {
                pixelRatio: 4,
                cacheBust: true,
                backgroundColor: "#ffffff",
            });

            const link = document.createElement("a");
            link.download = `${studentName || "certificate"}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/80 p-4 print:bg-white print:p-0">

            {/* حاوية الشهادة */}
            <div className="relative w-full max-w-4xl shadow-2xl print:m-0 print:h-screen print:w-screen print:max-w-none print:shadow-none">

                {/* أزرار التحكم */}
                <div className="absolute -top-16 right-0 flex gap-3 print:hidden">
                    <button
                        onClick={handleDownloadImage}
                        className="btn-primary flex items-center gap-2 bg-brand-600 hover:bg-brand-700"
                    >
                        <Download className="h-5 w-5" />
                        حفظ كصورة
                    </button>
                    <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-600 hover:bg-red-50">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* مساحة الشهادة (نسبة A4 العرضية) */}
                <div
                    ref={certificateRef}
                    className="relative flex aspect-[1.414/1] w-full overflow-hidden bg-white"
                >
                    {/* صورة التصميم الخاص بك (في الخلفية) */}
                    <img
                        src="/my-certificate.png"
                        alt="Certificate Background"
                        className="absolute inset-0 z-0 h-full w-full object-cover"
                    />

                    {/* طبقة النصوص التي ستظهر فوق التصميم */}
                    {/* يمكنك تعديل (mt-...) أو (mb-...) لضبط المسافات حسب تصميمك */}
                    <div className="relative z-10 flex h-full w-full flex-col items-center justify-center pt-0">

                        {/* اسم الطالب */}
                        <h2 className="mt-8 text-4xl font-black text-ink-900 md:text-5xl print:text-black">
                            {studentName}
                        </h2>

                        {/* مسافة بين الاسم والكورس */}
                        <div className="mt-11"></div>

                        {/* اسم الكورس */}
                        <h3 className="text-3xl font-bold text-brand-600 md:text-2xl print:text-black">
                            {courseTitle}
                        </h3>

                    </div>

                    {/* التاريخ (تم وضعه أسفل اليسار، يمكنك تغيير مكانه) */}
                    <div className="absolute bottom-12 left-24 z-10">
                        <p className="text-xl font-bold text-ink-800 print:text-black">
                            {new Date().toLocaleDateString('ar-EG')}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}