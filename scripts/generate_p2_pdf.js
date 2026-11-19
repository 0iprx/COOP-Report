import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Read student profile from backup JSON if present
const backupPath = 'C:\\Users\\0iprx\\Downloads\\نسخة_احتياطية_شاملة_عبدالله هلال غازي المطيري .json';
let profile = {
  studentName: 'عبدالله هلال غازي المطيري',
  trainingNumber: '444314701',
  department: 'إدارة أنظمة شبكات الحاسب',
  trainingUnit: 'كلية الاتصالات والمعلومات بالرياض',
  supervisorName: 'محمد الدايل',
  responsibleName: 'همام كوشك',
  entityAddress: 'هواوي السعودية الرياض',
  companyLogo: ''
};

if (fs.existsSync(backupPath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    if (raw.profile) {
      profile = { ...profile, ...raw.profile };
    }
  } catch {
    console.warn('Could not parse backup profile, using defaults');
  }
}

// Read generated technical plates as base64 data URIs for self-contained PDF embedding
const devicesImgPath = path.resolve(process.cwd(), 'client/public/images/transport/transport-devices-overview.png');
const cablesImgPath = path.resolve(process.cwd(), 'client/public/images/transport/fiber-cables-types.png');
const devicesDataUri = fs.existsSync(devicesImgPath)
  ? `data:image/png;base64,${fs.readFileSync(devicesImgPath).toString('base64')}`
  : '';
const cablesDataUri = fs.existsSync(cablesImgPath)
  ? `data:image/png;base64,${fs.readFileSync(cablesImgPath).toString('base64')}`
  : '';

// Weekly FTTH tickets across Period 2 (452 FTTH total; Transport Weeks 9-11 = 0 tickets — Training & Observation Only)
const weeklyTimelineAr = [
  { label: 'أ7 (FTTH)', tickets: 138 },
  { label: 'أ8 (FTTH)', tickets: 193 },
  { label: 'أ9 (29/10 FTTH)', tickets: 31 },
  { label: 'أ10 (نقل: 0)', tickets: 0 },
  { label: 'أ11 (نقل: 0)', tickets: 0 },
  { label: 'أ12 (FTTH)', tickets: 90 }
];
const weeklyTimelineEn = [
  { label: 'W7 (FTTH)', tickets: 138 },
  { label: 'W8 (FTTH)', tickets: 193 },
  { label: 'W9 (FTTH 29/10)', tickets: 31 },
  { label: 'W10 (Trans: 0)', tickets: 0 },
  { label: 'W11 (Trans: 0)', tickets: 0 },
  { label: 'W12 (FTTH)', tickets: 90 }
];

const totalTickets = 452;
const chartW = 560;
const chartH = 180;
const maxVal = 215;
const padX = 35;
const usableW = chartW - padX * 2;
const usableH = 120;

const buildTimelineSvg = (data, isAr) => {
  const pts = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * usableW,
    y: chartH - 30 - (d.tickets / maxVal) * usableH,
    ...d
  }));
  const poly = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `M ${pts[0].x},${chartH - 30} L ${pts.map((p) => `${p.x},${p.y}`).join(' L ')} L ${pts[pts.length - 1].x},${chartH - 30} Z`;
  const grid = [0, 50, 100, 150, 200]
    .map((val) => {
      const y = chartH - 30 - (val / maxVal) * usableH;
      return `<line x1="${padX}" y1="${y}" x2="${chartW - padX}" y2="${y}" stroke="#CBD5E1" stroke-dasharray="3 3" stroke-width="0.8" />
        <text x="${isAr ? chartW - 22 : 14}" y="${y + 3.5}" text-anchor="${isAr ? 'start' : 'end'}" font-size="9" fill="#94A3B8" font-weight="bold">${val}</text>`;
    })
    .join('\n');
  const markers = pts
    .map((p) => {
      const isPeak = p.tickets === 193;
      const peakText = isPeak ? (isAr ? ' (ذروة 97/يوم)' : ' (97/d Peak)') : '';
      return `<g>
        <circle cx="${p.x}" cy="${p.y}" r="${isPeak ? 5.5 : 3.6}" fill="${isPeak ? '#0284c7' : '#0f766e'}" stroke="#FFFFFF" stroke-width="2" />
        <text x="${p.x}" y="${p.y - 8}" text-anchor="middle" font-size="${isPeak ? '9.2' : '8.5'}" fill="${isPeak ? '#0284c7' : '#0F172A'}" font-weight="900">${p.tickets}${peakText}</text>
        <text x="${p.x}" y="${chartH - 12}" text-anchor="middle" font-size="8" fill="#64748B" font-weight="bold">${p.label}</text>
      </g>`;
    })
    .join('\n');

  return `<svg viewBox="0 0 ${chartW} ${chartH}" style="width: 100%; height: 175px;" dir="ltr">
    <defs>
      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0284c7" stop-opacity="0.38" />
        <stop offset="100%" stop-color="#0f766e" stop-opacity="0.04" />
      </linearGradient>
    </defs>
    ${grid}
    <path d="${area}" fill="url(#areaGrad)" />
    <polyline points="${poly}" fill="none" stroke="#0284c7" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
    ${markers}
  </svg>`;
};

const shareCategoriesP2 = [
  { nameAr: 'CCS (خدمة العملاء والدعم)', nameEn: 'CCS (Customer Care)', count: 165, percent: 36.5, color: '#0f766e' },
  { nameAr: 'Call Centre (مركز الاتصال)', nameEn: 'Call Centre Referrals', count: 110, percent: 24.3, color: '#0284c7' },
  { nameAr: 'Open Access (النفاذ المفتوح)', nameEn: 'Open Access Operators', count: 66, percent: 14.6, color: '#06b6d4' },
  { nameAr: 'Resolved Direct (إغلاق فوري)', nameEn: 'Resolved Direct', count: 55, percent: 12.2, color: '#10b981' },
  { nameAr: 'TLS (الدعم الفني التخصصي)', nameEn: 'TLS Support', count: 29, percent: 6.4, color: '#6366f1' },
  { nameAr: 'NOC & OSS (العمليات والأنظمة)', nameEn: 'NOC & OSS', count: 27, percent: 6.0, color: '#f59e0b' }
];

const donutCircumference = 339.29;
let acc = 0;
const donutCircles = shareCategoriesP2
  .map((cat) => {
    const strokeLength = (cat.percent / 100) * donutCircumference;
    const dashOffset = -((acc / 100) * donutCircumference);
    acc += cat.percent;
    return `<circle cx="70" cy="70" r="54" fill="transparent" stroke="${cat.color}" stroke-width="20" stroke-dasharray="${strokeLength} ${donutCircumference - strokeLength}" stroke-dashoffset="${dashOffset}" />`;
  })
  .join('\n');

