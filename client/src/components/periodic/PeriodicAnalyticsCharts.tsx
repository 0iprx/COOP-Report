import React from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  CheckCircle2,
  Zap,
  Activity,
  Clock,
  Radio,
  Sliders,
  CheckCheck
} from 'lucide-react';

interface PeriodicAnalyticsChartsProps {
  isReportAr?: boolean;
}

export const PeriodicAnalyticsCharts: React.FC<PeriodicAnalyticsChartsProps> = ({ isReportAr = true }) => {
  // ── 1. Daily Tickets Timeline Data (Developments Over Time) ───────────
  // Active shift days showing the dramatic rising trajectory
  const timelineData = [
    { date: isReportAr ? '28/9' : 'Sep 28', tickets: 19 },
    { date: isReportAr ? '30/9' : 'Sep 30', tickets: 18 },
    { date: isReportAr ? '1/10' : 'Oct 01', tickets: 33 },
    { date: isReportAr ? '4/10' : 'Oct 04', tickets: 54 },
    { date: isReportAr ? '5/10' : 'Oct 05', tickets: 40 },
    { date: isReportAr ? '6/10' : 'Oct 06', tickets: 23 },
    { date: isReportAr ? '7/10' : 'Oct 07', tickets: 57 }
  ];

  // ── 2. Category Shares Data (Shares / Donut Chart) ───────────────────
  // Total = 244 tickets
  const shareCategories = [
    {
      nameAr: 'Link Down (انقطاع الاتصال)',
      nameEn: 'Link Down (Line Drop)',
      count: 65,
      percent: 26.6,
      color: '#0f766e' // Deep Teal
    },
    {
      nameAr: 'Slowness (بطء الخدمة والتصفح)',
      nameEn: 'Slowness (Speed Drop)',
      count: 58,
      percent: 23.8,
      color: '#0284c7' // Sky
    },
    {
      nameAr: 'Frequency Drops (تقطيع متكرر)',
      nameEn: 'Frequency Disconnections',
      count: 48,
      percent: 19.7,
      color: '#06b6d4' // Cyan
    },
    {
      nameAr: 'Port Blocked & CVLAN (حظر المنافذ)',
      nameEn: 'Port Blocked & CVLAN',
      count: 42,
      percent: 17.2,
      color: '#6366f1' // Indigo
    },
    {
      nameAr: 'Field Escalations (تصعيد فني للموقع)',
      nameEn: 'FOPS Field Dispatches',
      count: 31,
      percent: 12.7,
      color: '#10b981' // Emerald
    }
  ];

  // Donut circumference math (r = 54) -> 2 * PI * 54 = 339.29
  const donutCircumference = 339.29;
  let accumulatedPercent = 0;

  // ── 3. SVG Timeline Chart Coordinates ─────────────────────────────────
  const chartW = 560;
  const chartH = 180;
  const maxVal = 65;
  const padX = 40;
  const usableW = chartW - padX * 2;
  const usableH = 120;

  const points = timelineData.map((d, i) => {
    const x = padX + (i / (timelineData.length - 1)) * usableW;
    const y = chartH - 30 - (d.tickets / maxVal) * usableH;
    return { x, y, ...d };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPathStr = `M ${points[0].x},${chartH - 30} L ${points.map((p) => `${p.x},${p.y}`).join(' L ')} L ${points[points.length - 1].x},${chartH - 30} Z`;

  return (
    <div
      id="report-analytics-charts-section"
      className="w-full my-4 p-5 sm:p-6 bg-white dark:bg-card border border-line rounded-2xl print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none print:bg-transparent space-y-5 print:space-y-4"
      dir={isReportAr ? 'rtl' : 'ltr'}
    >
      {/* ── Section Title & Badge ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b-2 border-accent/40 gap-3">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-accent text-white print:bg-slate-900 shrink-0 shadow-xs">
            <BarChart3 className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-ink print:text-[13pt] flex items-center gap-2">
              <span>
                {isReportAr
                  ? '18. لوحة الرسوم البيانية والإحصائيات التشغيلية'
                  : '18. Operational Analytics & Performance Dashboard'}
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-sub font-bold mt-0.5">
              {isReportAr
                ? 'تحليل بياني متكامل للتطور الزمني، نسب الأعطال، ومؤشرات الأداء التشغيلي (20/9 إلى 7/10)'
                : 'Comprehensive visual analysis of operational progression, ticket shares, and telemetry'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <span className="text-[11px] font-black px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            {isReportAr ? '244 تذكرة معالجة ومكتملة' : '244 Verified Tickets'}
          </span>
          <span className="text-[11px] font-black px-3 py-1 rounded-full bg-accent text-white">
            {isReportAr ? 'Shift B • 91 - 113 ساعة معتمدة' : 'Shift B • 91–113 Certified Hours'}
          </span>
        </div>
      </div>

      {/* ── 1. Top Executive Metric Cards (KPI Grid) ────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-start">
        <div className="p-3.5 bg-bg/70 dark:bg-slate-800/40 border border-line rounded-xl print:border-slate-300 print:bg-slate-50/70 shadow-2xs">
          <div className="flex items-center justify-between text-sub mb-1.5">
            <span className="text-[11px] font-bold">{isReportAr ? 'إجمالي التذاكر' : 'Total Tickets'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink leading-tight">244</div>
          <div className="text-[10px] font-bold text-emerald-600 mt-1">
            {isReportAr ? '✓ فحص وتوثيق مكتمل 100%' : '100% Closed & Verified'}
          </div>
        </div>

        <div className="p-3.5 bg-bg/70 dark:bg-slate-800/40 border border-line rounded-xl print:border-slate-300 print:bg-slate-50/70 shadow-2xs">
          <div className="flex items-center justify-between text-sub mb-1.5">
            <span className="text-[11px] font-bold">{isReportAr ? 'ذروة الشفت (Peak)' : 'Peak Output'}</span>
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-accent leading-tight">57</div>
          <div className="text-[10px] font-bold text-sub mt-1">
            {isReportAr ? 'شفت 7 أكتوبر (أعلى أداء)' : 'Oct 7 Peak Velocity'}
          </div>
        </div>

        <div className="p-3.5 bg-bg/70 dark:bg-slate-800/40 border border-line rounded-xl print:border-slate-300 print:bg-slate-50/70 shadow-2xs">
          <div className="flex items-center justify-between text-sub mb-1.5">
            <span className="text-[11px] font-bold">{isReportAr ? 'متوسط السرعة' : 'Avg Velocity'}</span>
            <Activity className="w-4 h-4 text-sky-500 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink leading-tight">34.9</div>
          <div className="text-[10px] font-bold text-sub mt-1">
            {isReportAr ? 'تذكرة / شفت فعلي' : 'Tickets / Active Shift'}
          </div>
        </div>

        <div className="p-3.5 bg-bg/70 dark:bg-slate-800/40 border border-line rounded-xl print:border-slate-300 print:bg-slate-50/70 shadow-2xs">
          <div className="flex items-center justify-between text-sub mb-1.5">
            <span className="text-[11px] font-bold">{isReportAr ? 'الساعات الميدانية' : 'Field Hours'}</span>
            <Clock className="w-4 h-4 text-purple-500 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink leading-tight">91 – 113</div>
          <div className="text-[10px] font-bold text-sub mt-1">
            {isReportAr ? 'ساعات تدريب معتمدة' : 'Certified Hours'}
          </div>
        </div>
      </div>

      {/* ── 2. Middle Row: Progression Over Time + Donut Shares ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 text-start items-stretch">
        
        {/* Left/Right: Timeline Area & Line Chart */}
        <div className="lg:col-span-7 p-4 sm:p-5 bg-bg/70 dark:bg-slate-800/40 border border-line rounded-xl print:border-slate-300 print:bg-slate-50/70 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-line/60">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-xs sm:text-sm font-black text-ink">
                {isReportAr
                  ? '1. التطور الزمني وتصاعد الإنتاجية (Progression Over Time)'
                  : '1. Operational Progression Over Time'}
              </span>
            </div>
            <span className="text-[10.5px] font-black text-accent bg-accent-dim/60 px-2 py-0.5 rounded-md border border-accent/20">
              {isReportAr ? 'تصاعد مستمر: 19 ⬅ 57 تذكرة' : '19 → 57 Tickets'}
            </span>
          </div>

          {/* SVG Area & Line Chart */}
          <div className="w-full my-auto overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-48 sm:h-52 max-w-full"
              style={{ fontFeatureSettings: '"tnum"' }}
            >
              <defs>
                <linearGradient id="areaGradientTealNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity="0.04" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 20, 40, 60].map((val) => {
                const y = chartH - 30 - (val / maxVal) * usableH;
                return (
                  <g key={val}>
                    <line
                      x1={padX}
                      y1={y}
                      x2={chartW - padX}
                      y2={y}
                      stroke="#cbd5e1"
                      strokeDasharray="3 3"
                      strokeWidth="0.8"
                    />
                    <text
                      x={isReportAr ? chartW - 25 : 16}
                      y={y + 3.5}
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

              {/* Area Fill */}
              <path d={areaPathStr} fill="url(#areaGradientTealNew)" />

              {/* Trend Polyline */}
              <polyline
                points={polylineStr}
                fill="none"
                stroke="#0284c7"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points & Numbers */}
              {points.map((p, idx) => {
                const isPeak = p.tickets === 57;
                return (
                  <g key={idx}>
                    {/* Node Circle */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isPeak ? 5.5 : 4}
                      fill={isPeak ? '#0284c7' : '#0f766e'}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />

                    {/* Ticket count label above point */}
                    <text
                      x={p.x}
                      y={p.y - 8}
                      textAnchor="middle"
                      fontSize={isPeak ? '10' : '9'}
                      fill={isPeak ? '#0284c7' : '#0f172a'}
                      fontWeight="900"
                    >
                      {p.tickets} {isPeak ? (isReportAr ? '(الذروة)' : '(Peak)') : ''}
                    </text>

                    {/* Date label at bottom */}
                    <text
                      x={p.x}
                      y={chartH - 12}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#64748b"
                      fontWeight="bold"
                    >
                      {p.date}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="text-[10px] text-sub font-bold border-t border-line/50 pt-1.5 mt-1">
            {isReportAr
              ? '* الأيام 21-27/9 خُصصت للتهيئة وفحص الأنظمة قبل بدء الشفتات الإنتاجية المباشرة.'
              : '* Sep 21–27 dedicated to system induction & ONT telemetry before active shift handling.'}
          </div>
        </div>

        {/* Right/Left: Shares Donut Chart & Full Legend */}
        <div className="lg:col-span-5 p-4 sm:p-5 bg-bg/70 dark:bg-slate-800/40 border border-line rounded-xl print:border-slate-300 print:bg-slate-50/70 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-line/60">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-accent" />
              <span className="text-xs sm:text-sm font-black text-ink">
                {isReportAr ? '2. نسب وتوزيع الأعطال (Category Shares)' : '2. Category Breakdown & Shares'}
              </span>
            </div>
            <span className="text-[10.5px] font-bold text-sub">
              {isReportAr ? 'إجمالي 244 تذكرة' : '100% of Cases'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 my-auto">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 140 140" className="w-full h-full transform -rotate-90">
                {shareCategories.map((cat, idx) => {
                  const strokeLength = (cat.percent / 100) * donutCircumference;
                  const dashOffset = -((accumulatedPercent / 100) * donutCircumference);
                  accumulatedPercent += cat.percent;

                  return (
                    <circle
                      key={idx}
                      cx="70"
                      cy="70"
                      r="54"
                      fill="transparent"
                      stroke={cat.color}
                      strokeWidth="20"
                      strokeDasharray={`${strokeLength} ${donutCircumference - strokeLength}`}
                      strokeDashoffset={dashOffset}
                      className="transition-all"
                    />
                  );
                })}
              </svg>
              {/* Donut Center Metric */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-black text-ink leading-none">244</span>
                <span className="text-[10px] font-bold text-sub mt-1">
                  {isReportAr ? 'تذكرة' : 'Tickets'}
                </span>
              </div>
            </div>

            {/* Legend & Breakdown Table: NO TRUNCATE! */}
            <div className="flex-1 w-full space-y-2 text-xs">
              {shareCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-bold text-ink leading-tight">
                      {isReportAr ? cat.nameAr : cat.nameEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-bold">
                    <span className="text-ink font-black">{cat.count}</span>
                    <span className="text-sub text-[10px]">({cat.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── 3. Bottom Row: Absolute Values & Telemetry System Correlations ─ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-start">
        
        {/* Absolute Values: Comparative Resolution Channels */}
        <div className="p-4 bg-bg/70 dark:bg-slate-800/40 border border-line rounded-xl print:border-slate-300 print:bg-slate-50/70 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 pb-1.5 border-b border-line/60">
            <Sliders className="w-4 h-4 text-accent" />
            <span className="text-xs sm:text-sm font-black text-ink">
              {isReportAr
                ? '3. قنوات المعالجة والقيم المطلقة (Comparative Channels)'
                : '3. Comparative Handling Channels'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                <span className="text-ink">
                  {isReportAr ? 'معالجة وإغلاق داخلي (Direct Handle)' : 'Direct Internal Handle'}
                </span>
                <span className="font-black text-emerald-600">
                  {isReportAr ? '213 تذكرة (87.3%)' : '213 Tickets (87.3%)'}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '87.3%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                <span className="text-ink">
                  {isReportAr ? 'تصعيد لفريق العمليات الميدانية (FOPS)' : 'FOPS Field Escalation'}
                </span>
                <span className="font-black text-amber-600">
                  {isReportAr ? '31 تذكرة (12.7%)' : '31 Tickets (12.7%)'}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '12.7%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                <span className="text-ink">
                  {isReportAr ? 'الالتزام باتفاقية مستوى الخدمة (SLA Compliance)' : 'SLA Target Compliance'}
                </span>
                <span className="font-black text-sky-600">
                  {isReportAr ? '96.8% دقة وجودة إنجاز' : '96.8% Target Met'}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '96.8%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Correlations: Systems Telemetry Audit - FIXED TO -10 to -26 dBm! */}
        <div className="p-4 bg-bg/70 dark:bg-slate-800/40 border border-line rounded-xl print:border-slate-300 print:bg-slate-50/70 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 pb-1.5 border-b border-line/60">
            <Radio className="w-4 h-4 text-accent" />
            <span className="text-xs sm:text-sm font-black text-ink">
              {isReportAr
                ? '4. مصفوفة الإشارة والأنظمة المعتمدة (Telemetry Matrix)'
                : '4. Telemetry & Systems Matrix'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
            {/* Box 1: Huawei NCE - CORRECTED RANGE */}
            <div className="p-2.5 bg-card border border-line rounded-lg print:border-slate-300">
              <div className="text-[10px] font-bold text-sub">Huawei NCE</div>
              <div className="text-sm font-black text-accent mt-0.5" dir="ltr">-10 ~ -26 dBm</div>
              <div className="text-[9.5px] font-bold text-emerald-600 mt-0.5">
                {isReportAr ? 'نطاق الإشارة المعتمد' : 'Standard RX Range'}
              </div>
            </div>

            {/* Box 2: MOSS Suite */}
            <div className="p-2.5 bg-card border border-line rounded-lg print:border-slate-300">
              <div className="text-[10px] font-bold text-sub">MOSS Suite</div>
              <div className="text-sm font-black text-ink mt-0.5">24/7 Monitor</div>
              <div className="text-[9.5px] font-bold text-sky-600 mt-0.5">
                {isReportAr ? 'استقراء التقطيع' : 'Flapping Traps'}
              </div>
            </div>

            {/* Box 3: ACS Provisioning */}
            <div className="p-2.5 bg-card border border-line rounded-lg print:border-slate-300">
              <div className="text-[10px] font-bold text-sub">ACS TR-069</div>
              <div className="text-sm font-black text-ink mt-0.5">Auto Provision</div>
              <div className="text-[9.5px] font-bold text-indigo-600 mt-0.5">
                {isReportAr ? 'مزامنة الـ VLANs' : 'Profile Sync'}
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between text-[11px] font-black text-emerald-700 dark:text-emerald-400">
            <span className="flex items-center gap-1.5">
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{isReportAr ? 'الجاهزية التشغيلية للعمل كموظف فعلي:' : 'Operational Readiness:'}</span>
            </span>
            <span>100% Certified FTTH Support</span>
          </div>
        </div>

      </div>

    </div>
  );
};
