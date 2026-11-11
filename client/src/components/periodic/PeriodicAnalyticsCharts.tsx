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
  period?: 'p1' | 'p2';
}

export const PeriodicAnalyticsCharts: React.FC<PeriodicAnalyticsChartsProps> = ({
  isReportAr = true,
  period = 'p1'
}) => {
  const isP2 = period === 'p2';

  // ── 1. Daily Tickets Timeline Data (Developments Over Time) ───────────
  const timelineDataP1 = [
    { date: isReportAr ? '28/9' : 'Sep 28', tickets: 19 },
    { date: isReportAr ? '30/9' : 'Sep 30', tickets: 18 },
    { date: isReportAr ? '1/10' : 'Oct 01', tickets: 33 },
    { date: isReportAr ? '4/10' : 'Oct 04', tickets: 54 },
    { date: isReportAr ? '5/10' : 'Oct 05', tickets: 40 },
    { date: isReportAr ? '6/10' : 'Oct 06', tickets: 23 },
    { date: isReportAr ? '7/10' : 'Oct 07', tickets: 57 }
  ];

  const timelineDataP2 = [
    { date: isReportAr ? '11/10' : 'Oct 11', tickets: 40 },
    { date: isReportAr ? '12/10' : 'Oct 12', tickets: 38 },
    { date: isReportAr ? '13/10' : 'Oct 13', tickets: 32 },
    { date: isReportAr ? '14/10' : 'Oct 14', tickets: 28 },
    { date: isReportAr ? '18/10' : 'Oct 18', tickets: 35 },
    { date: isReportAr ? '19/10' : 'Oct 19', tickets: 16 },
    { date: isReportAr ? '20/10' : 'Oct 20', tickets: 97 }, // Peak!
    { date: isReportAr ? '21/10' : 'Oct 21', tickets: 45 },
    { date: isReportAr ? '27/10' : 'Oct 27', tickets: 26 },
    { date: isReportAr ? '28/10' : 'Oct 28', tickets: 29 },
    { date: isReportAr ? '29/10' : 'Oct 29', tickets: 31 },
    { date: isReportAr ? '3/11' : 'Nov 03', tickets: 34 },
    { date: isReportAr ? '4/11' : 'Nov 04', tickets: 30 },
    { date: isReportAr ? '5/11' : 'Nov 05', tickets: 21 }
  ];

  const timelineData = isP2 ? timelineDataP2 : timelineDataP1;

  // ── 2. Category Shares Data (Shares / Donut Chart) ───────────────────
  const shareCategoriesP1 = [
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

  // Period 2 Categories based directly on real operational tool snapshots
  const shareCategoriesP2 = [
    {
      nameAr: 'CCS (نظام خدمة العملاء والدعم المركزي)',
      nameEn: 'CCS (Customer Care Support)',
      count: 176,
      percent: 36.5,
      color: '#0f766e' // Deep Teal
    },
    {
      nameAr: 'Call Centre (إحالات وتنسيق الكول سنتر)',
      nameEn: 'Call Centre Referrals',
      count: 117,
      percent: 24.3,
      color: '#0284c7' // Sky Blue
    },
    {
      nameAr: 'Open Access (النفاذ المفتوح والمشغلين)',
      nameEn: 'Open Access Operators',
      count: 70,
      percent: 14.5,
      color: '#06b6d4' // Cyan
    },
    {
      nameAr: 'Resolved Direct (معالجة وإغلاق فوري)',
      nameEn: 'Resolved Direct Handling',
      count: 57,
      percent: 11.8,
      color: '#10b981' // Emerald
    },
    {
      nameAr: 'TLS (الدعم الفني التخصصي)',
      nameEn: 'TLS (Technical Level Support)',
      count: 31,
      percent: 6.4,
      color: '#6366f1' // Indigo
    },
    {
      nameAr: 'NOC & OSS (مركز العمليات والأنظمة)',
      nameEn: 'NOC & OSS Escalations',
      count: 31,
      percent: 6.5,
      color: '#f59e0b' // Amber
    }
  ];

  const shareCategories = isP2 ? shareCategoriesP2 : shareCategoriesP1;
  const totalTickets = isP2 ? 482 : 244;
  const peakTickets = isP2 ? 97 : 57;
  const peakLabel = isP2
    ? (isReportAr ? 'ذروة الأداء المسجلة (20 أكتوبر)' : 'Oct 20 Record Peak')
    : (isReportAr ? 'ذروة الأداء المسجلة (7 أكتوبر)' : 'Oct 7 Peak Velocity');
  const avgVelocity = isP2 ? '34.4' : '34.9';
  const slaRate = isP2 ? '97.4%' : '96.8%';

  // Donut circumference math (r = 54) -> 2 * PI * 54 = 339.29
  const donutCircumference = 339.29;
  let accumulatedPercent = 0;

  // ── 3. SVG Timeline Chart Coordinates ─────────────────────────────────
  const chartW = 560;
  const chartH = 180;
  const maxVal = isP2 ? 105 : 65;
  const padX = 35;
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
                  ? (isP2
                      ? 'لوحة الرسوم البيانية والإحصائيات التشغيلية (FTTH & Transport)'
                      : 'لوحة الرسوم البيانية والإحصائيات التشغيلية')
                  : (isP2
                      ? 'Operational Analytics & Performance Dashboard (FTTH & Transport)'
                      : 'Operational Analytics & Performance Dashboard')}
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-sub font-bold mt-0.5">
              {isReportAr
                ? (isP2
                    ? 'تحليل بياني متكامل لأداء المعالجة، تصنيف التذاكر، وأنظمة التراسل (من 11/10 إلى 5/11)'
                    : 'تحليل بياني متكامل للتطور الزمني، نسب الأعطال، ومؤشرات الأداء التشغيلي (من 20/9 إلى 7/10)')
                : (isP2
                    ? 'Comprehensive visual telemetry of operations, ticket classification & transport links (Oct 11 – Nov 05)'
                    : 'Comprehensive visual analysis of operational progression, ticket shares, and telemetry (Sep 20 – Oct 07)')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <span className="text-[11px] font-black px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            {isReportAr ? `${totalTickets} تذكرة معالجة ومكتملة` : `${totalTickets} Verified Tickets`}
          </span>
          <span className="text-[11px] font-black px-3 py-1 rounded-full bg-accent text-white">
            {isReportAr
              ? (isP2 ? 'عمليات FTTH وشبكات النقل التراسلي' : 'عمليات الألياف الضوئية FTTH')
              : (isP2 ? 'FTTH & Transport Networks' : 'FTTH Operations')}
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
          <div className="text-2xl sm:text-3xl font-black text-ink leading-tight">{totalTickets}</div>
          <div className="text-[10px] font-bold text-emerald-600 mt-1">
            {isReportAr ? '✓ فحص وتوثيق مكتمل 100%' : '100% Closed & Verified'}
          </div>
        </div>

        <div className="p-3.5 bg-bg/70 dark:bg-slate-800/40 border border-line rounded-xl print:border-slate-300 print:bg-slate-50/70 shadow-2xs">
          <div className="flex items-center justify-between text-sub mb-1.5">
            <span className="text-[11px] font-bold">{isReportAr ? 'ذروة الإنتاجية (Peak)' : 'Peak Output'}</span>
            <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-accent leading-tight">{peakTickets}</div>
          <div className="text-[10px] font-bold text-sub mt-1">{peakLabel}</div>
        </div>

        <div className="p-3.5 bg-bg/70 dark:bg-slate-800/40 border border-line rounded-xl print:border-slate-300 print:bg-slate-50/70 shadow-2xs">
          <div className="flex items-center justify-between text-sub mb-1.5">
            <span className="text-[11px] font-bold">{isReportAr ? 'متوسط الإنجاز' : 'Avg Velocity'}</span>
            <Activity className="w-4 h-4 text-sky-500 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink leading-tight">{avgVelocity}</div>
          <div className="text-[10px] font-bold text-sub mt-1">
            {isReportAr ? 'تذكرة / مرحلة تشغيلية' : 'Tickets / Active Cycle'}
          </div>
        </div>

        <div className="p-3.5 bg-bg/70 dark:bg-slate-800/40 border border-line rounded-xl print:border-slate-300 print:bg-slate-50/70 shadow-2xs">
          <div className="flex items-center justify-between text-sub mb-1.5">
            <span className="text-[11px] font-bold">{isReportAr ? 'جودة الالتزام (SLA)' : 'SLA Compliance'}</span>
            <CheckCheck className="w-4 h-4 text-purple-500 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink leading-tight">{slaRate}</div>
          <div className="text-[10px] font-bold text-sub mt-1">
            {isReportAr ? 'دقة التشخيص والتصعيد' : 'Diagnostic Accuracy'}
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
              {isReportAr
                ? (isP2 ? `ذروة الإنجاز: ${peakTickets} تذكرة` : 'تصاعد مستمر: 19 ⬅ 57 تذكرة')
                : (isP2 ? `Peak Output: ${peakTickets} Tickets` : '19 → 57 Tickets')}
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
                <linearGradient id={isP2 ? 'areaGradientTealP2' : 'areaGradientTealNew'} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity="0.04" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {(isP2 ? [0, 25, 50, 75, 100] : [0, 20, 40, 60]).map((val) => {
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
                      x={isReportAr ? chartW - 22 : 14}
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
              <path d={areaPathStr} fill={`url(#${isP2 ? 'areaGradientTealP2' : 'areaGradientTealNew'})`} />

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
                const isPeak = p.tickets === peakTickets;
                return (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isPeak ? 5.5 : 3.8}
                      fill={isPeak ? '#0284c7' : '#0f766e'}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />

                    {/* Ticket count label above point */}
                    <text
                      x={p.x}
                      y={p.y - 8}
                      textAnchor="middle"
                      fontSize={isPeak ? '10' : '8.5'}
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
                      fontSize="8"
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
              ? (isP2
                  ? '* تشمل البيانات توثيق التذاكر المنجزة في FTTH ومهام شبكات النقل والتراسل للفترة المحددة.'
                  : '* يعكس المنحنى تطور الإنتاجية التصاعدي عبر مراحل التقييم المعتمدة في قسم FTTH.')
              : (isP2
                  ? '* Telemetry includes documented FTTH ticket volumes and Transport operational tasks.'
                  : '* Curve reflects operational throughput progression across verified FTTH stages.')}
          </div>
        </div>

        {/* Right/Left: Shares Donut Chart & Full Legend */}
        <div className="lg:col-span-5 p-4 sm:p-5 bg-bg/70 dark:bg-slate-800/40 border border-line rounded-xl print:border-slate-300 print:bg-slate-50/70 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-line/60">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-accent" />
              <span className="text-xs sm:text-sm font-black text-ink">
                {isReportAr ? '2. نسب وتوزيع الأعطال والتذاكر (Shares)' : '2. Category Breakdown & Shares'}
              </span>
            </div>
            <span className="text-[10.5px] font-bold text-sub">
              {isReportAr ? `إجمالي ${totalTickets} تذكرة` : '100% of Cases'}
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
                <span className="text-2xl font-black text-ink leading-none">{totalTickets}</span>
                <span className="text-[10px] font-bold text-sub mt-1">
                  {isReportAr ? 'تذكرة' : 'Tickets'}
                </span>
              </div>
            </div>

            {/* Legend & Breakdown Table: NO TRUNCATE! */}
            <div className="flex-1 w-full space-y-1.5 text-xs">
              {shareCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10.5px] gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-bold text-ink leading-tight truncate">
                      {isReportAr ? cat.nameAr.split('(')[0].trim() : cat.nameEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 font-bold">
                    <span className="text-ink font-black">{cat.count}</span>
                    <span className="text-sub text-[9.5px]">({cat.percent}%)</span>
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
                  {isP2
                    ? (isReportAr ? '398 تذكرة (82.6%)' : '398 Tickets (82.6%)')
                    : (isReportAr ? '213 تذكرة (87.3%)' : '213 Tickets (87.3%)')}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: isP2 ? '82.6%' : '87.3%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                <span className="text-ink">
                  {isReportAr
                    ? (isP2 ? 'إحالات المشغلين وتصعيد FOPS' : 'تصعيد لفريق العمليات الميدانية (FOPS)')
                    : (isP2 ? 'Operator Escalations & FOPS' : 'FOPS Field Escalation')}
                </span>
                <span className="font-black text-amber-600">
                  {isP2
                    ? (isReportAr ? '84 تذكرة (17.4%)' : '84 Tickets (17.4%)')
                    : (isReportAr ? '31 تذكرة (12.7%)' : '31 Tickets (12.7%)')}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: isP2 ? '17.4%' : '12.7%' }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                <span className="text-ink">
                  {isReportAr ? 'الالتزام باتفاقية مستوى الخدمة (SLA Compliance)' : 'SLA Target Compliance'}
                </span>
                <span className="font-black text-sky-600">
                  {isP2
                    ? (isReportAr ? '97.4% دقة وجودة إنجاز' : '97.4% Target Met')
                    : (isReportAr ? '96.8% دقة وجودة إنجاز' : '96.8% Target Met')}
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full"
                  style={{ width: isP2 ? '97.4%' : '96.8%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Correlations: Systems Telemetry Audit */}
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
            {/* Box 1: Huawei NCE */}
            <div className="p-2.5 bg-card border border-line rounded-lg print:border-slate-300">
              <div className="text-[10px] font-bold text-sub">Huawei NCE</div>
              <div className="text-sm font-black text-accent mt-0.5" dir="ltr">-10 ~ -26 dBm</div>
              <div className="text-[9.5px] font-bold text-emerald-600 mt-0.5">
                {isReportAr ? 'نطاق الإشارة المعتمد' : 'Standard RX Range'}
              </div>
            </div>

            {/* Box 2: Transport / MOSS */}
            <div className="p-2.5 bg-card border border-line rounded-lg print:border-slate-300">
              <div className="text-[10px] font-bold text-sub">
                {isP2 ? 'Transport Core' : 'MOSS Suite'}
              </div>
              <div className="text-sm font-black text-ink mt-0.5">
                {isP2 ? 'OTN / DWDM' : '24/7 Monitor'}
              </div>
              <div className="text-[9.5px] font-bold text-sky-600 mt-0.5">
                {isReportAr
                  ? (isP2 ? 'استقرار مسارات النقل' : 'استقراء التقطيع')
                  : (isP2 ? 'Backhaul Sync' : 'Flapping Traps')}
              </div>
            </div>

            {/* Box 3: ACS / Management */}
            <div className="p-2.5 bg-card border border-line rounded-lg print:border-slate-300">
              <div className="text-[10px] font-bold text-sub">ACS & Operations</div>
              <div className="text-sm font-black text-ink mt-0.5">TR-069 Sync</div>
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
            <span>
              {isP2
                ? '100% Certified FTTH & Transport Operations'
                : '100% Certified FTTH Support'}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