// Shared Architecture & Topology SVGs (Bilingual headings selectable via isAr)
const architectureSvgHtml = (isAr) => `
<figure class="diag-card">
  <figcaption class="diag-cap">
    <span>${isAr ? 'شكل (1): المعمارية الطبقية لشبكة النقل (DWDM / OTN / MPLS) ومسار عبور الإنترنت الدولي عبر SNFN' : 'Figure 1: Multi-Layer Transport Architecture (DWDM / OTN / MPLS) & International Transit Flow via SNFN'}</span>
    <span class="diag-badge">${isAr ? 'هندسة التراسل B2B والربط الدولي' : 'B2B Carrier Backbone & Global Transit'}</span>
  </figcaption>
  <svg viewBox="0 0 820 430" style="width:100%; height:auto; display:block;" dir="ltr">
    <defs>
      <marker id="arrowSlatePdf" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
      </marker>
      <marker id="arrowBluePdf" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
      </marker>
      <marker id="arrowTealPdf" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#0f766e" />
      </marker>
    </defs>
    <rect x="10" y="6" width="800" height="196" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
    <text x="410" y="24" text-anchor="middle" font-size="11.5" font-weight="900" fill="#0f172a">
      ${isAr ? '1. التكامل الطبقي: نقل حركة الشركات والإنترنت فوق DWDM و OTN و MPLS' : '1. Protocol Stack Encapsulation: IP/MPLS Over OTN & DWDM Optical Backbone'}
    </text>
    <rect x="24" y="34" width="772" height="46" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" />
    <text x="36" y="52" font-size="10.5" font-weight="900" fill="#1d4ed8">MPLS Layer (L2.5)</text>
    <text x="36" y="68" font-size="9.5" font-weight="700" fill="#334155">${isAr ? 'توجيه بالملصقات وعزل VRF لعملاء B2B' : 'Label Switching (LSP), VRF Isolation, FRR < 50ms'}</text>
    <rect x="295" y="42" width="110" height="30" rx="5" fill="#ffffff" stroke="#60a5fa" />
    <text x="350" y="60" text-anchor="middle" font-size="9.5" font-weight="800" fill="#0f172a">CE (Customer Edge)</text>
    <line x1="405" y1="57" x2="430" y2="57" stroke="#0284c7" stroke-width="1.8" marker-end="url(#arrowBluePdf)" />
    <rect x="434" y="42" width="128" height="30" rx="5" fill="#ffffff" stroke="#2563eb" />
    <text x="498" y="60" text-anchor="middle" font-size="9.5" font-weight="800" fill="#0f172a">PE (NE40E / ASR9K)</text>
    <line x1="562" y1="57" x2="587" y2="57" stroke="#0284c7" stroke-width="1.8" marker-end="url(#arrowBluePdf)" />
    <rect x="591" y="42" width="94" height="30" rx="5" fill="#ffffff" stroke="#60a5fa" />
    <text x="638" y="60" text-anchor="middle" font-size="9.5" font-weight="800" fill="#0f172a">P (Core Router)</text>
    <line x1="685" y1="57" x2="710" y2="57" stroke="#0284c7" stroke-width="1.8" marker-end="url(#arrowBluePdf)" />
    <rect x="714" y="42" width="70" height="30" rx="5" fill="#dbeafe" stroke="#2563eb" />
    <text x="749" y="60" text-anchor="middle" font-size="9.5" font-weight="900" fill="#1e3a8a">IGW / PE</text>

    <rect x="24" y="88" width="772" height="46" rx="8" fill="#f0fdfa" stroke="#0d9488" stroke-width="1.5" />
    <text x="36" y="106" font-size="10.5" font-weight="900" fill="#0f766e">OTN Wrapper (ITU-T G.709)</text>
    <text x="36" y="122" font-size="9.5" font-weight="700" fill="#334155">${isAr ? 'تغليف رقمي + تصحيح أخطاء FEC + مراقبة SLA' : 'Digital Envelope, FEC Error Correction & Path OAM'}</text>
    <rect x="295" y="96" width="110" height="30" rx="5" fill="#ffffff" stroke="#14b8a6" />
    <text x="350" y="114" text-anchor="middle" font-size="9.5" font-weight="800" fill="#0f172a">OPUk (Payload)</text>
    <line x1="405" y1="111" x2="430" y2="111" stroke="#0f766e" stroke-width="1.8" marker-end="url(#arrowTealPdf)" />
    <rect x="434" y="96" width="128" height="30" rx="5" fill="#ffffff" stroke="#0d9488" />
    <text x="498" y="114" text-anchor="middle" font-size="9.5" font-weight="800" fill="#0f172a">ODUk (Path / TCM)</text>
    <line x1="562" y1="111" x2="587" y2="111" stroke="#0f766e" stroke-width="1.8" marker-end="url(#arrowTealPdf)" />
    <rect x="591" y="96" width="193" height="30" rx="5" fill="#ccfbf1" stroke="#0f766e" />
    <text x="687" y="114" text-anchor="middle" font-size="9.5" font-weight="900" fill="#134e4a">OTUk + FEC + SNCP 1+1 (&lt;50ms)</text>

    <rect x="24" y="142" width="772" height="48" rx="8" fill="#fef2f2" stroke="#dc2626" stroke-width="1.5" />
    <text x="36" y="160" font-size="10.5" font-weight="900" fill="#b91c1c">DWDM Optical Layer (L0/L1)</text>
    <text x="36" y="176" font-size="9.5" font-weight="700" fill="#334155">${isAr ? 'تعدد أطوال موجية (40–120 قناة) على ليف واحد' : '40–120 Wavelengths (C-Band) Over Single Fiber'}</text>
    <rect x="295" y="151" width="110" height="30" rx="5" fill="#ffffff" stroke="#f87171" />
    <text x="350" y="169" text-anchor="middle" font-size="9.5" font-weight="800" fill="#0f172a">Transponder (OTU)</text>
    <line x1="405" y1="166" x2="430" y2="166" stroke="#334155" stroke-width="1.8" marker-end="url(#arrowSlatePdf)" />
    <rect x="434" y="151" width="128" height="30" rx="5" fill="#ffffff" stroke="#ef4444" />
    <text x="498" y="169" text-anchor="middle" font-size="9.5" font-weight="800" fill="#0f172a">MUX / ROADM</text>
    <line x1="562" y1="166" x2="587" y2="166" stroke="#334155" stroke-width="1.8" marker-end="url(#arrowSlatePdf)" />
    <rect x="591" y="151" width="193" height="30" rx="5" fill="#fee2e2" stroke="#dc2626" />
    <text x="687" y="169" text-anchor="middle" font-size="9.5" font-weight="900" fill="#7f1d1d">EDFA Amplifiers + OSC (SMF Trunk)</text>

    <rect x="10" y="214" width="800" height="208" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
    <text x="410" y="232" text-anchor="middle" font-size="11.5" font-weight="900" fill="#0f172a">
      ${isAr ? '2. مسار نقل الإنترنت خارج المملكة (الشبكة الوطنية SNFN ← المعابر البرية والبحرية ← أوروبا والدول العربية)' : '2. International Internet Transport: Saudi SNFN Backbone → Regional Cross-Border & European Hubs'}
    </text>

    <rect x="24" y="252" width="195" height="148" rx="9" fill="#ffffff" stroke="#0f766e" stroke-width="2" />
    <rect x="24" y="252" width="195" height="28" rx="9" fill="#0f766e" />
    <text x="121" y="270" text-anchor="middle" font-size="10.5" font-weight="900" fill="#ffffff">SNFN &amp; Saudi Core POPs</text>
    <text x="121" y="297" text-anchor="middle" font-size="9.5" font-weight="800" fill="#0f172a">Riyadh | Jeddah | Al-Khobar</text>
    <text x="121" y="315" text-anchor="middle" font-size="8.8" font-weight="700" fill="#475569">Salam (ITC) &amp; Mobily Backbone</text>
    <text x="121" y="331" text-anchor="middle" font-size="8.8" font-weight="700" fill="#475569">~19,000+ km National Fiber</text>
    <rect x="38" y="344" width="167" height="44" rx="6" fill="#f0fdfa" stroke="#99f6e4" />
    <text x="121" y="362" text-anchor="middle" font-size="8.8" font-weight="800" fill="#0f766e">IGW &amp; B2B Carrier Handover</text>
    <text x="121" y="378" text-anchor="middle" font-size="8.5" font-weight="700" fill="#334155">STC • Mobily • Zain • Dawiyat</text>

    <line x1="219" y1="292" x2="275" y2="274" stroke="#0284c7" stroke-width="2.2" marker-end="url(#arrowBluePdf)" />
    <rect x="280" y="246" width="235" height="62" rx="8" fill="#ffffff" stroke="#0284c7" stroke-width="1.6" />
    <text x="397" y="264" text-anchor="middle" font-size="10" font-weight="900" fill="#0369a1">Terrestrial Cross-Border Gateways</text>
    <text x="397" y="280" text-anchor="middle" font-size="9" font-weight="700" fill="#0f172a">Jordan (Amman / Aqaba Hub)</text>
    <text x="397" y="296" text-anchor="middle" font-size="8.5" font-weight="700" fill="#475569">UAE • Bahrain • Kuwait • Oman • Egypt • Iraq</text>

    <line x1="219" y1="358" x2="275" y2="358" stroke="#0f766e" stroke-width="2.2" marker-end="url(#arrowTealPdf)" />
    <rect x="280" y="324" width="235" height="76" rx="8" fill="#ffffff" stroke="#0f766e" stroke-width="1.6" />
    <text x="397" y="342" text-anchor="middle" font-size="10" font-weight="900" fill="#0f766e">Submarine Cable Landing Stations</text>
    <text x="397" y="358" text-anchor="middle" font-size="8.8" font-weight="700" fill="#0f172a">Jeddah (Red Sea) &amp; Al-Khobar (Gulf)</text>
    <text x="397" y="374" text-anchor="middle" font-size="8.3" font-weight="700" fill="#475569">FALCON • FEA • SEA-ME-WE • IMEWE</text>
    <text x="397" y="390" text-anchor="middle" font-size="8.3" font-weight="700" fill="#475569">2Africa • AAE-1 • Medusa (via Jordan)</text>

    <line x1="515" y1="277" x2="565" y2="296" stroke="#334155" stroke-width="2" marker-end="url(#arrowSlatePdf)" />
    <line x1="515" y1="362" x2="565" y2="346" stroke="#334155" stroke-width="2" marker-end="url(#arrowSlatePdf)" />

    <rect x="570" y="250" width="226" height="150" rx="9" fill="#ffffff" stroke="#c0102a" stroke-width="2" />
    <rect x="570" y="250" width="226" height="28" rx="9" fill="#c0102a" />
    <text x="683" y="268" text-anchor="middle" font-size="10.2" font-weight="900" fill="#ffffff">European IXPs &amp; Global Transit</text>
    <rect x="584" y="288" width="198" height="32" rx="6" fill="#fef2f2" stroke="#fca5a5" />
    <text x="683" y="302" text-anchor="middle" font-size="9.5" font-weight="900" fill="#991b1b">London, UK (LINX / Telehouse)</text>
    <text x="683" y="314" text-anchor="middle" font-size="8.2" font-weight="700" fill="#475569">IP Transit &amp; Content Peering Gateways</text>
    <rect x="584" y="326" width="198" height="32" rx="6" fill="#eff6ff" stroke="#93c5fd" />
    <text x="683" y="340" text-anchor="middle" font-size="9.5" font-weight="900" fill="#1e3a8a">Frankfurt, Germany (DE-CIX)</text>
    <text x="683" y="352" text-anchor="middle" font-size="8.2" font-weight="700" fill="#475569">Primary Continental Europe Routing Hub</text>
    <text x="683" y="378" text-anchor="middle" font-size="8.5" font-weight="800" fill="#0f172a">Tier-1 Wholesale: TATA • GCX • Orange</text>
    <text x="683" y="392" text-anchor="middle" font-size="8.2" font-weight="700" fill="#64748b">Protected Dual-Path Diversity via Aqaba &amp; Suez</text>
  </svg>
</figure>

<figure class="diag-card">
  <figcaption class="diag-cap">
    <span>${isAr ? 'شكل (2): أنماط تخطيط شبكات النقل (Topologies) وآلية تحديد مكان قطع الألياف بدقة بجهاز OTDR' : 'Figure 2: Transport Network Topologies & Exact Fiber-Cut Localization via OTDR'}</span>
    <span class="diag-badge" style="background:#E3F0EA;color:#2A6348;">${isAr ? 'حماية <50ms وتحديد القطع بالمتر' : 'Resilience & Meter-Level Pinpointing'}</span>
  </figcaption>
  <svg viewBox="0 0 820 270" style="width:100%; height:auto; display:block;" dir="ltr">
    <rect x="8" y="8" width="394" height="254" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
    <text x="205" y="27" text-anchor="middle" font-size="11" font-weight="900" fill="#0f172a">
      ${isAr ? 'أنواع تخطيط الشبكات (DWDM / OTN / MPLS)' : 'Transport Topologies'}
    </text>
    <rect x="20" y="38" width="180" height="98" rx="7" fill="#ffffff" stroke="#e2e8f0" />
    <text x="110" y="54" text-anchor="middle" font-size="9.5" font-weight="800" fill="#334155">1. Point-to-Point (Linear)</text>
    <circle cx="54" cy="90" r="13" fill="#e0f2fe" stroke="#0284c7" stroke-width="2" />
    <text x="54" y="94" text-anchor="middle" font-size="8.5" font-weight="900" fill="#0369a1">A</text>
    <line x1="67" y1="90" x2="153" y2="90" stroke="#0284c7" stroke-width="2.5" />
    <circle cx="166" cy="90" r="13" fill="#e0f2fe" stroke="#0284c7" stroke-width="2" />
    <text x="166" y="94" text-anchor="middle" font-size="8.5" font-weight="900" fill="#0369a1">B</text>
    <text x="110" y="124" text-anchor="middle" font-size="8" font-weight="700" fill="#64748b">Direct Span / Unprotected</text>

    <rect x="210" y="38" width="180" height="98" rx="7" fill="#ffffff" stroke="#e2e8f0" />
    <text x="300" y="54" text-anchor="middle" font-size="9.5" font-weight="800" fill="#0f766e">2. Ring (SNCP 1+1 &lt;50ms)</text>
    <circle cx="300" cy="92" r="28" fill="none" stroke="#14b8a6" stroke-width="2" stroke-dasharray="4 2" />
    <circle cx="300" cy="64" r="9" fill="#ccfbf1" stroke="#0f766e" stroke-width="1.5" />
    <circle cx="272" cy="92" r="9" fill="#ccfbf1" stroke="#0f766e" stroke-width="1.5" />
    <circle cx="328" cy="92" r="9" fill="#ccfbf1" stroke="#0f766e" stroke-width="1.5" />
    <circle cx="300" cy="120" r="9" fill="#ccfbf1" stroke="#0f766e" stroke-width="1.5" />
    <text x="281" y="76" font-size="11" font-weight="900" fill="#dc2626">✕</text>
    <text x="300" y="133" text-anchor="middle" font-size="8" font-weight="700" fill="#64748b">Auto-Switch on Cut</text>

    <rect x="20" y="146" width="180" height="106" rx="7" fill="#ffffff" stroke="#e2e8f0" />
    <text x="110" y="162" text-anchor="middle" font-size="9.5" font-weight="800" fill="#1d4ed8">3. Core Mesh (ROADM / MPLS)</text>
    <line x1="65" y1="184" x2="155" y2="184" stroke="#60a5fa" stroke-width="1.6" />
    <line x1="65" y1="226" x2="155" y2="226" stroke="#60a5fa" stroke-width="1.6" />
    <line x1="65" y1="184" x2="65" y2="226" stroke="#60a5fa" stroke-width="1.6" />
    <line x1="155" y1="184" x2="155" y2="226" stroke="#60a5fa" stroke-width="1.6" />
    <line x1="65" y1="184" x2="155" y2="226" stroke="#93c5fd" stroke-width="1.4" />
    <line x1="155" y1="184" x2="65" y2="226" stroke="#93c5fd" stroke-width="1.4" />
    <circle cx="65" cy="184" r="8" fill="#dbeafe" stroke="#2563eb" />
    <circle cx="155" cy="184" r="8" fill="#dbeafe" stroke="#2563eb" />
    <circle cx="65" cy="226" r="8" fill="#dbeafe" stroke="#2563eb" />
    <circle cx="155" cy="226" r="8" fill="#dbeafe" stroke="#2563eb" />
    <text x="110" y="246" text-anchor="middle" font-size="8" font-weight="700" fill="#64748b">Multi-Path Carrier Core</text>

    <rect x="210" y="146" width="180" height="106" rx="7" fill="#ffffff" stroke="#e2e8f0" />
    <text x="300" y="162" text-anchor="middle" font-size="9.5" font-weight="800" fill="#7c3aed">4. Dual-Homed B2B Client</text>
    <rect x="242" y="172" width="44" height="20" rx="4" fill="#f3e8ff" stroke="#7c3aed" />
    <text x="264" y="185" text-anchor="middle" font-size="8" font-weight="900" fill="#5b21b6">PE-1</text>
    <rect x="314" y="172" width="44" height="20" rx="4" fill="#f3e8ff" stroke="#7c3aed" />
    <text x="336" y="185" text-anchor="middle" font-size="8" font-weight="900" fill="#5b21b6">PE-2</text>
    <line x1="264" y1="192" x2="300" y2="216" stroke="#7c3aed" stroke-width="1.8" />
    <line x1="336" y1="192" x2="300" y2="216" stroke="#7c3aed" stroke-width="1.8" stroke-dasharray="3 2" />
    <rect x="264" y="216" width="72" height="22" rx="4" fill="#ede9fe" stroke="#6d28d9" />
    <text x="300" y="230" text-anchor="middle" font-size="8.5" font-weight="900" fill="#4c1d95">B2B CE</text>

    <rect x="414" y="8" width="398" height="254" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />
    <text x="613" y="27" text-anchor="middle" font-size="11" font-weight="900" fill="#0f172a">
      ${isAr ? 'تحديد مكان قطع الألياف بدقة عبر OTDR' : 'Exact Fiber-Cut Localization via OTDR'}
    </text>
    <rect x="428" y="42" width="370" height="72" rx="8" fill="#ffffff" stroke="#e2e8f0" />
    <rect x="440" y="56" width="84" height="40" rx="6" fill="#fef3c7" stroke="#d97706" stroke-width="1.5" />
    <text x="482" y="73" text-anchor="middle" font-size="9.5" font-weight="900" fill="#92400e">POP A (ODF)</text>
    <text x="482" y="88" text-anchor="middle" font-size="8.2" font-weight="800" fill="#b45309">OTDR Laser Pulse</text>
    <line x1="524" y1="71" x2="670" y2="71" stroke="#0284c7" stroke-width="3" />
    <line x1="524" y1="81" x2="664" y2="81" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="4 2" />
    <text x="595" y="64" text-anchor="middle" font-size="8" font-weight="800" fill="#0369a1">Forward Pulse →</text>
    <text x="595" y="96" text-anchor="middle" font-size="8" font-weight="800" fill="#dc2626">← Reflected Spike (Break)</text>
    <polygon points="670,56 680,76 670,96 686,76" fill="#dc2626" />
    <text x="688" y="66" font-size="8.8" font-weight="900" fill="#b91c1c">CUT @ 24.38 km</text>
    <line x1="690" y1="76" x2="730" y2="76" stroke="#cbd5e1" stroke-width="2.5" stroke-dasharray="3 3" />
    <rect x="730" y="56" width="58" height="40" rx="6" fill="#f1f5f9" stroke="#94a3b8" />
    <text x="759" y="74" text-anchor="middle" font-size="8.5" font-weight="900" fill="#475569">POP B</text>
    <text x="759" y="87" text-anchor="middle" font-size="8" font-weight="900" fill="#dc2626">R_LOS (A1)</text>

    <rect x="428" y="122" width="180" height="128" rx="8" fill="#ffffff" stroke="#e2e8f0" />
    <text x="518" y="138" text-anchor="middle" font-size="9" font-weight="900" fill="#0f172a">OTDR Optical Trace</text>
    <polyline points="442,155 478,164 484,160 488,167 540,180 546,148 552,226 594,230" fill="none" stroke="#0f766e" stroke-width="2.2" />
    <text x="486" y="155" text-anchor="middle" font-size="7.5" font-weight="700" fill="#64748b">Splice Loss</text>
    <text x="562" y="152" text-anchor="middle" font-size="8" font-weight="900" fill="#dc2626">Break</text>
    <text x="518" y="243" text-anchor="middle" font-size="8" font-weight="700" fill="#475569">Distance (km) vs Attenuation (dB)</text>

    <rect x="616" y="122" width="182" height="128" rx="8" fill="#eff6ff" stroke="#93c5fd" />
    <text x="707" y="140" text-anchor="middle" font-size="9.5" font-weight="900" fill="#1e3a8a">Formula &amp; Field Action</text>
    <rect x="628" y="150" width="158" height="30" rx="5" fill="#ffffff" stroke="#60a5fa" />
    <text x="707" y="169" text-anchor="middle" font-size="11" font-weight="900" fill="#0f172a">d = (c × t) / (2 × n)</text>
    <text x="707" y="196" text-anchor="middle" font-size="8.2" font-weight="700" fill="#334155">n ≈ 1.468 (Fiber Refractive Index)</text>
    <text x="707" y="213" text-anchor="middle" font-size="8.2" font-weight="700" fill="#0f766e">1. Match km on GIS / KMZ map</text>
    <text x="707" y="229" text-anchor="middle" font-size="8.2" font-weight="700" fill="#0f766e">2. Pinpoint manhole / dig site</text>
    <text x="707" y="244" text-anchor="middle" font-size="8.2" font-weight="700" fill="#0f766e">3. Dispatch FOPS + Fusion Splicer</text>
  </svg>
</figure>
`;

