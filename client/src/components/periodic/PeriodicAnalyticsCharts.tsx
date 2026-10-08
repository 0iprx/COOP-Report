import React from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  CheckCircle2,
  Zap,
  Activity,
  Layers,
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
  const timelineData = [
    { date: isReportAr ? '21/9' : 'Sep 21', tickets: 0, label: '0' },
    { date: isReportAr ? '22/9' : 'Sep 22', tickets: 0, label: '0' },
    { date: isReportAr ? '27/9' : 'Sep 27', tickets: 0, label: '0' },
    { date: isReportAr ? '28/9' : 'Sep 28', tickets: 19, label: '19' },
    { date: isReportAr ? '30/9' : 'Sep 30', tickets: 18, label: '18' },
    { date: isReportAr ? '1/10' : 'Oct 01', tickets: 33, label: '33' },
    { date: isReportAr ? '4/10' : 'Oct 04', tickets: 54, label: '54' },
    { date: isReportAr ? '5/10' : 'Oct 05', tickets: 40, label: '40' },
    { date: isReportAr ? '6/10' : 'Oct 06', tickets: 23, label: '23' },
    { date: isReportAr ? '7/10' : 'Oct 07', tickets: 57, label: isReportAr ? '57 (الذروة)' : '57 (Peak)' }
  ];

  // ── 2. Category Shares Data (Shares / Donut Chart) ───────────────────
  // Total = 244 tickets
  const shareCategories = [
    {
      nameAr: 'Link Down (انقطاع الاتصال)',
      nameEn: 'Link Down (Line Drop)',
      count: 65,
      percent: 26.6,
      color: '#0f766e', // Deep Teal
      bgClass: 'bg-teal-700'
    },
    {
      nameAr: 'Slowness (بطء الخدمة والتصفح)',
      nameEn: 'Slowness (Speed Degradation)',
      count: 58,
      percent: 23.8,
      color: '#0284c7', // Sky / Cyan
      bgClass: 'bg-sky-600'
    },
    {
      nameAr: 'Frequency Disconnections (تقطيع متكرر)',
      nameEn: 'Frequency Disconnections',
      count: 48,
      percent: 19.7,
      color: '#06b6d4', // Cyan
      bgClass: 'bg-cyan-500'
    },
    {
      nameAr: 'Port Blocked & CVLAN (حظر المنافذ)',
      nameEn: 'Port Blocked & CVLAN',
      count: 42,
      percent: 17.2,
      color: '#6366f1', // Indigo
      bgClass: 'bg-indigo-500'
    },
    {
      nameAr: 'Field Escalations (تصعيد فني للموقع)',
      nameEn: 'FOPS Field Dispatches',
      count: 31,
      percent: 12.7,
      color: '#10b981', // Emerald
      bgClass: 'bg-emerald-500'
    }
  ];

  // Donut circumference math (r = 54) -> 2 * PI * 54 = 339.29
  const donutCircumference = 339.29;
  let accumulatedPercent = 0;

  // ── 3. SVG Timeline Chart Coordinates ─────────────────────────────────
  const chartW = 560;
  const chartH = 160;
  const maxVal = 65;
  const padX = 35;
  const usableW = chartW - padX * 2;
  const usableH = 110;

  const points = timelineData.map((d, i) => {
    const x = padX + (i / (timelineData.length - 1)) * usableW;
    const y = chartH - 28 - (d.tickets / maxVal) * usableH;
    return { x, y, ...d };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPathStr = `M ${points[0].x},${chartH - 28} L ${points.map((p) => `${p.x},${p.y}`).join(' L ')} L ${points[points.length - 1].x},${chartH - 28} Z`;

  return (
    <div
      id="report-analytics-charts-section"
      className="my-6 p-5 sm:p-6 bg-white dark:bg-card border-2 border-line/90 rounded-2xl print:border print:border-slate-300 print:p-4 print:bg-white print:my-4 space-y-6 break-inside-avoid shadow-sm"
      dir={isReportAr ? 'rtl' : 'ltr'}
    >
      {/* ── Section Title & Badge ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-accent/40 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-accent text-white print:bg-slate-900 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-ink print:text-[13pt] flex items-center gap-2">
              <span>{isReportAr ? 'لوحة الرسوم البيانية والإحصائيات التشغيلية' : 'Operational Analytics & Visual Charts Dashboard'}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent-dim text-accent border border-accent/20 print:border-slate-300">
                FTTH Telemetry
              </span>
            </h3>
            <p className="text-[11px] text-sub font-bold">
              {isReportAr
                ? 'تحليل بياني متكامل للتطور الزمني، نسب الأعطال، ومؤشرات الأداء (20/9 إلى 7/10)'
                : 'Comprehensive visual analysis of operational progression, ticket shares, and telemetry'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-black px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            {isReportAr ? '244 تذكرة معالجة' : '244 Handled Tickets'}
          </span>
          <span className="text-[11px] font-black px-3 py-1 rounded-full bg-accent text-white">
            {isReportAr ? 'Shift B (الوردية المسائية)' : 'Shift B Operations'}
          </span>
        </div>
      </div>

      {/* ── 1. Top Executive Metric Cards (KPI Grid) ────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-start">
        <div className="p-3 bg-bg border border-line rounded-xl print:border-slate-300 print:bg-slate-50">
          <div className="flex items-center justify-between text-sub mb-1">
            <span className="text-[10px] font-bold">{isReportAr ? 'إجمالي التذاكر' : 'Total Tickets'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-ink">244</div>
          <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
            {isReportAr ? '✓ فحص وإغلاق مكتمل 100%' : '100% Verified Telemetry'}
          </div>
        </div>

        <div className="p-3 bg-bg border border-line rounded-xl print:border-slate-300 print:bg-slate-50">
          <div className="flex items-center justify-between text-sub mb-1">
            <span className="text-[10px] font-bold">{isReportAr ? 'ذروة الشفت (Peak)' : 'Peak Output'}</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-accent">57</div>
          <div className="text-[10px] font-bold text-sub mt-0.5">
            {isReportAr ? 'شفت 7 أكتوبر (أعلى أداء)' : 'Oct 7 Peak Velocity'}
          </div>
        </div>

        <div className="p-3 bg-bg border border-line rounded-xl print:border-slate-300 print:bg-slate-50">
          <div className="flex items-center justify-between text-sub mb-1">
            <span className="text-[10px] font-bold">{isReportAr ? 'متوسط السرعة' : 'Avg Velocity'}</span>
            <Activity className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-ink">34.9</div>
          <div className="text-[10px] font-bold text-sub mt-0.5">
            {isReportAr ? 'تذكرة / شفت فعلي' : 'Tickets / Active Shift'}
          </div>
        </div>

        <div className="p-3 bg-bg border border-line rounded-xl print:border-slate-300 print:bg-slate-50">
          <div className="flex items-center justify-between text-sub mb-1">
            <span className="text-[10px] font-bold">{isReportAr ? 'الساعات المعتمدة' : 'Total Field Hours'}</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-ink">91 – 113</div>
          <div className="text-[10px] font-bold text-sub mt-0.5">
            {isReportAr ? 'ساعات تدريب موثقة' : 'Certified Hours'}
          </div>
        </div>
      </div>

      {/* ── 2. Grid: Timeline (Developments over time) + Donut (Shares) ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-start">
        
        {/* Left (or Right in RTL): Developments Over Time Area & Line Chart */}
        <div className="lg:col-span-7 p-4 bg-bg border border-line rounded-xl print:border-slate-300 print:bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-line/60">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-xs font-black text-ink">
                {isReportAr ? '1. التطور الزمني وتصاعد الإنتاجية (Developments over time)' : '1. Operational Progression Over Time'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-accent">
              {isReportAr ? 'تصاعد مستمر 19 ⬅️ 57 تذكرة' : '19 → 57 Tickets Progression'}
            </span>
          </div>

          {/* SVG Area & Line Chart */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-44 sm:h-48 max-w-full"
              style={{ fontFeatureSettings: '"tnum"' }}
            >
              <defs>
                <linearGradient id="areaGradientTeal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 20, 40, 60].map((val) => {
                const y = chartH - 28 - (val / maxVal) * usableH;
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
                      x={isReportAr ? chartW - 28 : 12}
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

              {/* Area Fill */}
              <path d={areaPathStr} fill="url(#areaGradientTeal)" />

              {/* Trend Polyline */}
              <polyline
                points={polylineStr}
                fill="none"
                stroke="#0284c7"
                strokeWidth="3"
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
                      r={isPeak ? 5 : 3.5}
                      fill={isPeak ? '#0284c7' : '#0f766e'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Ticket count label above point */}
                    {p.tickets > 0 && (
                      <text
                        x={p.x}
                        y={p.y - 7}
                        textAnchor="middle"
                        fontSize={isPeak ? '9.5' : '8.5'}
                        fill={isPeak ? '#0284c7' : '#0f172a'}
                        fontWeight="900"
                      >
                        {p.tickets}
                      </text>
                    )}

                    {/* Date label at bottom */}
                    <text
                      x={p.x}
                      y={chartH - 10}
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
        </div>

        {/* Right (or Left in RTL): Shares Donut Chart & Legend */}
        <div className="lg:col-span-5 p-4 bg-bg border border-line rounded-xl print:border-slate-300 print:bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-line/60">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-accent" />
              <span className="text-xs font-black text-ink">
                {isReportAr ? '2. نسب وتوزيع الأعطال (Shares)' : '2. Category Breakdown & Shares'}
              </span>
            </div>
            <span className="text-[10px] font-bold text-sub">
              {isReportAr ? '100% من الحالات' : '100% Distribution'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
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
                <span className="text-xl font-black text-ink leading-none">244</span>
                <span className="text-[9px] font-bold text-sub mt-0.5">
                  {isReportAr ? 'تذكرة' : 'Tickets'}
                </span>
              </div>
            </div>

            {/* Legend & Breakdown Table */}
            <div className="flex-1 w-full space-y-1.5 text-xs">
              {shareCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10.5px]">
                  <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-bold text-ink truncate">
                      {isReportAr ? cat.nameAr.split('(')[0].trim() : cat.nameEn}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-bold">
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
        <div className="p-3.5 bg-bg border border-line rounded-xl print:border-slate-300 print:bg-slate-50/50 space-y-2.5">
          <div className="flex items-center gap-2 pb-1 border-b border-line/60">
            <Sliders className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-black text-ink">
              {isReportAr ? '3. المقارنات والقيم المطلقة (Absolute Values)' : '3. Comparative Handling Channels'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                <span className="text-ink">{isReportAr ? 'معالجة وإغلاق داخلي (Direct Handle)' : 'Direct Internal Handle'}</span>
                <span className="font-black text-emerald-600">213 تذكرة (87.3%)</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '87.3%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                <span className="text-ink">{isReportAr ? 'تصعيد لفريق العمليات الميدانية (FOPS)' : 'FOPS Field Escalation'}</span>
                <span className="font-black text-amber-600">31 تذكرة (12.7%)</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '12.7%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                <span className="text-ink">{isReportAr ? 'الالتزام باتفاقية مستوى الخدمة (SLA)' : 'SLA Target Compliance'}</span>
                <span className="font-black text-sky-600">96.8% دقة وسرعة</span>
              </div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '96.8%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Correlations: Systems Telemetry Audit */}
        <div className="p-3.5 bg-bg border border-line rounded-xl print:border-slate-300 print:bg-slate-50/50 space-y-2.5">
          <div className="flex items-center gap-2 pb-1 border-b border-line/60">
            <Radio className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-black text-ink">
              {isReportAr ? '4. مصفوفة الإشارة والأنظمة المعتمدة (Telemetry Matrix)' : '4. Telemetry & Systems Matrix'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-card border border-line rounded-lg print:border-slate-300">
              <div className="text-[10px] font-bold text-sub">Huawei NCE</div>
              <div className="text-sm font-black text-accent mt-0.5">-19 ~ -24 dBm</div>
              <div className="text-[9px] font-bold text-emerald-600">{isReportAr ? 'نطاق إشارة مثالي' : 'Ideal RX Power'}</div>
            </div>

            <div className="p-2 bg-card border border-line rounded-lg print:border-slate-300">
              <div className="text-[10px] font-bold text-sub">MOSS Suite</div>
              <div className="text-sm font-black text-ink mt-0.5">24/7 Monitor</div>
              <div className="text-[9px] font-bold text-sky-600">{isReportAr ? 'تتبع التقطيع' : 'Trap Analytics'}</div>
            </div>

            <div className="p-2 bg-card border border-line rounded-lg print:border-slate-300">
              <div className="text-[10px] font-bold text-sub">ACS Provisioning</div>
              <div className="text-sm font-black text-ink mt-0.5">TR-069 Sync</div>
              <div className="text-[9px] font-bold text-indigo-600">{isReportAr ? 'مزامنة الـ VLAN' : 'Profile Sync'}</div>
            </div>
          </div>

          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between text-[11px] font-black text-emerald-700 dark:text-emerald-400">
            <span className="flex items-center gap-1.5">
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{isReportAr ? 'الجاهزية المهنية للعمل كموظف فعلي:' : 'Operational Readiness:'}</span>
            </span>
            <span>100% Certified FTTH Support</span>
          </div>
        </div>

      </div>

    </div>
  );
};
