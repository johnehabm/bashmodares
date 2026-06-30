import { useState, useEffect, useRef, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  Star,
  CheckCircle2,
  UserPlus,
  Search,
  Receipt,
  MonitorPlay,
  Sparkles,
  ChevronDown,
  PlayCircle,
  BookOpen,
  Brain,
  Headset
} from 'lucide-react';

// --- مكون الأنيميشن عند التمرير (Scroll Reveal) ---
function Reveal({ children, delay = 0, className = "" }: { children: ReactNode, delay?: number, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// --- مكون العداد التفاعلي ---
function AnimatedCounter({ end, duration = 2000 }: { end: number, duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          setCount(Math.floor(progress * end));
          if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

// --- الصفحة الرئيسية ---
export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    { q: "كيف يمكنني الاشتراك في الكورسات؟", a: "بكل بساطة، قم بإنشاء حساب جديد، تصفح الكورسات المتاحة للصف الخاص بك، ثم ارفع صورة إيصال الدفع (فودافون كاش أو انستا باي) ليتم تفعيل الكورس فوراً." },
    { q: "هل يمكنني مشاهدة الفيديوهات أكثر من مرة؟", a: "نعم، بمجرد اشتراكك في الكورس، يمكنك مشاهدة الدروس عدد لا نهائي من المرات طوال فترة صلاحية الكورس." },
    { q: "كيف أحصل على المذكرات والملخصات؟", a: "كل درس يحتوي على قسم خاص بملفات الـ PDF يمكنك تحميلها وطباعتها مباشرة من داخل المنصة." },
    { q: "ماذا أفعل إذا واجهتني مشكلة تقنية؟", a: "فريق الدعم الفني متواجد على مدار الساعة. يمكنك التواصل معنا عبر واتساب وسنقوم بحل أي مشكلة تواجهك في أسرع وقت." }
  ];

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-ink-50 font-sans transition-colors duration-500 selection:bg-brand-500 selection:text-white dark:bg-[#0f1123]">

      {/* 🎬 Hero Section */}
      <section className="relative flex min-h-[95vh] items-center pb-10 pt-28 lg:pt-0">
        <div className="pointer-events-none absolute right-10 top-20 h-[600px] w-[600px] rounded-full bg-brand-400/20 blur-[150px] transition-colors duration-700 dark:bg-[#482880]/30"></div>
        <div className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-[#f01c6d]/15 blur-[120px] transition-colors duration-700 dark:bg-[#b82065]/20"></div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-2">

          <div className="order-2 text-right lg:order-1 lg:pt-10">
            <Reveal delay={100}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/70 px-4 py-2 text-sm font-bold text-ink-800 shadow-sm backdrop-blur-md transition-colors dark:border-white/10 dark:bg-white/5 dark:text-ink-200">
                <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-[#f01c6d]"></span>
                التسجيل مفتوح الآن للعام الدراسي الجديد
              </div>
            </Reveal>

            <Reveal delay={200}>
              <h1 className="font-display text-5xl font-black leading-[1.2] tracking-tight text-ink-900 transition-colors dark:text-white md:text-6xl lg:text-7xl">
                مستر <br />
                <span className="bg-gradient-to-l from-brand-600 to-brand-400 bg-clip-text text-transparent dark:from-white dark:to-ink-300">
                  عماد عادل
                </span>
              </h1>
            </Reveal>

            <Reveal delay={300}>
              <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-ink-600 transition-colors dark:text-ink-300 md:text-xl">
                خبير تبسيط المناهج وتوصيل المعلومة بأحدث أساليب الشرح التفاعلية. خطوتك الأولى والمضمونة نحو التفوق وتحقيق الدرجة النهائية.
              </p>
            </Reveal>

            <Reveal delay={400}>
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Link
                  to="/courses"
                  className="group relative flex h-16 items-center justify-center gap-3 overflow-hidden rounded-2xl bg-brand-600 px-10 text-xl font-bold text-white shadow-lg shadow-brand-500/30 transition-all hover:-translate-y-1 hover:bg-brand-500 hover:shadow-brand-500/50 dark:hover:shadow-[0_0_30px_-5px_#3b82f6]"
                >
                  <PlayCircle className="h-6 w-6" />
                  ابدأ التعلم الآن
                  <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-2" />
                </Link>

                <div className="flex items-center gap-3 text-sm font-bold text-ink-700 transition-colors dark:text-ink-300">
                  <div className="flex -space-x-3 -space-x-reverse">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-brand-500 text-white shadow-sm transition-colors dark:border-[#0f1123]"><Star className="h-5 w-5" /></div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-gold-500 text-white shadow-sm transition-colors dark:border-[#0f1123]"><Sparkles className="h-5 w-5" /></div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[#f01c6d] text-white shadow-sm transition-colors dark:border-[#0f1123]"><CheckCircle2 className="h-5 w-5" /></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-ink-900 dark:text-white">
                      +<AnimatedCounter end={500} />
                    </span>
                    <span className="text-xs opacity-80">طالب يثقون بنا</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="relative order-1 flex h-[450px] justify-center lg:order-2 lg:h-[650px]">
            <Reveal delay={200} className="absolute inset-0 flex items-center justify-center">
              <div
                className="h-[350px] w-[350px] bg-gradient-to-br from-brand-300 to-brand-500 transition-all duration-1000 ease-in-out hover:scale-105 dark:from-[#4a24c2] dark:to-[#6b3deb] lg:h-[500px] lg:w-[500px]"
                style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}
              ></div>
              <div
                className="absolute right-10 top-10 h-28 w-28 bg-[#f01c6d] lg:h-36 lg:w-36"
                style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
              ></div>
            </Reveal>
            <Reveal delay={400} className="absolute bottom-0 z-10 h-[90%]">
              <img
                src="/teacher.png"
                alt="المستر"
                className="h-full w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform duration-700 hover:scale-105"
                onError={(e) => { e.currentTarget.src = 'https://cdni.iconscout.com/illustration/premium/thumb/teacher-7280766-5954605.png?f=webp'; }}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* 🌟 Quick Features (Glassmorphism) */}
      <div className="relative z-20 border-y border-ink-200 bg-white/70 py-6 backdrop-blur-xl transition-colors duration-500 dark:border-white/5 dark:bg-[#171a36]/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-around gap-6 px-4">
          {['شرح تفصيلي للمنهج', 'متابعة دورية وتقييم', 'مذكرات PDF حصرية', 'امتحانات إلكترونية ذكية'].map((text, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="flex items-center gap-2 font-bold text-ink-800 transition-colors dark:text-white">
                <CheckCircle2 className="h-6 w-6 text-[#f01c6d] dark:text-brand-500" />
                <span className="text-sm md:text-base">{text}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* 🚀 مميزات المنصة (البديل القوي لقسم الآراء) */}
      <section className="relative overflow-hidden border-b border-ink-200 bg-ink-100/50 px-4 py-24 transition-colors dark:border-white/5 dark:bg-black/20">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-16 text-center">
            <h2 className="font-display text-3xl font-black text-ink-900 transition-colors dark:text-white md:text-5xl">
              كل ما تحتاجه <span className="text-brand-600 dark:text-brand-400">للتفوق في مكان واحد</span>
            </h2>
            <p className="mt-4 text-lg text-ink-600 transition-colors dark:text-ink-400">
              صممنا المنصة لتوفير أفضل تجربة تعليمية تناسب احتياجاتك.
            </p>
          </Reveal>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: <MonitorPlay className="h-8 w-8" />, title: 'شروحات عالية الجودة', desc: 'فيديوهات مسجلة بأحدث التقنيات لضمان وضوح الصوت والصورة، لتعيش تجربة السنتر وأنت في بيتك.', color: 'text-brand-600 dark:text-brand-400' },
              { icon: <BookOpen className="h-8 w-8" />, title: 'مذكرات حصرية (PDF)', desc: 'ملخصات وتدريبات جاهزة للتحميل مع كل حصة لتسهيل المذاكرة والمراجعة المستمرة.', color: 'text-[#f01c6d] dark:text-[#f01c6d]' },
              { icon: <Brain className="h-8 w-8" />, title: 'تقييم مستمر وذكي', desc: 'امتحانات إلكترونية وبطاقات تفاعلية بعد كل درس لتقييم مستواك ومعرفة نقاط ضعفك فوراً.', color: 'text-purple-600 dark:text-purple-400' },
              { icon: <Headset className="h-8 w-8" />, title: 'متابعة ودعم فني', desc: 'فريق متخصص للرد على استفساراتك الأكاديمية والتقنية ومتابعة مستواك على مدار الساعة.', color: 'text-gold-600 dark:text-gold-400' }
            ].map((feature, idx) => (
              <Reveal key={idx} delay={idx * 150} className="group rounded-[2rem] border border-ink-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20">
                <div className={`mb-6 inline-flex rounded-2xl bg-ink-50 p-4 transition-colors dark:bg-[#0f1123] ${feature.color}`}>
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-bold text-ink-900 transition-colors dark:text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-ink-600 transition-colors dark:text-ink-400">{feature.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 🚀 How it Works Section */}
      <section id="how-it-works" className="relative scroll-mt-24 px-4 py-24">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/5 blur-[100px] transition-colors dark:bg-brand-900/10"></div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <Reveal className="mb-20 text-center">
            <h2 className="font-display text-4xl font-black text-ink-900 transition-colors dark:text-white md:text-5xl">
              كيف تبدأ <span className="text-[#f01c6d]">رحلتك معنا؟</span>
            </h2>
            <p className="mt-4 text-lg text-ink-600 transition-colors dark:text-ink-400">4 خطوات بسيطة تفصلك عن التفوق.</p>
          </Reveal>

          <div className="relative grid gap-12 md:grid-cols-4">
            <div className="absolute right-[10%] top-12 z-0 hidden h-0.5 w-[80%] bg-gradient-to-l from-transparent via-[#f01c6d]/30 to-transparent md:block"></div>

            {[
              { icon: <UserPlus className="h-8 w-8" />, title: '1. إنشاء حساب', desc: 'سجل بياناتك مجاناً في ثوانٍ معدودة.', color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-400/10', border: 'border-brand-200 dark:border-brand-400/20' },
              { icon: <Search className="h-8 w-8" />, title: '2. اختيار الكورس', desc: 'تصفح الكورسات المتاحة للصف الخاص بك.', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-400/10', border: 'border-purple-200 dark:border-purple-400/20' },
              { icon: <Receipt className="h-8 w-8" />, title: '3. تفعيل الاشتراك', desc: 'ارفع صورة الإيصال ليتم التفعيل فوراً.', color: 'text-gold-600 dark:text-gold-400', bg: 'bg-gold-50 dark:bg-gold-400/10', border: 'border-gold-200 dark:border-gold-400/20' },
              { icon: <MonitorPlay className="h-8 w-8" />, title: '4. بدء التعلم', desc: 'شاهد الفيديوهات وحل الاختبارات.', color: 'text-[#f01c6d]', bg: 'bg-[#f01c6d]/10', border: 'border-[#f01c6d]/20' }
            ].map((step, idx) => (
              <Reveal key={idx} delay={idx * 200} className="relative z-10 flex flex-col items-center text-center">
                <div className={`mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] border bg-white shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:bg-transparent dark:shadow-none dark:hover:shadow-[0_0_30px_-5px_currentColor] ${step.border} ${step.color} dark:${step.bg}`}>
                  {step.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold text-ink-900 transition-colors dark:text-white">{step.title}</h3>
                <p className="max-w-[250px] text-sm leading-relaxed text-ink-600 transition-colors dark:text-ink-400">{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ❓ FAQ Section */}
      <section className="relative px-4 py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal className="mb-16 text-center">
            <h2 className="font-display text-4xl font-black text-ink-900 transition-colors dark:text-white">
              الأسئلة <span className="text-brand-600 dark:text-brand-400">الشائعة</span>
            </h2>
          </Reveal>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <Reveal key={idx} delay={idx * 100}>
                <div
                  className={`cursor-pointer overflow-hidden rounded-[2rem] border transition-all duration-300 ${openFaq === idx ? 'border-brand-500 bg-white shadow-md dark:border-brand-500/50 dark:bg-brand-900/10' : 'border-ink-200 bg-white/50 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'}`}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <div className="flex items-center justify-between p-6">
                    <h3 className="font-bold text-ink-900 transition-colors dark:text-white">{faq.q}</h3>
                    <ChevronDown className={`h-5 w-5 text-ink-500 transition-transform duration-300 dark:text-ink-400 ${openFaq === idx ? 'rotate-180 text-brand-600 dark:text-brand-400' : ''}`} />
                  </div>
                  <div className={`grid transition-all duration-300 ease-in-out ${openFaq === idx ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 text-sm font-medium leading-relaxed text-ink-600 dark:text-ink-300">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 📱 Contact Section */}
      <section id="contact" className="relative scroll-mt-24 border-t border-ink-200 bg-white px-4 py-24 transition-colors duration-500 dark:border-white/5 dark:bg-ink-950">
        <div className="pointer-events-none absolute right-1/2 top-0 h-[500px] w-[500px] translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/10 blur-[120px] transition-colors dark:bg-brand-900/20"></div>

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <Reveal className="mb-16">
            <h2 className="font-display text-4xl font-black text-ink-900 transition-colors dark:text-white md:text-6xl">
              تواصل <span className="text-[#f01c6d]">معنا</span>
            </h2>
            <p className="mt-4 text-xl text-ink-600 transition-colors dark:text-ink-400">تابعنا عبر منصاتنا الرسمية للحصول على كل جديد.</p>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { label: 'واتساب', value: 'راسلنا للاستفسارات', color: 'hover:border-[#25D366] hover:bg-[#25D366]/5 dark:hover:bg-[#25D366]/20 dark:hover:border-[#25D366]/50', icon: <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#25D366]" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.591 5.52 0 10.002-4.48 10.002-10.001 0-5.52-4.482-10.002-10.002-10.002-5.521 0-10.002 4.482-10.002 10.002 0 1.868.502 3.551 1.487 5.166l-.995 3.636 3.738-.988z" /></svg>, link: 'https://wa.me/201210741671' },
              { label: 'فيسبوك', value: 'تابع آخر الأخبار', color: 'hover:border-[#1877F2] hover:bg-[#1877F2]/5 dark:hover:bg-[#1877F2]/20 dark:hover:border-[#1877F2]/50', icon: <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#1877F2]" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>, link: 'https://www.facebook.com/profile.php?id=100064737780173&rdid=yjIMMg8Sotizxg9D&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F18iSz2bCpN%2F#' },
              { label: 'يوتيوب', value: 'شاهد الشروحات المجانية', color: 'hover:border-[#FF0000] hover:bg-[#FF0000]/5 dark:hover:bg-[#FF0000]/20 dark:hover:border-[#FF0000]/50', icon: <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#FF0000]" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>, link: 'https://www.youtube.com/@%D8%A7%D9%84%D8%A8%D8%B4%D9%85%D8%AF%D8%B1%D8%B3' }
            ].map((item, idx) => (
              <Reveal key={idx} delay={idx * 150}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex flex-col items-center gap-4 rounded-[2rem] border border-ink-200 bg-ink-50 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/5 dark:bg-[#171a36] dark:shadow-none ${item.color}`}
                >
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-ink-900 transition-colors dark:text-white">{item.label}</h4>
                    <p className="mt-1 text-sm text-ink-500 transition-colors dark:text-ink-400">{item.value}</p>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}