const hardwarePlatesHtml = (isAr) => `
<div class="plates-grid">
  <figure class="plate-card">
    <figcaption class="plate-title">${isAr ? 'لوحة (1): أهم أجهزة شبكات النقل والاختبار الميداني للألياف' : 'Plate 1: Core Optical/IP Transport Hardware & Field Test Instruments'}</figcaption>
    <div class="plate-img-wrap">
      ${devicesDataUri ? `<img src="${devicesDataUri}" alt="Transport Hardware" />` : ''}
    </div>
    <div class="plate-legend-grid">
      <div><strong>1. DWDM / OTN:</strong> ${isAr ? 'OptiX OSN / NCS 2000' : 'Optical Shelf'}</div>
      <div><strong>2. MPLS Router:</strong> ${isAr ? 'NE40E / ASR 9000' : 'PE / P Core'}</div>
      <div><strong>3. OTDR Tester:</strong> ${isAr ? 'تحديد مسافة القطع' : 'Break Distance'}</div>
      <div><strong>4. Fusion Splicer:</strong> ${isAr ? 'لحام الألياف الضوئية' : 'Fiber Splicing'}</div>
    </div>
  </figure>

  <figure class="plate-card">
    <figcaption class="plate-title">${isAr ? 'لوحة (2): المقاطع الهندسية لأنواع كابلات الألياف الضوئية في الشبكة' : 'Plate 2: Engineering Cross-Sections of Transport Optical Fiber Cables'}</figcaption>
    <div class="plate-img-wrap">
      ${cablesDataUri ? `<img src="${cablesDataUri}" alt="Optical Fiber Cables" />` : ''}
    </div>
    <div class="plate-legend-stack">
      <div><strong>▲ SMF Patchcord (OS2):</strong> ${isAr ? 'كابل أصفر داخل المقاسم (ODF ↔ الأجهزة)' : 'Yellow indoor single-mode jumper (LC/SC)'}</div>
      <div><strong>■ Armored Underground:</strong> ${isAr ? 'كابل أرضي مسلّح للشبكة الوطنية SNFN' : 'Corrugated steel armored trunk for SNFN'}</div>
      <div><strong>▼ Submarine Cable:</strong> ${isAr ? 'كابل بحري متعدد التسليح للربط الدولي' : 'Multi-armored subsea cable for Europe transit'}</div>
    </div>
  </figure>
</div>
`;

const sharedStyles = (isAr) => `
  @page { size: A4 portrait; margin: 13mm 14mm 13mm 14mm; }
  @page:first { margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  body {
    margin: 0; padding: 0;
    font-family: ${isAr ? "'Tajawal', sans-serif" : "'Segoe UI', 'Inter', Arial, sans-serif"};
    color: #18181A; background: #FFFFFF;
    line-height: 1.58; font-size: 12px;
  }
  code {
    font-family: 'Consolas', monospace;
    background: #F1F5F9; padding: 1px 4px; border-radius: 4px;
    font-size: 10.6px; color: #0F172A; border: 1px solid #E2E8F0;
    direction: ltr; unicode-bidi: embed;
  }
  .page-break { page-break-before: always; break-before: page; }
  .cover-container {
    width: 100vw; height: 100vh; min-height: 100vh; padding: 15mm 18mm;
    display: flex; flex-direction: column; justify-content: space-between;
    background: #FFFFFF;
  }
  .cover-header {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 2px solid #E6E2D8; padding-bottom: 12px;
  }
  .header-box { font-size: 11px; font-weight: 700; line-height: 1.45; }
  .cover-title-badge {
    display: inline-block; background: #C0102A; color: #FFFFFF;
    font-size: 11.5px; font-weight: 800; padding: 4px 16px; border-radius: 999px; margin-bottom: 8px;
  }
  .cover-title { font-size: 23px; font-weight: 900; color: #18181A; margin: 0 0 6px 0; border: none; }
  .cover-subtitle { font-size: 12.5px; color: #686560; font-weight: 700; margin: 0; }
  .matrix-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px;
    background: #FAFAF8; border: 1px solid #E6E2D8; border-radius: 12px;
    padding: 14px 18px; margin-top: 16px; font-size: 11.8px;
  }
  .matrix-row { display: flex; justify-content: space-between; border-bottom: 1px dashed #E6E2D8; padding-bottom: 4px; gap: 8px; }
  .matrix-label { color: #686560; font-weight: 700; }
  .matrix-val { color: #18181A; font-weight: 800; }
  .matrix-full {
    grid-column: span 2; background: #F6DDE1; border: 1px solid #E8354D40;
    padding: 8px 13px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; gap: 10px;
  }
  .intervals-container {
    background: #FAFAF8; border: 1px solid #E6E2D8; border-radius: 12px;
    padding: 12px 15px; margin-top: 14px;
  }
  .intervals-header {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid #E6E2D8; padding-bottom: 7px; margin-bottom: 10px;
  }
  .intervals-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .interval-card { background: #FFFFFF; border: 1px solid #E6E2D8; border-radius: 8px; padding: 8px 10px; font-size: 10.5px; }
  .interval-card-title { font-weight: 800; color: #18181A; margin-bottom: 3px; }
  .interval-card-meta { display: flex; justify-content: space-between; color: #686560; font-weight: 700; }
  .cover-footer {
    border-top: 1px solid #E6E2D8; padding-top: 8px; display: flex;
    justify-content: space-between; font-size: 10px; color: #686560; font-weight: 700;
  }
  .content-body { padding: 0 1mm; }
  h1 {
    font-size: 15px; font-weight: 900; color: #18181A;
    border-bottom: 2px solid #C0102A; padding-bottom: 4px;
    margin-top: 16px; margin-bottom: 8px; page-break-after: avoid; break-after: avoid;
  }
  h2 {
    font-size: 12.8px; font-weight: 800; color: #C0102A;
    margin-top: 11px; margin-bottom: 5px; page-break-after: avoid; break-after: avoid;
  }
  h3 { font-size: 11.5px; font-weight: 800; color: #0F172A; margin-top: 9px; margin-bottom: 4px; page-break-after: avoid; }
  p { margin: 0 0 6px 0; text-align: justify; }
  ul, ol { margin: 0 0 8px 0; padding-${isAr ? 'right' : 'left'}: 18px; }
  li { margin-bottom: 3px; }
  table { width: 100%; border-collapse: collapse; margin: 7px 0 11px 0; font-size: 10.5px; }
  tr { page-break-inside: avoid; break-inside: avoid; }
  th, td { border: 1px solid #CBD5E1; padding: 4.5px 7px; text-align: ${isAr ? 'right' : 'left'}; }
  th { background: #F1F5F9; font-weight: 800; color: #0F172A; }
  tr:nth-child(even) td { background: #F8FAFC; }
  .diag-card {
    background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 10px;
    padding: 9px 11px; margin: 10px 0; page-break-inside: avoid; break-inside: avoid;
  }
  .diag-cap {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 10.5px; font-weight: 800; color: #0F172A;
    border-bottom: 1px solid #E2E8F0; padding-bottom: 5px; margin-bottom: 7px;
  }
  .diag-badge {
    font-size: 9px; background: #F6DDE1; color: #C0102A; padding: 2px 8px;
    border-radius: 999px; font-weight: 800;
  }
  .plates-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0;
    page-break-inside: avoid; break-inside: avoid;
  }
  .plate-card {
    background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 10px;
    padding: 8px 10px; margin: 0; page-break-inside: avoid; break-inside: avoid;
  }
  .plate-title {
    font-size: 10.2px; font-weight: 800; color: #0F172A;
    border-bottom: 1px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 6px;
  }
  .plate-img-wrap {
    border: 1px solid #E2E8F0; border-radius: 7px; padding: 4px; background: #FFFFFF;
    text-align: center;
  }
  .plate-img-wrap img { width: 100%; max-height: 165px; object-fit: contain; display: block; margin: auto; }
  .plate-legend-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 6px; font-size: 9px;
  }
  .plate-legend-grid div, .plate-legend-stack div {
    background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 4px; padding: 3px 5px;
  }
  .plate-legend-stack { display: flex; flex-direction: column; gap: 3px; margin-top: 6px; font-size: 9px; }
  .kpi-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 9px; margin: 10px 0;
    page-break-inside: avoid; break-inside: avoid;
  }
  .kpi-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 9px; padding: 8px 10px; }
  .kpi-title { font-size: 10px; font-weight: 700; color: #64748B; margin-bottom: 3px; }
  .kpi-value { font-size: 19px; font-weight: 900; color: #0F172A; }
  .kpi-sub { font-size: 9px; font-weight: 700; color: #10B981; margin-top: 2px; }
  .charts-row {
    display: grid; grid-template-columns: 1.35fr 1fr; gap: 11px; margin: 10px 0;
    page-break-inside: avoid; break-inside: avoid;
  }
  .chart-panel { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px; }
  .chart-panel-title {
    font-size: 11px; font-weight: 800; color: #0F172A; border-bottom: 1px solid #E2E8F0;
    padding-bottom: 4px; margin-bottom: 8px; display: flex; justify-content: space-between;
  }
  .telemetry-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: 11px; margin: 10px 0;
    page-break-inside: avoid; break-inside: avoid;
  }
  .telemetry-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 9px 11px; }
  .endorsement-box {
    background: #F8FAFC; border: 2px solid #CBD5E1; border-radius: 11px;
    padding: 13px; margin-top: 18px; page-break-inside: avoid; break-inside: avoid;
  }
  .endorsement-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center; margin-top: 10px; }
  .sig-line { border-bottom: 1px dashed #94A3B8; height: 34px; margin-top: 8px; }
`;

