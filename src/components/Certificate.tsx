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
                    {/* صورة الخلفية */}
                    <img
                        src="/my-certificate.png"
                        alt="Certificate Background"
                        className="absolute inset-0 z-0 h-full w-full object-cover"
                    />

                    {/* 🔴 Layer 1: اسم الطالب (متمركز تماماً في النص) */}
                    <div className="absolute left-0 top-[46%] z-10 w-full -translate-y-1/2 text-center">
                        <h2 className="text-2xl font-black leading-none text-ink-900 sm:text-3xl md:text-5xl lg:text-6xl print:text-black">
                            {studentName}
                        </h2>
                    </div>

                    {/* 🔴 Layer 2: اسم الكورس (متمركز تماماً في النص) */}
                    <div className="absolute left-0 top-[59%] z-10 w-full -translate-y-1/2 text-center">
                        <h3 className="text-lg font-bold leading-none text-brand-600 sm:text-2xl md:text-3xl lg:text-4xl print:text-black">
                            {courseTitle}
                        </h3>
                    </div>

                    {/* 🔴 Layer 3: التاريخ (متمركز تماماً) */}
                    <div className="absolute bottom-[15%] left-[15%] z-10 translate-y-1/2">
                        <p className="text-xs font-bold leading-none text-ink-800 sm:text-lg md:text-xl lg:text-2xl print:text-black">
                            {new Date().toLocaleDateString('ar-EG')}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}