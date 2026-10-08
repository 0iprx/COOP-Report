import React from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  CheckCircle2,
  Zap,
  Activity,
  Layers,
  Clock
} from 'lucide-react';

interface PeriodicAnalyticsChartsProps {
  isReportAr: boolean;
}

export const PeriodicAnalyticsCharts: React.FC<PeriodicAnalyticsChartsProps> = ({ isReportAr }) => {
  // ── Data Sets ────────────────────────────────────────────────────────
  const dailyShifts = [
    { date: isReportAr ? '28 سبتمبر' : 'Sep 28', tickets: 19, label: '19' },
    { date: isReportAr ? '30 سبتمبر' : 'Sep 30', tickets: 18, label: '18' },
    { date: isReportAr ? '1 أكتوبر' : 'Oct 01', tickets: 33, label: '33' },
    { date: isReportAr ? '4 أكتوبر' : 'Oct 04', tickets: 54, label: '54' },
    { date: isReportAr ? '5 أكتوبر' : 'Oct 05', tickets: 40, label: '40' },
    { date: isReportAr ? '6 أكتوبر' : 'Oct 06', tickets: 23, label: '23' },
    { date: isReportAr ? '7 أكتوبر' : 'Oct 07', tickets: 57, label: isReportAr ? '57 (الذروة)' : '57 (Peak)' }
  ];

  const categories = [
    {
      titleAr: 'Link Down (انقطاع الاتصال المباشر)',
      titleEn: 'Link Down (Direct Line Drop)',
      count: 65,
      percent: '26.6%',
      colorBg: 'bg-rose-500',
      colorBorder: 'border-rose-500/20'
    },
    {
      titleAr: 'Slowness (بطء الخدمة والتصفح)',
      titleEn: 'Slowness (Speed Degradation)',
      count: 58,
      percent: '23.8%',
      colorBg: 'bg-amber-500',
      colorBorder: 'border-amber-500/20'
    },
    {
      titleAr: 'Frequency Disconnections (تقطيع متكرر)',
      titleEn: 'Frequency Disconnections (Intermittent Drops)',
      count: 48,
      percent: '19.7%',
      colorBg: 'bg-sky-500',
      colorBorder: 'border-sky-500/20'
    },
    {
      titleAr: 'Port Blocked & CVLAN (حظر المنافذ والـ VLAN)',
      titleEn: 'Port Blocked & CVLAN Configuration',
      count: 42,
      percent: '17.2%',
      colorBg: 'bg-indigo-500',
      colorBorder: 'border-indigo-500/20'
    },
    {
      titleAr: 'Field Escalations & Site Visits (تصعيد وإرسال فني)',
      titleEn: 'Field Escalations & FOPS Dispatches',
      count: 31,
      percent: '12.7%',
      colorBg: 'bg-emerald-500',
      colorBorder: 'border-emerald-500/20'
    }
  ];

  // SVG Chart scaling
  const chartHeight = 180;
  const chartWidth = 540;
  const maxVal = 60;
  const barWidth = 42;
  const gap = (chartWidth - dailyShifts.length * barWidth) / (dailyShifts.length + 1);

  // Points for trend polyline
  const polylinePoints = dailyShifts
    .map((item, idx) => {
      const x = gap + idx * (barWidth + gap) + barWidth / 2;
      const y = chartHeight - 30 - (item.tickets / maxVal) * 120;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div
      className="my-8 space-y-6 break-inside-avoid print:my-6 print:space-y-5"
      dir={isReportAr ? 'rtl' : 'ltr'}
    >
      {/* ── Section Header ─────────────────────────────────────────── */}
      <div className="pb-2.5 border-b-2 border-accent/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-accent-dim text-accent print:bg-slate-800 print:text-white">
            <BarChart3 className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-ink print:text-[13pt]">
              {isReportAr
                ? 'لوحة المؤشرات والرسوم البيانية الميدانية'
                : 'Operational Performance & Telemetry Analytics'}
            </h3>
            <p className="text-[11px] text-sub font-bold">
              {isReportAr
                ? 'تحليل إحصائي متقدم لحجم الإنجاز وتوزيع التذاكر والأعطال (فترة 20/9 – 7/10)'
                : 'Statistical breakdown of ticket volume, fault categories, and shift velocity'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-accent text-white shadow-2xs">
          {isReportAr ? '244 تذكرة فريدة' : '244 Total Tickets'}
        </span>
      </div>

      {/* ── 1. Top Executive Metric Cards ──────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-start">
        <div className="p-3 bg-bg border border-line rounded-xl print:border-slate-300 print:bg-slate-50/70">
          <div className="flex items-center justify-between text-sub mb-1">
            <span className="text-[10px] font-bold">{isReportAr ? 'التذاكر المعالجة' : 'Total Handled'}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-ink tracking-tight">244</div>
          <div className="text-[9.5px] font-bold text-emerald-600 mt-0.5">
            {isReportAr ? '✓ فحص وإغلاق مكتمل' : '100% Verified Telemetry'}
          </div>
        </div>

        <div className="p-3 bg-bg border border-line rounded-xl print:border-slate-300 print:bg-slate-50/70">
          <div className="flex items-center justify-between text-sub mb-1">
            <span className="text-[10px] font-bold">{isReportAr ? 'ذروة الشفت' : 'Peak Shift Output'}</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-accent tracking-tight">57</div>
          <div className="text-[9.5px] font-bold text-sub mt-0.5">
            {isReportAr ? 'شفت 7 أكتوبر (أعلى أداء)' : 'Oct 7 (Top Output)'}
          </div>
        </div>

        <div className="p-3 bg-bg border border-line rounded-xl print:border-slate-300 print:bg-slate-50/70">
          <div className="flex items-center justify-between text-sub mb-1">
            <span className="text-[10px] font-bold">{isReportAr ? 'معدل الإنتاجية' : 'Shift Velocity'}</span>
            <Activity className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-ink tracking-tight">~35</div>
          <div className="text-[9.5px] font-bold text-sub mt-0.5">
            {isReportAr ? 'تذكرة لكل شفت فعلي' : 'Tickets / Active Shift'}
          </div>
        </div>

        <div className="p-3 bg-bg border border-line rounded-xl print:border-slate-300 print:bg-slate-50/70">
          <div className="flex items-center justify-between text-sub mb-1">
            <span className="text-[10px] font-bold">{isReportAr ? 'الساعات المعتمدة' : 'Total Field Hours'}</span>
            <Clock className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-ink tracking-tight">91 – 113</div>
          <div className="text-[9.5px] font-bold text-sub mt-0.5">
            {isReportAr ? 'ساعات دوام موثقة' : 'Certified Work Hours'}
          </div>
        </div>
      </div>

      {/* ── 2. Vector SVG Bar & Curve Chart: Daily Velocity ─────────── */}
      <div className="p-4 bg-bg border border-line rounded-xl print:border-slate-300 print:bg-slate-50/40 text-start space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-xs font-black text-ink">
              {isReportAr
                ? 'مخطط تصاعد الإنتاجية الميدانية عبر الشفتات (Daily Ticket Velocity Curve)'
                : 'Operational Velocity Progression Across Working Shifts'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-sub">
            {isReportAr ? 'تطور تدريجي من 19 إلى 57 تذكرة' : '19 → 57 Progression'}
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-44 sm:h-48 max-w-full"
            style={{ fontFeatureSettings: '"tnum"' }}
          >
            {/* Background horizontal grid lines */}
            {[0, 20, 40, 60].map((val) => {
              const y = chartHeight - 30 - (val / maxVal) * 120;
              return (
                <g key={val}>
                  <line
                    x1="20"
                    y1={y}
                    x2={chartWidth - 20}
                    y2={y}
                    stroke="#cbd5e1"
                    strokeDasharray="3 3"
                    strokeWidth="0.8"
                  />
                  <text
                    x={isReportAr ? chartWidth - 10 : 8}
                    y={y + 3}
                    textAnchor={isReportAr ? 'start' : 'end'}
                    fontSize="9"
                    fill="#94a3b8"
                    fontWeight="bold"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {dailyShifts.map((item, idx) => {
              const x = gap + idx * (barWidth + gap);
              const barH = (item.tickets / maxVal) * 120;
              const y = chartHeight - 30 - barH;
              const isPeak = item.tickets === 57;

              return (
                <g key={idx}>
                  {/* Bar Rectangle */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barH}
                    rx="6"
                    fill={isPeak ? '#0284c7' : '#334155'}
                    opacity={isPeak ? 1 : 0.85}
                  />

                  {/* Value on top of bar */}
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill={isPeak ? '#0284c7' : '#0f172a'}
                    fontWeight="900"
                  >
                    {item.tickets}
                  </text>

                  {/* Date label under bar */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - 12}
                    textAnchor="middle"
                    fontSize="8.5"
                    fill="#64748b"
                    fontWeight="bold"
                  >
                    {item.date}
                  </text>
                </g>
              );
            })}

            {/* Velocity Polyline Overlay */}
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 2"
              opacity="0.9"
            />
          </svg>
        </div>
      </div>

      {/* ── 3. Fault Category Distribution & Telemetry Systems ────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-start">
        {/* Left: Category Breakdown */}
        <div className="p-3.5 bg-bg border border-line rounded-xl print:border-slate-300 print:bg-slate-50/40 space-y-2.5">
          <div className="flex items-center gap-1.5 pb-1 border-b border-line/60">
            <PieChart className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-black text-ink">
              {isReportAr ? 'توزيع تصنيفات الأعطال الفنية:' : 'Technical Faults Distribution:'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-ink truncate max-w-[200px]">
                    {isReportAr ? cat.titleAr : cat.titleEn}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black text-ink">{cat.count}</span>
                    <span className="text-[10px] text-sub font-bold">({cat.percent})</span>
                  </div>
                </div>
                {/* Visual Progress Bar */}
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cat.colorBg} rounded-full`}
                    style={{ width: cat.percent }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Telemetry Systems Coverage */}
        <div className="p-3.5 bg-bg border border-line rounded-xl print:border-slate-300 print:bg-slate-50/40 space-y-2.5">
          <div className="flex items-center gap-1.5 pb-1 border-b border-line/60">
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-black text-ink">
              {isReportAr ? 'الأنظمة والأدوات التشغيلية المعتمدة:' : 'Operational Telemetry Tools:'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2 bg-card border border-line rounded-lg print:border-slate-300">
              <div className="font-black text-ink text-[11px] flex items-center justify-between">
                <span>Huawei NCE (Network Cloud Engine)</span>
                <span className="text-[9.5px] font-bold text-accent">100% Active</span>
              </div>
              <p className="text-[10px] text-sub font-medium mt-0.5">
                {isReportAr
                  ? 'قراءة إشارات RX الضوئية، فحص حالة ONT، وتكوين منافذ الخدمة'
                  : 'Optical RX telemetry analysis, ONT status audit, port provisioning'}
              </p>
            </div>

            <div className="p-2 bg-card border border-line rounded-lg print:border-slate-300">
              <div className="font-black text-ink text-[11px] flex items-center justify-between">
                <span>MOSS Operational Suite</span>
                <span className="text-[9.5px] font-bold text-accent">Diagnostic</span>
              </div>
              <p className="text-[10px] text-sub font-medium mt-0.5">
                {isReportAr
                  ? 'تحليل التقطيع المتكرر (Frequency Disconnection) وسجل انقطاعات الخدمة'
                  : 'Historical intermittent disconnection monitoring and pattern diagnosis'}
              </p>
            </div>

            <div className="p-2 bg-card border border-line rounded-lg print:border-slate-300">
              <div className="font-black text-ink text-[11px] flex items-center justify-between">
                <span>Auto Configuration Server (ACS)</span>
                <span className="text-[9.5px] font-bold text-accent">TR-069 Protocol</span>
              </div>
              <p className="text-[10px] text-sub font-medium mt-0.5">
                {isReportAr
                  ? 'التحقق من إعدادات المشترك والـ WAN profile ومزامنة الأجهزة عن بعد'
                  : 'Remote WAN profile provisioning, parameter sync and device orchestration'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