const buildArabicHtml = () => `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>التقرير الفتري الثاني - من 11/10 إلى 19/11 - ${profile.studentName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet">
  <style>${sharedStyles(true)}</style>
</head>
<body>
  <div class="cover-container">
    <div class="cover-header">
      <div class="header-box" style="text-align: right;">
        <div style="font-weight: 900; font-size: 12px;">المملكة العربية السعودية</div>
        <div>المؤسسة العامة للتدريب التقني والمهني</div>
        <div style="color: #C0102A; font-weight: 800;">${profile.trainingUnit}</div>
        <div>إدارة شؤون المتدربين — التدريب التعاوني</div>
      </div>
      <div style="text-align: center;">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: #F6DDE1; color: #C0102A; display: inline-flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; border: 2px solid #C0102A;">COOP</div>
        <div style="font-size: 9.5px; font-weight: 800; color: #686560; margin-top: 4px;">التقرير الفتري للتدريب التعاوني</div>
      </div>
      <div class="header-box" style="text-align: left;">
        <div style="font-weight: 900; font-size: 12px;">${profile.entityAddress}</div>
        <div style="color: #686560;">قسم خدمات الألياف FTTH وشبكات النقل</div>
        <div style="font-size: 10px; color: #9E9A93;">FTTH Operations &amp; B2B Transport</div>
      </div>
    </div>

    <div style="margin: auto 0; text-align: center;">
      <div class="cover-title-badge">من 11/10 إلى 19/11</div>
      <h1 class="cover-title">التقرير الفتري الثاني</h1>
      <p class="cover-subtitle">قسم خدمات الألياف الضوئية (FTTH) وقسم شبكات النقل التراسلي (Transport Domain — B2B)</p>

      <div class="matrix-grid" style="text-align: right;">
        <div class="matrix-row"><span class="matrix-label">اسم المتدرب:</span><span class="matrix-val" style="color: #C0102A;">${profile.studentName}</span></div>
        <div class="matrix-row"><span class="matrix-label">الرقم الأكاديمي:</span><span class="matrix-val">${profile.trainingNumber}</span></div>
        <div class="matrix-row"><span class="matrix-label">مجال التدريب:</span><span class="matrix-val">عمليات FTTH وشبكات النقل (B2B Transport)</span></div>
        <div class="matrix-row"><span class="matrix-label">طبيعة العمل:</span><span class="matrix-val">قسم خدمات FTTH وقسم شبكات النقل والتراسل</span></div>
        <div class="matrix-row"><span class="matrix-label">المشرف الميداني:</span><span class="matrix-val">${profile.responsibleName}</span></div>
        <div class="matrix-row"><span class="matrix-label">الفترة المشمولة بالتقرير:</span><span class="matrix-val" style="color: #C0102A;">من 11/10 إلى 19/11 (الأسابيع 7–12)</span></div>
        <div class="matrix-full">
          <span style="font-weight: 900;">الصفة ونطاق التكليف بالفترة:</span>
          <span style="font-weight: 900; color: #C0102A;">موظف فعلي في FTTH (الأسابيع 7–8 و12) ومتدرب في شبكات النقل (الأسابيع 9–11)</span>
        </div>
      </div>

      <div class="intervals-container" style="text-align: right;">
        <div class="intervals-header">
          <span style="font-weight: 900; font-size: 11.5px;">ملخص مراحل الفترة ونطاق العمل (الأسابيع 7 إلى 12):</span>
          <div>
            <span style="background: #E3F0EA; color: #2A6348; padding: 2px 9px; border-radius: 999px; font-weight: 800; font-size: 10px;">452 تذكرة FTTH | النقل: 0 تذاكر</span>
            <span style="color: #C0102A; font-weight: 900; font-size: 11px; margin-right: 6px;">من 11/10 إلى 19/11</span>
          </div>
        </div>
        <div class="intervals-grid">
          <div class="interval-card">
            <div class="interval-card-title">الأسابيع 7 و 8 (11/10 – 21/10): العمل الفعلي في قسم FTTH</div>
            <div class="interval-card-meta"><span>331 تذكرة</span><span style="color:#C0102A;">ذروة 97 تذكرة (20/10)</span></div>
          </div>
          <div class="interval-card">
            <div class="interval-card-title">الأسابيع 9 إلى 11 (25/10 – 12/11): التدريب في شبكات النقل (B2B)</div>
            <div class="interval-card-meta"><span>تدريب ومشاهدة (0 تذاكر)</span><span style="color:#C0102A;">DWDM / OTN / MPLS / SNFN</span></div>
          </div>
          <div class="interval-card">
            <div class="interval-card-title">الأسبوع 11 (8/11 – 12/11): التعمق في المخططات والإنذارات والربط الدولي</div>
            <div class="interval-card-meta"><span>إنذارات A1–A3</span><span style="color:#C0102A;">لندن / ألمانيا / الأردن</span></div>
          </div>
          <div class="interval-card">
            <div class="interval-card-title">الأسبوع 12 (15/11 – 19/11): العودة إلى قسم FTTH</div>
            <div class="interval-card-meta"><span>قرابة 90 تذكرة موزعة</span><span style="color:#C0102A;">مع تطور أتمتة تذاكر FTTH</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <span>المملكة العربية السعودية — التقرير الفتري الثاني للتدريب التعاوني (من 11/10 إلى 19/11)</span>
      <span style="color: #C0102A; font-weight: 900;">الغلاف الرسمي المعتمد</span>
    </div>
  </div>

  <div class="page-break"></div>
  <div class="content-body">
    <h1>مقدمة التقرير الفتري الثاني ونطاق العمل (من 11/10 إلى 19/11)</h1>
    <p>يغطي هذا التقرير ستة أسابيع كاملة من برنامج التدريب التعاوني الممتدة <strong>من 11 أكتوبر إلى 19 نوفمبر (الأسابيع: 7، 8، 9، 10، 11، 12)</strong>، حيث توزع العمل والتدريب فيها بين المسارين الرئيسيين التاليين:</p>
    <ol>
      <li><strong>الأسابيع السابع والثامن (<code>11/10 – 21/10</code>) — الاستمرار كموظف فعلي في قسم الألياف الضوئية (<code>FTTH</code>):</strong> العمل المباشر والمستقل على معالجة بلاغات المشتركين، ومتابعة قائمة التسليم اليومية، وفحص الإشارة الضوئية والخدمات، وإنجاز <strong>331 تذكرة</strong> بذروة يومية بلغت <strong>97 تذكرة بتاريخ 20 أكتوبر</strong>.</li>
      <li><strong>الأسابيع التاسع والعاشر والحادي عشر (<code>25/10 – 12/11</code>، شاملة الأسبوع 11 من <code>8/11 إلى 12/11</code>) — التدريب الهندسي في قسم شبكات النقل (<code>Transport Domain — B2B</code>):</strong> الانتقال للتدريب الهندسي والمشاهدة الميدانية في قسم النقل ذات الطبيعة التجارية بين الشركات (<code>B2B</code>) <strong>دون استلام أي تذاكر تشغيلية (0 تذاكر)</strong>؛ لفهم تقنيات <code>DWDM</code> و<code>OTN</code> و<code>MPLS</code>، والشبكة الوطنية <code>SNFN</code>، ومسارات الإنترنت خارج المملكة (لندن وألمانيا والأردن والدول العربية)، ومخططات الشبكات، وأنواع الأجهزة والكوابل، وتحديد قطع الألياف بجهاز <code>OTDR</code>، ومراقبة إنذارات <code>A1–A3</code>، وخطوات فتح التذاكر في <code>BMC Remedy</code>.</li>
      <li><strong>الأسبوع الثاني عشر (<code>15/11 – 19/11</code>) — العودة إلى قسم الألياف الضوئية (<code>FTTH</code>):</strong> الرجوع لقسم <code>FTTH</code> ومعالجة <strong>قرابة 90 تذكرة موزعة</strong> على مختلف التصنيفات بالتزامن مع استمرار وتطور نظام الأتمتة داخل القسم لأخذ وتصنيف مختلف أنواع التذاكر.</li>
    </ol>

    <h1>أولًا: التشغيل الفعلي في قسم FTTH (الأسابيع 7 و 8) والعودة في الأسبوع 12</h1>
    <h2>1. سير العمل الفني في معالجة بلاغات FTTH</h2>
    <ul>
      <li><strong>التحقق الأولي من الاشتراك:</strong> مطابقة رقم الخدمة (<code>Service ID</code>) في نظام <code>MOSS</code> للتأكد من عدم وجود إيقاف مالي (<code>Suspended</code>) وتحديد المنصة (<code>Huawei NCE</code> أو <code>Nokia AMS</code>).</li>
      <li><strong>فحص الإشارة الضوئية وخدمات <code>CVLAN</code>:</strong> التأكد من أن قراءة <code>RX Power</code> تقع بين <code>-10 dBm</code> و <code>-26 dBm</code>، ومراجعة ربط القنوات (<code>1501 HSI</code>، <code>3980 ACS/TR-069</code>، <code>1810 VoIP</code>).</li>
      <li><strong>تدوين التشخيص والتوجيه:</strong> كتابة التعليق التشخيصي قبل الإغلاق المباشر (<code>Resolved</code>) أو التحويل لـ <code>Call Centre</code> أو تنسيق <code>Open Access</code> أو التصعيد لـ <code>FOPS</code>.</li>
    </ul>

    <h2>2. لقطات التسليم الموثقة وملخص الأسابيع الستة (إجمالي تذاكر FTTH = 452 | الترانزبورت = 0)</h2>
    <table>
      <thead>
        <tr><th>التاريخ</th><th>الإجمالي</th><th>CCS</th><th>Call Centre</th><th>Open Access</th><th>Resolved</th><th>TLS</th><th>Pending to NOC</th><th>OSS</th><th>NAS</th><th>ملاحظات موثقة</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>11/10</strong></td><td><strong>40</strong></td><td>10</td><td>15</td><td>7</td><td>6</td><td>0</td><td>2</td><td>0</td><td>0</td><td>بداية الأسبوع 7 (لقطة مسائية)</td></tr>
        <tr><td><strong>19/10</strong></td><td><strong>16</strong></td><td>6</td><td>6</td><td>2</td><td>2</td><td>0</td><td>0</td><td>0</td><td>0</td><td>دقة تشخيص وتصعيد 100%</td></tr>
        <tr><td><strong>20/10</strong></td><td><strong>97</strong></td><td>34</td><td>30</td><td>9</td><td>16</td><td>3</td><td>2</td><td>1</td><td>2</td><td><strong>ذروة الفترة</strong> (منها <code>INC000003443563</code>)</td></tr>
        <tr><td><strong>21/10</strong></td><td><strong>45</strong></td><td>25</td><td>11</td><td>6</td><td>3</td><td>0</td><td>0</td><td>0</td><td>0</td><td>ارتفعت من 36 (10:28 م) إلى 45 (11:57 م)</td></tr>
        <tr><td><strong>29/10</strong></td><td><strong>31</strong></td><td>16</td><td>3</td><td>5</td><td>3</td><td>2</td><td>0</td><td>2</td><td>0</td><td>تغطية FTTH موثقة بالصورة — تذاكر النقل = 0 (<code>INC000003464990</code>–<code>3461185</code>)</td></tr>
      </tbody>
    </table>

    <table>
      <thead>
        <tr><th>الفترة</th><th>التواريخ</th><th>القسم والتكليف</th><th>التذاكر المستلمة</th><th>ملخص المرحلة</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>الأسبوع 7</strong></td><td>11/10 – 15/10</td><td>FTTH (موظف فعلي)</td><td>138 FTTH</td><td>تشغيل تذاكر CCS و Call Centre و Open Access</td></tr>
        <tr><td><strong>الأسبوع 8</strong></td><td>18/10 – 22/10</td><td>FTTH (موظف فعلي)</td><td>193 FTTH</td><td>ذروة الأسبوعين بتسجيل <strong>97 تذكرة في 20/10</strong> و45 في 21/10</td></tr>
        <tr><td><strong>الأسبوع 9</strong></td><td>25/10 – 29/10</td><td>Transport (متدرب B2B) + 29/10 FTTH</td><td>0 نقل (31 FTTH)</td><td><strong>0 تذاكر في الترانزبورت</strong> (تدريب ومشاهدة فقط)؛ 31 تذكرة موثقة لـ FTTH في 29/10</td></tr>
        <tr><td><strong>الأسبوع 10</strong></td><td>1/11 – 5/11</td><td>Transport (متدرب B2B)</td><td>0 تذاكر</td><td><strong>تدريب هندسي ومشاهدة حية دون استلام تذاكر</strong> (<code>DWDM/OTN/MPLS</code> و<code>SNFN</code>)</td></tr>
        <tr><td><strong>الأسبوع 11</strong></td><td><strong>8/11 – 12/11</strong></td><td><strong>Transport (متدرب B2B)</strong></td><td><strong>0 تذاكر</strong></td><td><strong>تدريب هندسي ومشاهدة حية دون استلام تذاكر</strong> (المخططات، <code>OTDR</code>، <code>A1–A3</code>، و<code>Remedy</code>)</td></tr>
        <tr><td><strong>الأسبوع 12</strong></td><td><strong>15/11 – 19/11</strong></td><td><strong>العودة إلى FTTH (موظف فعلي)</strong></td><td><strong>قرابة 90 FTTH</strong></td><td>تذاكر موزعة بالتوازي مع تطور أتمتة تذاكر القسم</td></tr>
        <tr><td><strong>الإجمالي</strong></td><td><strong>11/10 – 19/11</strong></td><td><strong>الأسابيع 7 إلى 12</strong></td><td><strong>452 FTTH</strong></td><td><strong>0 تذاكر في قسم الترانزبورت | التزام SLA بنسبة 97.4%</strong></td></tr>
      </tbody>
    </table>

    <h1>ثانيًا: طبيعة قسم النقل (<code>B2B</code>) والجهات التي يتم التعامل معها</h1>
    <p>يعمل قسم شبكات النقل وفق نموذج <strong>الشركة إلى الشركة (<code>B2B</code>)</strong>؛ حيث يكون العميل شركة اتصالات أو مزوّد خدمة (<code>ISP</code>) أو بنكاً أو جهة حكومية تستأجر سعات كبيرة أو دوائر ربط مخصصة، مما يجعل الأثر التشغيلي لأي انقطاع واسع النطاق.</p>
    <table>
      <thead><tr><th>الفئة</th><th>أمثلة الجهات</th><th>دورها في التشغيل والتنسيق</th></tr></thead>
      <tbody>
        <tr><td><strong>المشغلون المحليون</strong></td><td>STC، Mobily، Zain، Salam (ITC)، Dawiyat، GO</td><td>تبادل حركة البيانات، الدوائر المؤجرة، ومعالجة الأعطال المشتركة</td></tr>
        <tr><td><strong>الشبكة الوطنية للألياف</strong></td><td>SNFN (ائتلاف سلام وموبايلي)</td><td>العمود الفقري البري داخل المملكة وتحديد وإصلاح الأعطال الوطنية</td></tr>
        <tr><td><strong>الشركات الدولية</strong></td><td>TATA، GCX، Tier-1 ومشغلو دول الجوار</td><td>بوابات العبور الدولي (IP Transit) والربط إلى لندن وألمانيا والأردن والدول العربية</td></tr>
        <tr><td><strong>العملاء والفرق الداخلية</strong></td><td>الشركات والبنوك + NOC، BO، Planning، FOPS، Power، B-Care</td><td>استهلاك خدمات DIA/MPLS + تحليل الأعطال، المخططات، اللحام، والكهرباء</td></tr>
      </tbody>
    </table>

    <h1>ثالثًا: آلية عمل تقنيات النقل الأساسية (<code>DWDM</code> و<code>OTN</code> و<code>MPLS</code>)</h1>
    <ul>
      <li><strong><code>DWDM</code> (الطبقة الضوئية):</strong> دمج 40 إلى 120 طولاً موجياً (<code>C-Band</code>) على ليف ضوئي واحد باستخدام <code>Transponders</code> و<code>Mux/Demux</code> و<code>ROADM</code> ومضخمات <code>EDFA</code> مع قناة إشراف <code>OSC</code>.</li>
      <li><strong><code>OTN (ITU-T G.709)</code>:</strong> تغليف الإشارات الرقمية (<code>OPUk → ODUk → OTUk</code>) مع تصحيح الأخطاء الأمامي (<code>FEC</code>) ومراقبة الجودة الطرفية (<code>TCM</code>) والحماية السريعة <code>SNCP 1+1 (&lt; 50ms)</code>.</li>
      <li><strong><code>MPLS</code> (طبقة التوجيه <code>L2.5</code>):</strong> تبديل الحزم عبر ملصقات (<code>Labels / LSP</code>) بدلاً من البحث IP المطوّل، مع عزل عملاء B2B في <code>VRFs (L3VPN / L2VPN)</code> عبر <code>MP-BGP</code> و<code>OSPF/IS-IS</code> وحماية <code>FRR (&lt; 50ms)</code> وضبط <code>QoS</code>.</li>
    </ul>
    <table>
      <thead><tr><th>وجه المقارنة</th><th>DWDM</th><th>OTN (G.709)</th><th>MPLS</th></tr></thead>
      <tbody>
        <tr><td><strong>الطبقة</strong></td><td>الطبقة الضوئية الفيزيائية (L0/L1)</td><td>الطبقة الرقمية التراسليه (L1)</td><td>طبقة التوجيه بالملصقات (L2.5)</td></tr>
        <tr><td><strong>وحدة النقل</strong></td><td>الطول الموجي (λ)</td><td>إطار رقمي (OPUk → ODUk → OTUk)</td><td>حزمة تحمل ملصقاً (Label / LSP)</td></tr>
        <tr><td><strong>الأجهزة</strong></td><td>OptiX OSN / NCS 2000 / 1830 PSS</td><td>كروت OTN البصرية</td><td>موجهات NE40E / NE8000 / ASR 9000</td></tr>
        <tr><td><strong>الوظيفة</strong></td><td>مضاعفة السعة الضوئية وتضخيمها</td><td>التغليف، تصحيح FEC، وحماية SNCP</td><td>عزل B2B (VRF) وتوجيه الحزم وFRR</td></tr>
      </tbody>
    </table>

    <h1>رابعًا: تخطيط الشبكات، المخططات المسؤولة، <code>SNFN</code>، ونقل الإنترنت خارج السعودية</h1>
    ${architectureSvgHtml(true)}
    <h2>1. أنواع التخطيط والمسؤول عن إرسال المخططات</h2>
    <ul>
      <li><strong>أنواع التخطيط:</strong> الخطي نقطة إلى نقطة (<code>Point-to-Point</code>)، الحلقي المحمي في &lt;50ms (<code>Ring SNCP 1+1</code>)، الشبكي المتداخل للمدن والمقاسم الرئيسية (<code>Core Mesh</code>)، والنجمي المزدوج لعملاء B2B (<code>Dual-Homed PE-1 / PE-2</code>).</li>
      <li><strong>المسؤول عن المخططات:</strong> تصدر التصاميم الهندسية (<code>HLD/LLD</code>) من <strong>إدارة تخطيط وتصميم الشبكات (<code>Network Planning</code>)</strong>، ومخططات الدوائر (<code>CLR</code>) من <strong>فريق التجهيز والمزودين الشركاء (<code>Provisioning / Partner Teams</code>)</strong>، بينما تسلم <strong>فرق الألياف الخارجية ومقاولو التنفيذ (<code>OSP / SNFN</code>)</strong> مخططات <code>As-Built</code> وخرائط المسارات (<code>GIS/KMZ</code>) إلى <code>NOC</code> و<code>Back Office</code>.</li>
    </ul>
    <h2>2. <code>SNFN</code> وكيف يُنقل الإنترنت خارج السعودية (لندن، ألمانيا، الأردن والدول العربية)</h2>
    <p>شبكة <strong><code>SNFN</code> (الشبكة الوطنية للألياف الضوئية)</strong> هي العمود الفقري البري فائق السعة داخل المملكة (بشراكة سلام وموبايلي، أكثر من 19,000 كم)، تربط المدن الرئيسية بالمعابر البرية ومحطات الإنزال البحرية. وتخرج حركة الإنترنت من المملكة عبر مسارين رئيسيين متكاملين: (1) <strong>المعابر البرية عبر <code>SNFN</code></strong> إلى <strong>الأردن (عمّان/العقبة)</strong> وبقية الدول العربية (الإمارات، البحرين، الكويت، عُمان، قطر، العراق، مصر)، و(2) <strong>محطات الإنزال البحرية في جدة والخبر</strong> عبر كابلات دولية (<code>FALCON</code>، <code>FEA</code>، <code>SEA-ME-WE</code>، <code>IMEWE</code>، <code>AAE-1</code>، <code>2Africa</code>، و<code>Medusa</code>) وصولاً إلى مراكز التبادل العالمية في <strong>لندن (<code>LINX</code>) وفرانكفورت بألمانيا (<code>DE-CIX</code>)</strong> لإتمام عمليات <code>IP Transit</code> و<code>Peering</code>.</p>

    <h1>خامسًا: أنواع الأجهزة، أنواع الكوابل، وتحديد قطع الألياف بدقة (<code>OTDR</code>)</h1>
    ${hardwarePlatesHtml(true)}
    <table>
      <thead><tr><th>النوع / الفئة</th><th>الأمثلة والخصائص</th><th>الاستخدام التشغيلي</th></tr></thead>
      <tbody>
        <tr><td><strong>أجهزة النقل والموجهات والاختبار</strong></td><td><code>Huawei OptiX OSN / NCS 2000 / 1830 PSS / Ciena 6500</code> + موجهات <code>NE40E / ASR 9000 / MX</code> + <code>OTDR</code> و<code>Fusion Splicer</code></td><td>نقل السعات الضوئية، توجيه B2B وIGW، فحص المسافة بالليزر ولحام الألياف</td></tr>
        <tr><td><strong>كابلات داخلية وبريّة وبحرية</strong></td><td><code>SMF OS2</code> (أصفر <code>9/125 µm</code>)، <code>MMF OM3/OM4</code> (أزرق سماوي)، كابل أرضي مسلّح فولاذياً (<code>SNFN</code>)، كابل بحري متعدد التسليح، وطاقة <code>-48V DC</code></td><td>ربط المقاسم داخلياً، مد الشبكة الوطنية بين المدن، والعبور البحري القاري</td></tr>
      </tbody>
    </table>
    <p><strong>تحديد موقع قطع الألياف بدقة عبر <code>OTDR</code>:</strong> عند ظهور إنذار <code>R_LOS</code> يُوصل جهاز <code>OTDR</code> بلوحة <code>ODF</code> لحقن نبضة ليزر وقياس زمن ارتداد الانعكاس عند نقطة القطع لحساب المسافة بالمتر عبر العلاقة <strong><code>d = (c × t) / (2 × n)</code></strong> (حيث معامل الانكسار <code>n ≈ 1.468</code>)، ثم مطابقتها مع خرائط <code>GIS / KMZ</code> (بعد حساب احتياط اللفات <code>Slack Loops</code>) لتحديد غرفة التفتيش أو موقع الحفر بدقة وتوجيه فريق اللحام (<code>FOPS</code>).</p>

    <h1>سادسًا: مراقبة الإنذارات (<code>A1–A3</code>)، تحديد المشكلة، وفتح التذكرة في <code>BMC Remedy</code></h1>
    <ul>
      <li><strong>أهم الإنذارات — الفئة <code>A1</code> (الأهم — حرج ومؤثر على الخدمة <code>Critical</code>):</strong> يستلزم استجابة فورية لوقف الخدمة على مسار رئيسي أو عقدة نقل (مثل <code>R_LOS</code> و<code>LOF</code>). تليه الفئة <strong><code>A2 (Major)</code></strong> لتأثير كبير أو فقد حماية، ثم <strong><code>A3 (Minor)</code></strong> للتنبيهات الثانوية غير القاطعة للخدمة.</li>
      <li><strong>عزل المشكلة الحقيقية:</strong> البحث دائماً عن <strong>أقدم إنذار قطع جذري (<code>LOS / LOF</code>)</strong> وعدم الخلط مع إنذارات <code>AIS</code> المرسلة نحو المصب أو <code>BDI/RDI</code> نحو المنبع، مع مطابقة الإشارة الضوئية وحالة <code>BGP</code> لتحديد هل العطل داخل المقسم أم في ليف <code>SNFN</code> أم لدى الشريك الخارجي.</li>
      <li><strong>خطوات فتح التذكرة في <code>BMC Remedy</code>:</strong> (1) الدخول واختيار <code>Create Incident</code> وتحديد <code>NTT</code> (عطل شبكة) أو <code>CTT</code> (عميل B2B منفرد) ← (2) إدخال الجهة و<code>Circuit / Service ID</code> والـ <code>POP</code> ← (3) صياغة عنوان موحّد <code>[Critical A1] R_LOS - [POP] - [Circuit] - [Impact]</code> ← (4) توثيق الوقت والقراءات في <code>Notes</code> ← (5) اختيار <code>Tier 1/2/3</code> ← (6) تحديد الأولوية <code>Critical / Major / Minor</code> ← (7) الإسناد إلى <code>NOC</code> أو <code>Transport Back Office</code> أو <code>FOPS/SNFN</code> أو <code>Power</code> ← (8) حفظ الرقم <code>INC00000...</code> وإضافته في التصعيدات وتحديث <code>Work Info</code> حتى الإغلاق وتوثيق <code>RCA</code>.</li>
    </ul>
  </div>

  <div class="page-break"></div>
  <div class="content-body">
    <div style="border-bottom: 2px solid #C0102A; padding-bottom: 6px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="border: none; margin: 0; padding: 0;">سابعًا: لوحة الرسوم البيانية والإحصائيات التشغيلية (الأسابيع 7–12)</h1>
        <p style="font-size: 10.5px; color: #64748B; font-weight: 700; margin: 2px 0 0 0;">توزيع تذاكر FTTH (452 تذكرة) وتدريب قسم النقل دون تذاكر (0) — من 11/10 إلى 19/11</p>
      </div>
      <span style="background: #E3F0EA; color: #2A6348; padding: 3px 10px; border-radius: 999px; font-weight: 800; font-size: 10.5px;">452 تذكرة FTTH | النقل: 0</span>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-title">إجمالي تذاكر FTTH</div><div class="kpi-value">${totalTickets}</div><div class="kpi-sub">الأسابيع 7–8 + 29/10 + أ12</div></div>
      <div class="kpi-card"><div class="kpi-title">أعلى ذروة يومية</div><div class="kpi-value" style="color: #C0102A;">97</div><div class="kpi-sub" style="color: #64748B;">بتاريخ 20 أكتوبر (الأسبوع 8)</div></div>
      <div class="kpi-card"><div class="kpi-title">تذاكر العودة (الأسبوع 12)</div><div class="kpi-value">~90</div><div class="kpi-sub" style="color: #64748B;">مع تطور أتمتة تذاكر FTTH</div></div>
      <div class="kpi-card"><div class="kpi-title">تذاكر الترانزبورت (أ9–11)</div><div class="kpi-value">0</div><div class="kpi-sub" style="color: #64748B;">تدريب ومشاهدة دون تذاكر</div></div>
    </div>

    <div class="charts-row">
      <div class="chart-panel">
        <div class="chart-panel-title">
          <span>1. توزيع تذاكر FTTH وتدريب النقل (الأسابيع 7–12)</span>
          <span style="color: #C0102A;">الترانزبورت: 0 تذاكر</span>
        </div>
        ${buildTimelineSvg(weeklyTimelineAr, true)}
      </div>

      <div class="chart-panel">
        <div class="chart-panel-title"><span>2. توزيع تذاكر FTTH حسب الفئات</span><span style="color:#64748B;">452 تذكرة FTTH</span></div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="position: relative; width: 112px; height: 112px; flex-shrink: 0;">
            <svg viewBox="0 0 140 140" style="width:100%; height:100%; transform:rotate(-90deg);">${donutCircles}</svg>
            <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;">
              <span style="font-size:18px; font-weight:900;">452</span>
              <span style="font-size:8.5px; color:#64748B; font-weight:700;">FTTH</span>
            </div>
          </div>
          <div style="flex:1; font-size:9.5px;">
            ${shareCategoriesP2.map((c) => `<div style="display:flex; justify-content:space-between; margin-bottom:2.5px;"><span style="font-weight:700;"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${c.color};margin-left:4px;"></span>${c.nameAr.split('(')[0]}</span><span style="font-weight:800;">${c.count} (${c.percent}%)</span></div>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="telemetry-row">
      <div class="telemetry-box">
        <div style="font-size:11px; font-weight:800; border-bottom:1px solid #E2E8F0; padding-bottom:4px; margin-bottom:7px;">3. قنوات معالجة تذاكر FTTH</div>
        <div style="font-size:10px; margin-bottom:5px;">
          <div style="display:flex; justify-content:space-between; font-weight:700;"><span>معالجة وإغلاق داخلي (Direct Handle)</span><span style="color:#10B981;">373 (82.5%)</span></div>
          <div style="height:6px; background:#E2E8F0; border-radius:999px;"><div style="height:100%; width:82.5%; background:#10B981; border-radius:999px;"></div></div>
        </div>
        <div style="font-size:10px; margin-bottom:5px;">
          <div style="display:flex; justify-content:space-between; font-weight:700;"><span>تصعيد للشركاء والميدان المتقدم</span><span style="color:#F59E0B;">79 (17.5%)</span></div>
          <div style="height:6px; background:#E2E8F0; border-radius:999px;"><div style="height:100%; width:17.5%; background:#F59E0B; border-radius:999px;"></div></div>
        </div>
        <div style="font-size:10px;">
          <div style="display:flex; justify-content:space-between; font-weight:700;"><span>نسبة الالتزام بمستوى الخدمة (SLA)</span><span style="color:#0284C7;">97.4%</span></div>
          <div style="height:6px; background:#E2E8F0; border-radius:999px;"><div style="height:100%; width:97.4%; background:#0284C7; border-radius:999px;"></div></div>
        </div>
      </div>
      <div class="telemetry-box">
        <div style="font-size:11px; font-weight:800; border-bottom:1px solid #E2E8F0; padding-bottom:4px; margin-bottom:7px;">4. خلاصة المعايير والأدوات المعتمدة</div>
        <table style="margin:0; font-size:9.8px;">
          <thead><tr><th>المجال</th><th>المعيار / المفهوم</th><th>النطاق</th></tr></thead>
          <tbody>
            <tr><td>FTTH Access</td><td>إشارة RX و CVLANs</td><td>-10 ~ -26 dBm | 1501/3980/1810</td></tr>
            <tr><td>B2B Transport</td><td>معمارية النقل والربط الدولي</td><td>DWDM / OTN / MPLS / SNFN</td></tr>
            <tr><td>NOC Monitoring</td><td>عزل الأعطال و Remedy</td><td>A1–A3 / OTDR / INC00000...</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <h1>ثامنًا: الخاتمة والتوصيات العملية</h1>
    <p>استكملت هذه الفترة التدريبية (<strong>من 11/10 إلى 19/11 — الأسابيع 7 إلى 12</strong>) الجمع بين الخبرة الميدانية في قسم الألياف الضوئية (<strong>331 تذكرة</strong> في الأسبوعين 7–8 إضافة لقرابة <strong>90 تذكرة موزعة</strong> عند العودة في الأسبوع 12 بالتوازي مع تطور أتمتة تذاكر القسم) وبين الفهم الهندسي الشامل لشبكات النقل التجارية (<code>B2B Transport</code>) عبر طبقات <code>DWDM</code> و<code>OTN</code> و<code>MPLS</code>، وشبكة <code>SNFN</code>، ومسارات الربط الدولية نحو لندن وألمانيا والأردن، وفحص الأعطال بجهاز <code>OTDR</code>، ومراقبة إنذارات <code>A1–A3</code> وإدارة تذاكر <code>BMC Remedy</code>.</p>
    <ol>
      <li>تعزيز الجلسات التطبيقية الميدانية لربط قراءات <code>OTDR</code> مباشرة بخرائط <code>GIS / KMZ</code> أثناء حوادث الألياف الوطنية <code>SNFN</code>.</li>
      <li>تضمين مخططات <code>As-Built</code> و<code>Circuit Layout Diagrams</code> المحدّثة ضمن بطاقات المتابعة لتسريع التعامل مع إنذارات الفئة <code>A1</code>.</li>
      <li>استمرار التنسيق المشترك بين فرق <code>FTTH</code> و<code>Transport NOC</code> لتقليص زمن الإصلاح العام عند تضرر الكابلات المغذية.</li>
    </ol>

    <div class="endorsement-box">
      <div style="text-align: center; font-weight: 900; font-size: 12.5px; border-bottom: 1px solid #CBD5E1; padding-bottom: 5px;">مصادقة واعتماد التقرير الميداني الرسمي</div>
      <div class="endorsement-grid">
        <div><div style="font-size:10.5px; color:#64748B; font-weight:700;">توقيع المتدرب</div><div style="font-weight:900;">${profile.studentName}</div><div class="sig-line"></div></div>
        <div><div style="font-size:10.5px; color:#64748B; font-weight:700;">المشرف الميداني (جهة التدريب)</div><div style="font-weight:900;">${profile.responsibleName}</div><div class="sig-line"></div></div>
        <div><div style="font-size:10.5px; color:#64748B; font-weight:700;">مشرف التدريب (الكلية)</div><div style="font-weight:900;">${profile.supervisorName}</div><div class="sig-line"></div></div>
      </div>
    </div>
  </div>
</body>
</html>`;

const buildEnglishHtml = () => `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <title>Second Periodic Report - Oct 11 to Nov 19 - ${profile.studentName}</title>
  <style>${sharedStyles(false)}</style>
</head>
<body>
  <div class="cover-container">
    <div class="cover-header">
      <div class="header-box" style="text-align: left;">
        <div style="font-weight: 900; font-size: 12px;">Kingdom of Saudi Arabia</div>
        <div>Technical &amp; Vocational Training Corporation</div>
        <div style="color: #C0102A; font-weight: 800;">College of Telecom &amp; Information — Riyadh</div>
        <div>Cooperative Training Department</div>
      </div>
      <div style="text-align: center;">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: #F6DDE1; color: #C0102A; display: inline-flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; border: 2px solid #C0102A;">COOP</div>
        <div style="font-size: 9.5px; font-weight: 800; color: #686560; margin-top: 4px;">Cooperative Engineering Report</div>
      </div>
      <div class="header-box" style="text-align: right;">
        <div style="font-weight: 900; font-size: 12px;">Huawei Saudi Arabia — Riyadh</div>
        <div style="color: #686560;">FTTH Operations &amp; Transport Networks</div>
        <div style="font-size: 10px; color: #9E9A93;">B2B Carrier Backbone &amp; Access Support</div>
      </div>
    </div>

    <div style="margin: auto 0; text-align: center;">
      <div class="cover-title-badge">Oct 11 – Nov 19 (Weeks 7–12)</div>
      <h1 class="cover-title">Second Periodic Cooperative Training Report</h1>
      <p class="cover-subtitle">FTTH Access Operations &amp; Transport Networks Domain (B2B Carrier Backbone)</p>

      <div class="matrix-grid" style="text-align: left;">
        <div class="matrix-row"><span class="matrix-label">Trainee Name:</span><span class="matrix-val" style="color: #C0102A;">${profile.studentName}</span></div>
        <div class="matrix-row"><span class="matrix-label">Academic ID:</span><span class="matrix-val">${profile.trainingNumber}</span></div>
        <div class="matrix-row"><span class="matrix-label">Training Field:</span><span class="matrix-val">FTTH Access &amp; B2B Transport Networks</span></div>
        <div class="matrix-row"><span class="matrix-label">Department:</span><span class="matrix-val">FTTH Operations &amp; Transport NOC</span></div>
        <div class="matrix-row"><span class="matrix-label">Field Supervisor:</span><span class="matrix-val">${profile.responsibleName}</span></div>
        <div class="matrix-row"><span class="matrix-label">Reporting Period:</span><span class="matrix-val" style="color: #C0102A;">Oct 11 – Nov 19 (6 Weeks)</span></div>
        <div class="matrix-full">
          <span style="font-weight: 900;">Operational Assignment:</span>
          <span style="font-weight: 900; color: #C0102A;">Active FTTH Specialist (Weeks 7–8 &amp; 12) &amp; Transport Networks Trainee (Weeks 9–11)</span>
        </div>
      </div>

      <div class="intervals-container" style="text-align: left;">
        <div class="intervals-header">
          <span style="font-weight: 900; font-size: 11.5px;">Training Scope &amp; Phase Milestones (Weeks 7–12):</span>
          <div>
            <span style="background: #E3F0EA; color: #2A6348; padding: 2px 9px; border-radius: 999px; font-weight: 800; font-size: 10px;">452 FTTH Tickets | Transport: 0</span>
            <span style="color: #C0102A; font-weight: 900; font-size: 11px; margin-left: 6px;">Oct 11 – Nov 19</span>
          </div>
        </div>
        <div class="intervals-grid">
          <div class="interval-card">
            <div class="interval-card-title">Weeks 7–8 (Oct 11 – Oct 21): Active FTTH Operations</div>
            <div class="interval-card-meta"><span>331 Tickets Handled</span><span style="color:#C0102A;">Peak: 97 Tickets (Oct 20)</span></div>
          </div>
          <div class="interval-card">
            <div class="interval-card-title">Weeks 9–11 (Oct 25 – Nov 12): B2B Transport Networks Training</div>
            <div class="interval-card-meta"><span>Training Only (0 Tickets)</span><span style="color:#C0102A;">DWDM / OTN / MPLS / SNFN</span></div>
          </div>
          <div class="interval-card">
            <div class="interval-card-title">Week 11 (Nov 08 – Nov 12): Topologies, A1 Alarms &amp; Global Transit</div>
            <div class="interval-card-meta"><span>Alarm Classes A1–A3</span><span style="color:#C0102A;">London / Frankfurt / Jordan</span></div>
          </div>
          <div class="interval-card">
            <div class="interval-card-title">Week 12 (Nov 15 – Nov 19): Return to FTTH Operations</div>
            <div class="interval-card-meta"><span>~90 Distributed Tickets</span><span style="color:#C0102A;">Evolved FTTH Automation</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <span>KSA — Second Periodic Cooperative Training Report (Oct 11 – Nov 19)</span>
      <span style="color: #C0102A; font-weight: 900;">Official Cover Page</span>
    </div>
  </div>

  <div class="page-break"></div>
  <div class="content-body">
    <h1>Introduction &amp; Reporting Scope (Weeks 7–12 | Oct 11 – Nov 19)</h1>
    <p>This Second Periodic Report documents six consecutive weeks of cooperative engineering training conducted from <strong>October 11 to November 19 (Weeks 7 through 12)</strong> across two complementary tiers of telecom operations:</p>
    <ol>
      <li><strong>Weeks 7 &amp; 8 (<code>Oct 11 – Oct 21</code>) — Active FTTH Specialist:</strong> Executed full live subscriber diagnostics and handover queue triage across <strong>331 resolved cases</strong>, including a single-shift peak of <strong>97 tickets on October 20</strong> at <strong>97.4% SLA compliance</strong>.</li>
      <li><strong>Weeks 9, 10 &amp; 11 (<code>Oct 25 – Nov 12</code>, including Week 11: <code>Nov 08 – Nov 12</code>) — Transport Networks Trainee (<code>B2B Domain</code> — Observation Only, 0 Tickets Assigned):</strong> Completed strictly as <strong>technical training and live NOC shadowing without receiving any tickets (<code>0 tickets</code>)</strong>, studying <code>DWDM</code>, <code>OTN</code>, and <code>MPLS</code> core operations, <code>SNFN</code> national backbone routing, international internet transport corridors linking Saudi Arabia to <strong>London, Frankfurt (Germany), Jordan, and neighboring Arab countries</strong>, network topology planning and diagram ownership, optical hardware shelves and cable classes, <code>OTDR</code> fiber-cut pinpointing, <code>A1–A3</code> alarm severity classes, and <code>BMC Remedy</code> incident ticketing workflows.</li>
      <li><strong>Week 12 (<code>Nov 15 – Nov 19</code>) — Return to FTTH Operations:</strong> Rejoined the FTTH desk and processed <strong>approximately 90 distributed tickets</strong> across operational categories while department ticketing automation continued evolving to automatically intake and route routine ticket types.</li>
    </ol>

    <h1>1. Active FTTH Operations (Weeks 7–8) &amp; Week 12 Return</h1>
    <ul>
      <li><strong>Diagnostic &amp; Provisioning Standards:</strong> Verified active billing profiles in <code>MOSS</code>, regional access domain (<code>Huawei NCE</code> vs. <code>Nokia AMS</code>), received optical power within <code>-10 dBm to -26 dBm</code>, and subscriber <code>CVLAN</code> mappings (<code>1501 HSI</code>, <code>3980 ACS</code>, <code>1810 VoIP</code>) prior to direct closure or field/operator escalation.</li>
    </ul>
    <table>
      <thead>
        <tr><th>Date / Snapshot</th><th>Total</th><th>CCS</th><th>Call Centre</th><th>Open Access</th><th>Resolved</th><th>TLS</th><th>Pending NOC</th><th>OSS</th><th>NAS</th><th>Notes</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Oct 11</strong></td><td><strong>40</strong></td><td>10</td><td>15</td><td>7</td><td>6</td><td>0</td><td>2</td><td>0</td><td>0</td><td>Week 7 FTTH handover baseline</td></tr>
        <tr><td><strong>Oct 19</strong></td><td><strong>16</strong></td><td>6</td><td>6</td><td>2</td><td>2</td><td>0</td><td>0</td><td>0</td><td>0</td><td>100% triage accuracy</td></tr>
        <tr><td><strong>Oct 20</strong></td><td><strong>97</strong></td><td>34</td><td>30</td><td>9</td><td>16</td><td>3</td><td>2</td><td>1</td><td>2</td><td><strong>Record Peak</strong> (incl. <code>INC000003443563</code>)</td></tr>
        <tr><td><strong>Oct 21</strong></td><td><strong>45</strong></td><td>25</td><td>11</td><td>6</td><td>3</td><td>0</td><td>0</td><td>0</td><td>0</td><td>Progressed from 36 to 45</td></tr>
        <tr><td><strong>Oct 29</strong></td><td><strong>31</strong></td><td>16</td><td>3</td><td>5</td><td>3</td><td>2</td><td>0</td><td>2</td><td>0</td><td>FTTH handover shift (Transport = 0; <code>INC000003464990</code>–<code>3461185</code>)</td></tr>
      </tbody>
    </table>

    <table>
      <thead><tr><th>Week</th><th>Dates</th><th>Assignment</th><th>Tickets Handled</th><th>Operational Focus</th></tr></thead>
      <tbody>
        <tr><td><strong>Week 7</strong></td><td>Oct 11 – Oct 15</td><td>FTTH Specialist</td><td>138 FTTH</td><td>CCS, Call Centre &amp; Open Access live execution</td></tr>
        <tr><td><strong>Week 8</strong></td><td>Oct 18 – Oct 22</td><td>FTTH Specialist</td><td>193 FTTH</td><td>Single-shift peak of <strong>97 tickets (Oct 20)</strong> and 45 on Oct 21</td></tr>
        <tr><td><strong>Week 9</strong></td><td>Oct 25 – Oct 29</td><td>Transport Trainee + Oct 29 FTTH</td><td>0 Trans (31 FTTH)</td><td><strong>0 Transport tickets</strong> (training only); 31 FTTH tickets captured Oct 29</td></tr>
        <tr><td><strong>Week 10</strong></td><td>Nov 01 – Nov 05</td><td>Transport Trainee</td><td>0 Tickets</td><td><strong>Technical Training &amp; Observation Only — No Tickets Assigned</strong></td></tr>
        <tr><td><strong>Week 11</strong></td><td><strong>Nov 08 – Nov 12</strong></td><td><strong>Transport Trainee</strong></td><td><strong>0 Tickets</strong></td><td><strong>Technical Training &amp; Observation Only — No Tickets Assigned</strong></td></tr>
        <tr><td><strong>Week 12</strong></td><td><strong>Nov 15 – Nov 19</strong></td><td><strong>Returned to FTTH</strong></td><td><strong>~90 FTTH</strong></td><td>~90 distributed tickets alongside evolved FTTH ticketing automation</td></tr>
        <tr><td><strong>Total</strong></td><td><strong>Oct 11 – Nov 19</strong></td><td><strong>Weeks 7–12</strong></td><td><strong>452 FTTH</strong></td><td><strong>0 Transport Tickets | 97.4% SLA Target Compliance</strong></td></tr>
      </tbody>
    </table>

    <h1>2. The B2B Nature of Transport &amp; Stakeholders</h1>
    <p>Unlike residential <code>FTTH</code> support (<code>B2C</code>), <strong>Transport Networks operate on a Business-to-Business (<code>B2B</code>) model</strong> where customers are licensed telecom operators, ISPs, enterprises, banks, or ministries leasing high-capacity trunks and protected circuits. External and internal stakeholders include domestic Saudi carriers (<code>STC</code>, <code>Mobily</code>, <code>Zain</code>, <code>Salam/ITC</code>, <code>Dawiyat</code>, <code>GO</code>), the national fiber consortium (<code>SNFN</code>), global transit carriers (<code>TATA</code>, <code>GCX</code>, regional Arab carriers), European IXPs (<code>LINX London</code>, <code>DE-CIX Frankfurt</code>), and internal units (<code>NOC</code>, <code>Back Office</code>, <code>Network Planning</code>, <code>FOPS</code>, <code>Power</code>, <code>B-Care</code>).</p>

    <h1>3. Core Transport Stack: How DWDM, OTN &amp; MPLS Work Together</h1>
    <table>
      <thead><tr><th>Layer / Technology</th><th>Transport Unit &amp; Equipment</th><th>Engineering Role in B2B Carrier Backbones</th></tr></thead>
      <tbody>
        <tr><td><strong>DWDM (L0/L1 Optical)</strong></td><td>40–120 C-Band Wavelengths (<code>OptiX OSN / NCS 2000 / 1830 PSS</code>)</td><td>Multiplexes multiple 10G–400G optical channels over a single fiber pair with <code>ROADM</code> switching, <code>EDFA</code> amplifiers &amp; <code>OSC</code> supervision.</td></tr>
        <tr><td><strong>OTN (ITU-T G.709 L1)</strong></td><td><code>OPUk → ODUk → OTUk</code> Frames</td><td>Adds standardized digital framing, Forward Error Correction (<code>FEC</code>), multi-operator SLA <code>TCM</code>, and <code>&lt;50ms SNCP 1+1</code> switching.</td></tr>
        <tr><td><strong>MPLS Core (L2.5 Packet)</strong></td><td>Labeled Packets / <code>LSPs</code> (<code>NE40E / ASR 9000</code>)</td><td>Fast label switching between <code>PE</code> and <code>P</code> routers, strict <code>VRF</code> isolation per B2B customer (<code>MP-BGP</code>), <code>QoS</code> &amp; <code>FRR (&lt;50ms)</code>.</td></tr>
      </tbody>
    </table>

    <h1>4. Network Topologies, Diagram Ownership, SNFN &amp; Global Transit</h1>
    ${architectureSvgHtml(false)}
    <ul>
      <li><strong>Network Topologies &amp; Diagram Ownership:</strong> Point-to-Point (linear), Ring (<code>SNCP 1+1 &lt;50ms</code> reversal), Core Mesh (<code>ROADM / MPLS</code> multi-path redundancy), and Dual-Homed B2B Hub-and-Spoke (<code>PE-1 / PE-2</code>). <strong>Network Planning Engineering</strong> produces <code>HLD/LLD</code> designs, <strong>Provisioning &amp; Partner Teams</strong> send <code>Circuit Layout Records (CLR)</code> on handoff, and <strong>OSP / SNFN Fiber Engineering</strong> maintains georeferenced <code>As-Built &amp; GIS/KMZ</code> maps.</li>
      <li><strong>SNFN &amp; Routing Outside Saudi Arabia:</strong> The <strong>Saudi National Fiber Network (<code>SNFN</code>)</strong> (~19,000+ km domestic backbone operated by Salam and Mobily) aggregates national POPs toward terrestrial cross-border links to <strong>Jordan (Amman/Aqaba)</strong> and neighboring Arab states (UAE, Bahrain, Kuwait, Oman, Qatar, Iraq, Egypt), and submarine cable landing stations in <strong>Jeddah (Red Sea)</strong> and <strong>Al-Khobar (Gulf)</strong> carrying systems such as <code>FALCON</code>, <code>FEA</code>, <code>SEA-ME-WE</code>, <code>IMEWE</code>, <code>AAE-1</code>, <code>2Africa</code>, and <code>Medusa</code> onward to <strong>London (<code>LINX</code>)</strong> and <strong>Frankfurt, Germany (<code>DE-CIX</code>)</strong> for global IP Transit and Peering.</li>
    </ul>

    <h1>5. Transport Equipment, Fiber Cable Types &amp; Exact OTDR Cut Pinpointing</h1>
    ${hardwarePlatesHtml(false)}
    <ul>
      <li><strong>Hardware &amp; Cable Portfolio:</strong> Optical shelves (<code>Huawei OptiX OSN</code>, <code>Cisco NCS 2000/1000</code>, <code>Nokia 1830 PSS</code>, <code>Ciena 6500</code>), MPLS routers (<code>Huawei NE40E/NE8000</code>, <code>Cisco ASR 9000</code>, <code>Juniper MX</code>), field tools (<code>OTDR</code>, <code>Fusion Splicer</code>, <code>OPM</code>, <code>VFL</code>, <code>OSA</code>); plus Yellow <code>SMF OS2 (9/125 µm)</code> indoor patchcords, Aqua <code>MMF</code> short-reach jumpers, corrugated steel armored underground trunks (<code>SNFN</code>), heavy steel-armored submarine cables with copper power conductors, and dual <code>-48V DC</code> power cabling.</li>
      <li><strong>Pinpointing Cuts via OTDR:</strong> Injects test laser pulses at the <code>ODF</code>, detects the sharp Fresnel break reflection, computes break distance via <strong><code>d = (c × t) / (2 × n)</code></strong> (<code>n ≈ 1.468</code>), correlates with <code>GIS/KMZ</code> maps (accounting for manhole slack) to locate the exact dig site/manhole, and dispatches <code>FOPS</code> for fusion splicing and trace verification.</li>
    </ul>

    <h1>6. NOC Monitoring: A1–A3 Alarms, Isolation &amp; BMC Remedy Ticketing</h1>
    <ul>
      <li><strong>Alarm Severity Classes:</strong> <strong><code>A1</code> (Critical — Primary Monitored Class)</strong> indicates active or imminent service disruption (e.g., <code>R_LOS</code> fiber cut or <code>LOF</code> frame misalignment) requiring immediate escalation; <strong><code>A2</code> (Major)</strong> indicates severe degradation or lost redundancy; <strong><code>A3</code> (Minor)</strong> flags non-service-affecting anomalies.</li>
      <li><strong>Root-Cause Isolation &amp; 8-Step BMC Remedy Workflow:</strong> Trace the earliest physical <code>LOS/LOF</code> rather than downstream cascading <code>AIS</code> or upstream <code>BDI/RDI</code> alarms. Then log into <code>BMC Remedy</code>: select <code>NTT</code>/<code>CTT</code> → attach B2B entity &amp; Circuit ID → write standardized <code>[Critical A1]</code> Summary → document timestamps, slot/port &amp; optical/BGP telemetry → select Tier 1/2/3 categories → set <code>Critical/Major</code> priority → route to <code>NOC</code>, <code>Transport Back Office</code>, <code>FOPS/SNFN</code>, or <code>Power</code> → track generated <code>INC00000...</code> ID through Work Info updates and verified RCA closure.</li>
    </ul>
  </div>

  <div class="page-break"></div>
  <div class="content-body">
    <div style="border-bottom: 2px solid #C0102A; padding-bottom: 6px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="border: none; margin: 0; padding: 0;">7. Operational Analytics &amp; Performance Dashboard (Weeks 7–12)</h1>
        <p style="font-size: 10.5px; color: #64748B; font-weight: 700; margin: 2px 0 0 0;">FTTH Ticket Metrics (452 Tickets) &amp; Zero-Ticket Transport Training (Oct 11 – Nov 19)</p>
      </div>
      <span style="background: #E3F0EA; color: #2A6348; padding: 3px 10px; border-radius: 999px; font-weight: 800; font-size: 10.5px;">452 FTTH | Transport: 0</span>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-title">Total FTTH Tickets</div><div class="kpi-value">${totalTickets}</div><div class="kpi-sub">W7–8 + Oct 29 + W12</div></div>
      <div class="kpi-card"><div class="kpi-title">Single-Shift Peak</div><div class="kpi-value" style="color: #C0102A;">97</div><div class="kpi-sub" style="color: #64748B;">Oct 20 (Week 8)</div></div>
      <div class="kpi-card"><div class="kpi-title">Week 12 FTTH Return</div><div class="kpi-value">~90</div><div class="kpi-sub" style="color: #64748B;">With Evolved Automation</div></div>
      <div class="kpi-card"><div class="kpi-title">Transport Tickets (W9–11)</div><div class="kpi-value">0</div><div class="kpi-sub" style="color: #64748B;">Training Only — No Tickets</div></div>
    </div>

    <div class="charts-row">
      <div class="chart-panel">
        <div class="chart-panel-title"><span>1. FTTH Tickets &amp; Transport Weeks (W7–12)</span><span style="color: #C0102A;">Transport: 0 Tickets</span></div>
        ${buildTimelineSvg(weeklyTimelineEn, false)}
      </div>
      <div class="chart-panel">
        <div class="chart-panel-title"><span>2. FTTH Category Breakdown</span><span style="color:#64748B;">452 FTTH</span></div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="position: relative; width: 112px; height: 112px; flex-shrink: 0;">
            <svg viewBox="0 0 140 140" style="width:100%; height:100%; transform:rotate(-90deg);">${donutCircles}</svg>
            <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;">
              <span style="font-size:18px; font-weight:900;">452</span>
              <span style="font-size:8.5px; color:#64748B; font-weight:700;">FTTH</span>
            </div>
          </div>
          <div style="flex:1; font-size:9.5px;">
            ${shareCategoriesP2.map((c) => `<div style="display:flex; justify-content:space-between; margin-bottom:2.5px;"><span style="font-weight:700;"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${c.color};margin-right:4px;"></span>${c.nameEn}</span><span style="font-weight:800;">${c.count} (${c.percent}%)</span></div>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="telemetry-row">
      <div class="telemetry-box">
        <div style="font-size:11px; font-weight:800; border-bottom:1px solid #E2E8F0; padding-bottom:4px; margin-bottom:7px;">3. FTTH Handling Channels &amp; SLA</div>
        <div style="font-size:10px; margin-bottom:5px;">
          <div style="display:flex; justify-content:space-between; font-weight:700;"><span>Direct Internal Handle</span><span style="color:#10B981;">373 (82.5%)</span></div>
          <div style="height:6px; background:#E2E8F0; border-radius:999px;"><div style="height:100%; width:82.5%; background:#10B981; border-radius:999px;"></div></div>
        </div>
        <div style="font-size:10px; margin-bottom:5px;">
          <div style="display:flex; justify-content:space-between; font-weight:700;"><span>Carrier &amp; Advanced Escalations</span><span style="color:#F59E0B;">79 (17.5%)</span></div>
          <div style="height:6px; background:#E2E8F0; border-radius:999px;"><div style="height:100%; width:17.5%; background:#F59E0B; border-radius:999px;"></div></div>
        </div>
        <div style="font-size:10px;">
          <div style="display:flex; justify-content:space-between; font-weight:700;"><span>SLA Compliance Target</span><span style="color:#0284C7;">97.4%</span></div>
          <div style="height:6px; background:#E2E8F0; border-radius:999px;"><div style="height:100%; width:97.4%; background:#0284C7; border-radius:999px;"></div></div>
        </div>
      </div>
      <div class="telemetry-box">
        <div style="font-size:11px; font-weight:800; border-bottom:1px solid #E2E8F0; padding-bottom:4px; margin-bottom:7px;">4. Core Systems &amp; Benchmarks</div>
        <table style="margin:0; font-size:9.8px;">
          <thead><tr><th>Domain</th><th>Standard / Scope</th><th>Verification</th></tr></thead>
          <tbody>
            <tr><td>FTTH Access</td><td>RX Power &amp; CVLANs</td><td>-10 ~ -26 dBm | 1501/3980/1810</td></tr>
            <tr><td>B2B Transport</td><td>Backbone &amp; Int'l Transit</td><td>DWDM / OTN / MPLS / SNFN</td></tr>
            <tr><td>NOC Tooling</td><td>Alarms, Cut Locator &amp; ITSM</td><td>A1–A3 / OTDR / BMC Remedy</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <h1>8. Challenges, Conclusion &amp; Practical Recommendations</h1>
    <p>Bridging active <code>FTTH</code> execution (<strong>331 tickets</strong> in Weeks 7–8 plus <strong>~90 distributed tickets</strong> upon returning in Week 12 alongside evolved ticketing automation) with <code>B2B</code> Transport training across Weeks 9–11 (Oct 11 – Nov 19) built a clear end-to-end understanding of how subscriber fiber aggregates onto national <code>SNFN</code> trunks and international gateways reaching Jordan, Arab neighbors, Frankfurt, and London.</p>
    <ol>
      <li>Integrate real-time <code>OTDR</code> cut distances directly with <code>GIS / KMZ</code> fiber maps in NOC field dispatches to shorten mean time to repair on national trunks.</li>
      <li>Attach updated <code>Circuit Layout Records</code> directly inside <code>BMC Remedy</code> tickets for rapid B2B troubleshooting during <code>A1</code> outages.</li>
      <li>Maintain structured operational synchronization between <code>FTTH</code> and <code>Transport NOC</code> engineering teams whenever shared feeder cables are impacted.</li>
    </ol>

    <div class="endorsement-box">
      <div style="text-align: center; font-weight: 900; font-size: 12.5px; border-bottom: 1px solid #CBD5E1; padding-bottom: 5px;">Official Supervisory Endorsements</div>
      <div class="endorsement-grid">
        <div><div style="font-size:10.5px; color:#64748B; font-weight:700;">Trainee Signature</div><div style="font-weight:900;">${profile.studentName}</div><div class="sig-line"></div></div>
        <div><div style="font-size:10.5px; color:#64748B; font-weight:700;">Field Supervisor</div><div style="font-weight:900;">${profile.responsibleName}</div><div class="sig-line"></div></div>
        <div><div style="font-size:10.5px; color:#64748B; font-weight:700;">Academic Supervisor</div><div style="font-weight:900;">${profile.supervisorName}</div><div class="sig-line"></div></div>
      </div>
    </div>
  </div>
</body>
</html>`;

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const renderPdf = (html, tempName, dlPath, deskPath) => {
  const tempPath = path.resolve(process.cwd(), tempName);
  fs.writeFileSync(tempPath, html, 'utf8');
  console.log(`Rendering ${path.basename(dlPath)} via Microsoft Edge Headless...`);
  spawnSync(
    edgePath,
    ['--headless', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${dlPath}`, tempPath],
    { stdio: 'inherit' }
  );
  if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  if (fs.existsSync(dlPath)) {
    fs.copyFileSync(dlPath, deskPath);
    console.log(`Saved: ${dlPath} & ${deskPath}`);
  } else {
    console.error(`Failed to render ${dlPath}`);
  }
};

renderPdf(
  buildArabicHtml(),
  'temp_periodic_p2_ar.html',
  'C:\\Users\\0iprx\\Downloads\\التقرير_الفتري_الثاني_عبدالله_المطيري.pdf',
  'C:\\Users\\0iprx\\Desktop\\التقرير_الفتري_الثاني_عبدالله_المطيري.pdf'
);

renderPdf(
  buildEnglishHtml(),
  'temp_periodic_p2_en.html',
  'C:\\Users\\0iprx\\Downloads\\Second_Periodic_Report_Abdullah_Almutairi.pdf',
  'C:\\Users\\0iprx\\Desktop\\Second_Periodic_Report_Abdullah_Almutairi.pdf'
);
