import React from 'react';

interface DiagramProps {
  isReportAr: boolean;
}

/**
 * Vector architectural & operational diagrams covering:
 * 1. Layered B2B Transport Stack (MPLS / OTN / DWDM) + International Internet Routing (SNFN -> Jordan, Arab States, Frankfurt, London).
 * 2. Network Topologies (Point-to-Point, Ring, Mesh, Dual-Homed) + OTDR Exact Fiber-Cut Localization.
 */
export const TransportArchitectureDiagrams: React.FC<DiagramProps> = ({ isReportAr }) => {
  return (
    <div className="my-5 space-y-5 print:my-3 print:space-y-3">
      {/* ── Figure 1: Layered Transport Architecture & International Transit ── */}
      <figure className="p-4 bg-card border border-line rounded-2xl print:border-slate-300 print:rounded-xl print:p-3 break-inside-avoid shadow-2xs">
        <figcaption className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-3 border-b border-line/70 text-xs font-black text-ink">
          <span>
            {isReportAr
              ? 'شكل (1): المعمارية الطبقية لشبكة النقل (DWDM / OTN / MPLS) ومسار عبور الإنترنت الدولي عبر SNFN'
              : 'Figure 1: Multi-Layer Transport Architecture (DWDM / OTN / MPLS) & International Transit Flow via SNFN'}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-dim text-accent border border-accent/20">
            {isReportAr ? 'هندسة التراسل B2B والربط الدولي' : 'B2B Carrier Backbone & Global Transit'}
          </span>
        </figcaption>

        <div className="w-full overflow-x-auto" dir="ltr">
          <svg
            viewBox="0 0 820 430"
            className="w-full h-auto max-w-full block mx-auto"
            role="img"
            aria-label="Transport Layered Architecture and International Transit Diagram"
          >
            <defs>
              <marker id="arrowSlate" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155" />
              </marker>
              <marker id="arrowBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7" />
              </marker>
              <marker id="arrowTeal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#0f766e" />
              </marker>
            </defs>

            {/* Panel A Header */}
            <rect x="10" y="6" width="800" height="196" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
            <text x="410" y="24" textAnchor="middle" fontSize="11.5" fontWeight="900" fill="#0f172a">
              {isReportAr
                ? '1. التكامل الطبقي: نقل حركة الشركات والإنترنت فوق DWDM و OTN و MPLS'
                : '1. Protocol Stack Encapsulation: IP/MPLS Over OTN & DWDM Optical Backbone'}
            </text>

            {/* Layer 3: MPLS */}
            <rect x="24" y="34" width="772" height="46" rx="8" fill="#eff6ff" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="36" y="52" fontSize="10.5" fontWeight="900" fill="#1d4ed8">MPLS Layer (L2.5)</text>
            <text x="36" y="68" fontSize="9.5" fontWeight="700" fill="#334155">
              {isReportAr ? 'توجيه بالملصقات وعزل VRF لعملاء B2B' : 'Label Switching (LSP), VRF Isolation, FRR < 50ms'}
            </text>
            <rect x="295" y="42" width="110" height="30" rx="5" fill="#ffffff" stroke="#60a5fa" />
            <text x="350" y="60" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#0f172a">CE (Customer Edge)</text>
            <line x1="405" y1="57" x2="430" y2="57" stroke="#0284c7" strokeWidth="1.8" markerEnd="url(#arrowBlue)" />
            <rect x="434" y="42" width="128" height="30" rx="5" fill="#ffffff" stroke="#2563eb" />
            <text x="498" y="60" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#0f172a">PE (NE40E / ASR9K)</text>
            <line x1="562" y1="57" x2="587" y2="57" stroke="#0284c7" strokeWidth="1.8" markerEnd="url(#arrowBlue)" />
            <rect x="591" y="42" width="94" height="30" rx="5" fill="#ffffff" stroke="#60a5fa" />
            <text x="638" y="60" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#0f172a">P (Core Router)</text>
            <line x1="685" y1="57" x2="710" y2="57" stroke="#0284c7" strokeWidth="1.8" markerEnd="url(#arrowBlue)" />
            <rect x="714" y="42" width="70" height="30" rx="5" fill="#dbeafe" stroke="#2563eb" />
            <text x="749" y="60" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#1e3a8a">IGW / PE</text>

            {/* Layer 2: OTN */}
            <rect x="24" y="88" width="772" height="46" rx="8" fill="#f0fdfa" stroke="#0d9488" strokeWidth="1.5" />
            <text x="36" y="106" fontSize="10.5" fontWeight="900" fill="#0f766e">OTN Wrapper (ITU-T G.709)</text>
            <text x="36" y="122" fontSize="9.5" fontWeight="700" fill="#334155">
              {isReportAr ? 'تغليف رقمي + تصحيح أخطاء FEC + مراقبة SLA' : 'Digital Envelope, FEC Error Correction & Path OAM'}
            </text>
            <rect x="295" y="96" width="110" height="30" rx="5" fill="#ffffff" stroke="#14b8a6" />
            <text x="350" y="114" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#0f172a">OPUk (Payload)</text>
            <line x1="405" y1="111" x2="430" y2="111" stroke="#0f766e" strokeWidth="1.8" markerEnd="url(#arrowTeal)" />
            <rect x="434" y="96" width="128" height="30" rx="5" fill="#ffffff" stroke="#0d9488" />
            <text x="498" y="114" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#0f172a">ODUk (Path / TCM)</text>
            <line x1="562" y1="111" x2="587" y2="111" stroke="#0f766e" strokeWidth="1.8" markerEnd="url(#arrowTeal)" />
            <rect x="591" y="96" width="193" height="30" rx="5" fill="#ccfbf1" stroke="#0f766e" />
            <text x="687" y="114" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#134e4a">OTUk + FEC + SNCP 1+1 (&lt;50ms)</text>

            {/* Layer 1: DWDM */}
            <rect x="24" y="142" width="772" height="48" rx="8" fill="#fef2f2" stroke="#dc2626" strokeWidth="1.5" />
            <text x="36" y="160" fontSize="10.5" fontWeight="900" fill="#b91c1c">DWDM Optical Layer (L0/L1)</text>
            <text x="36" y="176" fontSize="9.5" fontWeight="700" fill="#334155">
              {isReportAr ? 'تعدد أطوال موجية (40–120 قناة) على ليف واحد' : '40–120 Wavelengths (C-Band) Over Single Fiber'}
            </text>
            <rect x="295" y="151" width="110" height="30" rx="5" fill="#ffffff" stroke="#f87171" />
            <text x="350" y="169" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#0f172a">Transponder (OTU)</text>
            <line x1="405" y1="166" x2="430" y2="166" stroke="#334155" strokeWidth="1.8" markerEnd="url(#arrowSlate)" />
            <rect x="434" y="151" width="128" height="30" rx="5" fill="#ffffff" stroke="#ef4444" />
            <text x="498" y="169" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#0f172a">MUX / ROADM</text>
            <line x1="562" y1="166" x2="587" y2="166" stroke="#334155" strokeWidth="1.8" markerEnd="url(#arrowSlate)" />
            <rect x="591" y="151" width="193" height="30" rx="5" fill="#fee2e2" stroke="#dc2626" />
            <text x="687" y="169" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#7f1d1d">EDFA Amplifiers + OSC (SMF Trunk)</text>

            {/* Panel B: SNFN & International Transit */}
            <rect x="10" y="214" width="800" height="208" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
            <text x="410" y="232" textAnchor="middle" fontSize="11.5" fontWeight="900" fill="#0f172a">
              {isReportAr
                ? '2. مسار نقل الإنترنت خارج المملكة (الشبكة الوطنية SNFN ← المعابر البرية والبحرية ← أوروبا والدول العربية)'
                : '2. International Internet Transport: Saudi SNFN Backbone → Regional Cross-Border & European Hubs'}
            </text>

            {/* Domestic SNFN Node */}
            <rect x="24" y="252" width="195" height="148" rx="9" fill="#ffffff" stroke="#0f766e" strokeWidth="2" />
            <rect x="24" y="252" width="195" height="28" rx="9" fill="#0f766e" />
            <text x="121" y="270" textAnchor="middle" fontSize="10.5" fontWeight="900" fill="#ffffff">SNFN &amp; Saudi Core POPs</text>
            <text x="121" y="297" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#0f172a">Riyadh | Jeddah | Al-Khobar</text>
            <text x="121" y="315" textAnchor="middle" fontSize="8.8" fontWeight="700" fill="#475569">Salam (ITC) &amp; Mobily Backbone</text>
            <text x="121" y="331" textAnchor="middle" fontSize="8.8" fontWeight="700" fill="#475569">~19,000+ km National Fiber</text>
            <rect x="38" y="344" width="167" height="44" rx="6" fill="#f0fdfa" stroke="#99f6e4" />
            <text x="121" y="362" textAnchor="middle" fontSize="8.8" fontWeight="800" fill="#0f766e">IGW &amp; B2B Carrier Handover</text>
            <text x="121" y="378" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#334155">STC • Mobily • Zain • Dawiyat</text>

            {/* Path 1: Terrestrial Cross-Border */}
            <line x1="219" y1="292" x2="275" y2="274" stroke="#0284c7" strokeWidth="2.2" markerEnd="url(#arrowBlue)" />
            <rect x="280" y="246" width="235" height="62" rx="8" fill="#ffffff" stroke="#0284c7" strokeWidth="1.6" />
            <text x="397" y="264" textAnchor="middle" fontSize="10" fontWeight="900" fill="#0369a1">Terrestrial Cross-Border Gateways</text>
            <text x="397" y="280" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0f172a">Jordan (Amman / Aqaba Hub)</text>
            <text x="397" y="296" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#475569">UAE • Bahrain • Kuwait • Oman • Egypt • Iraq</text>

            {/* Path 2: Submarine Landing Stations */}
            <line x1="219" y1="358" x2="275" y2="358" stroke="#0f766e" strokeWidth="2.2" markerEnd="url(#arrowTeal)" />
            <rect x="280" y="324" width="235" height="76" rx="8" fill="#ffffff" stroke="#0f766e" strokeWidth="1.6" />
            <text x="397" y="342" textAnchor="middle" fontSize="10" fontWeight="900" fill="#0f766e">Submarine Cable Landing Stations</text>
            <text x="397" y="358" textAnchor="middle" fontSize="8.8" fontWeight="700" fill="#0f172a">Jeddah (Red Sea) &amp; Al-Khobar (Gulf)</text>
            <text x="397" y="374" textAnchor="middle" fontSize="8.3" fontWeight="700" fill="#475569">FALCON • FEA • SEA-ME-WE • IMEWE</text>
            <text x="397" y="390" textAnchor="middle" fontSize="8.3" fontWeight="700" fill="#475569">2Africa • AAE-1 • Medusa (via Jordan)</text>

            {/* Forward to Europe & Global Exchanges */}
            <line x1="515" y1="277" x2="565" y2="296" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowSlate)" />
            <line x1="515" y1="362" x2="565" y2="346" stroke="#334155" strokeWidth="2" markerEnd="url(#arrowSlate)" />

            <rect x="570" y="250" width="226" height="150" rx="9" fill="#ffffff" stroke="#c0102a" strokeWidth="2" />
            <rect x="570" y="250" width="226" height="28" rx="9" fill="#c0102a" />
            <text x="683" y="268" textAnchor="middle" fontSize="10.2" fontWeight="900" fill="#ffffff">European IXPs &amp; Global Transit</text>
            <rect x="584" y="288" width="198" height="32" rx="6" fill="#fef2f2" stroke="#fca5a5" />
            <text x="683" y="302" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#991b1b">London, UK (LINX / Telehouse)</text>
            <text x="683" y="314" textAnchor="middle" fontSize="8.2" fontWeight="700" fill="#475569">IP Transit &amp; Content Peering Gateways</text>
            <rect x="584" y="326" width="198" height="32" rx="6" fill="#eff6ff" stroke="#93c5fd" />
            <text x="683" y="340" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#1e3a8a">Frankfurt, Germany (DE-CIX)</text>
            <text x="683" y="352" textAnchor="middle" fontSize="8.2" fontWeight="700" fill="#475569">Primary Continental Europe Routing Hub</text>
            <text x="683" y="378" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#0f172a">Tier-1 Wholesale: TATA • GCX • Orange</text>
            <text x="683" y="392" textAnchor="middle" fontSize="8.2" fontWeight="700" fill="#64748b">Protected Dual-Path Diversity via Aqaba &amp; Suez</text>
          </svg>
        </div>
      </figure>

      {/* ── Figure 2: Topologies & OTDR Fiber Cut Localization ──────────── */}
      <figure className="p-4 bg-card border border-line rounded-2xl print:border-slate-300 print:rounded-xl print:p-3 break-inside-avoid shadow-2xs">
        <figcaption className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-3 border-b border-line/70 text-xs font-black text-ink">
          <span>
            {isReportAr
              ? 'شكل (2): أنماط تخطيط شبكات النقل (Topologies) وآلية تحديد مكان قطع الألياف بدقة بجهاز OTDR'
              : 'Figure 2: Transport Network Topologies & Exact Fiber-Cut Localization via OTDR'}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            {isReportAr ? 'تحديد الأعطال الميدانية < 50ms حماية' : 'Topology Resilience & Meter-Level Cut Pinpointing'}
          </span>
        </figcaption>

        <div className="w-full overflow-x-auto" dir="ltr">
          <svg
            viewBox="0 0 820 270"
            className="w-full h-auto max-w-full block mx-auto"
            role="img"
            aria-label="Network Topologies and OTDR Cut Pinpointing"
          >
            {/* Left Side: Topologies */}
            <rect x="8" y="8" width="394" height="254" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
            <text x="205" y="27" textAnchor="middle" fontSize="11" fontWeight="900" fill="#0f172a">
              {isReportAr ? 'أنواع تخطيط الشبكات (DWDM / OTN / MPLS)' : 'Transport Topologies'}
            </text>

            {/* 1. Point-to-Point */}
            <rect x="20" y="38" width="180" height="98" rx="7" fill="#ffffff" stroke="#e2e8f0" />
            <text x="110" y="54" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#334155">1. Point-to-Point (Linear)</text>
            <circle cx="54" cy="90" r="13" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
            <text x="54" y="94" textAnchor="middle" fontSize="8.5" fontWeight="900" fill="#0369a1">A</text>
            <line x1="67" y1="90" x2="153" y2="90" stroke="#0284c7" strokeWidth="2.5" />
            <circle cx="166" cy="90" r="13" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
            <text x="166" y="94" textAnchor="middle" fontSize="8.5" fontWeight="900" fill="#0369a1">B</text>
            <text x="110" y="124" textAnchor="middle" fontSize="8" fontWeight="700" fill="#64748b">Direct Span / Unprotected</text>

            {/* 2. Ring Protection */}
            <rect x="210" y="38" width="180" height="98" rx="7" fill="#ffffff" stroke="#e2e8f0" />
            <text x="300" y="54" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#0f766e">2. Ring (SNCP 1+1 &lt;50ms)</text>
            <circle cx="300" cy="92" r="28" fill="none" stroke="#14b8a6" strokeWidth="2" strokeDasharray="4 2" />
            <circle cx="300" cy="64" r="9" fill="#ccfbf1" stroke="#0f766e" strokeWidth="1.5" />
            <circle cx="272" cy="92" r="9" fill="#ccfbf1" stroke="#0f766e" strokeWidth="1.5" />
            <circle cx="328" cy="92" r="9" fill="#ccfbf1" stroke="#0f766e" strokeWidth="1.5" />
            <circle cx="300" cy="120" r="9" fill="#ccfbf1" stroke="#0f766e" strokeWidth="1.5" />
            <text x="281" y="76" fontSize="11" fontWeight="900" fill="#dc2626">✕</text>
            <text x="300" y="133" textAnchor="middle" fontSize="8" fontWeight="700" fill="#64748b">Auto-Switch on Cut</text>

            {/* 3. Core Mesh */}
            <rect x="20" y="146" width="180" height="106" rx="7" fill="#ffffff" stroke="#e2e8f0" />
            <text x="110" y="162" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#1d4ed8">3. Core Mesh (ROADM / MPLS)</text>
            <line x1="65" y1="184" x2="155" y2="184" stroke="#60a5fa" strokeWidth="1.6" />
            <line x1="65" y1="226" x2="155" y2="226" stroke="#60a5fa" strokeWidth="1.6" />
            <line x1="65" y1="184" x2="65" y2="226" stroke="#60a5fa" strokeWidth="1.6" />
            <line x1="155" y1="184" x2="155" y2="226" stroke="#60a5fa" strokeWidth="1.6" />
            <line x1="65" y1="184" x2="155" y2="226" stroke="#93c5fd" strokeWidth="1.4" />
            <line x1="155" y1="184" x2="65" y2="226" stroke="#93c5fd" strokeWidth="1.4" />
            <circle cx="65" cy="184" r="8" fill="#dbeafe" stroke="#2563eb" />
            <circle cx="155" cy="184" r="8" fill="#dbeafe" stroke="#2563eb" />
            <circle cx="65" cy="226" r="8" fill="#dbeafe" stroke="#2563eb" />
            <circle cx="155" cy="226" r="8" fill="#dbeafe" stroke="#2563eb" />
            <text x="110" y="246" textAnchor="middle" fontSize="8" fontWeight="700" fill="#64748b">Multi-Path Carrier Core</text>

            {/* 4. Dual-Homed B2B */}
            <rect x="210" y="146" width="180" height="106" rx="7" fill="#ffffff" stroke="#e2e8f0" />
            <text x="300" y="162" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#7c3aed">4. Dual-Homed B2B Client</text>
            <rect x="242" y="172" width="44" height="20" rx="4" fill="#f3e8ff" stroke="#7c3aed" />
            <text x="264" y="185" textAnchor="middle" fontSize="8" fontWeight="900" fill="#5b21b6">PE-1</text>
            <rect x="314" y="172" width="44" height="20" rx="4" fill="#f3e8ff" stroke="#7c3aed" />
            <text x="336" y="185" textAnchor="middle" fontSize="8" fontWeight="900" fill="#5b21b6">PE-2</text>
            <line x1="264" y1="192" x2="300" y2="216" stroke="#7c3aed" strokeWidth="1.8" />
            <line x1="336" y1="192" x2="300" y2="216" stroke="#7c3aed" strokeWidth="1.8" strokeDasharray="3 2" />
            <rect x="264" y="216" width="72" height="22" rx="4" fill="#ede9fe" stroke="#6d28d9" />
            <text x="300" y="230" textAnchor="middle" fontSize="8.5" fontWeight="900" fill="#4c1d95">B2B CE</text>

            {/* Right Side: OTDR Cut Localization */}
            <rect x="414" y="8" width="398" height="254" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
            <text x="613" y="27" textAnchor="middle" fontSize="11" fontWeight="900" fill="#0f172a">
              {isReportAr ? 'تحديد مكان قطع الألياف بدقة عبر OTDR' : 'Exact Fiber-Cut Localization via OTDR'}
            </text>

            {/* Physical Span */}
            <rect x="428" y="42" width="370" height="72" rx="8" fill="#ffffff" stroke="#e2e8f0" />
            <rect x="440" y="56" width="84" height="40" rx="6" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
            <text x="482" y="73" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#92400e">POP A (ODF)</text>
            <text x="482" y="88" textAnchor="middle" fontSize="8.2" fontWeight="800" fill="#b45309">OTDR Laser Pulse</text>

            <line x1="524" y1="71" x2="670" y2="71" stroke="#0284c7" strokeWidth="3" />
            <line x1="524" y1="81" x2="664" y2="81" stroke="#dc2626" strokeWidth="1.8" strokeDasharray="4 2" markerStart="url(#arrowSlate)" />
            <text x="595" y="64" textAnchor="middle" fontSize="8" fontWeight="800" fill="#0369a1">Forward Pulse →</text>
            <text x="595" y="96" textAnchor="middle" fontSize="8" fontWeight="800" fill="#dc2626">← Reflected Spike (Break)</text>

            <polygon points="670,60 679,76 670,92 685,76" fill="#dc2626" />
            <text x="678" y="53" textAnchor="middle" fontSize="8.2" fontWeight="900" fill="#b91c1c">CUT @ 24.38 km</text>
            <line x1="690" y1="76" x2="730" y2="76" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="3 3" />
            <rect x="730" y="56" width="58" height="40" rx="6" fill="#f1f5f9" stroke="#94a3b8" />
            <text x="759" y="74" textAnchor="middle" fontSize="8.5" fontWeight="900" fill="#475569">POP B</text>
            <text x="759" y="87" textAnchor="middle" fontSize="8" fontWeight="900" fill="#dc2626">R_LOS (A1)</text>

            {/* OTDR Trace Box + Formula */}
            <rect x="428" y="122" width="180" height="128" rx="8" fill="#ffffff" stroke="#e2e8f0" />
            <text x="518" y="138" textAnchor="middle" fontSize="9" fontWeight="900" fill="#0f172a">OTDR Optical Trace</text>
            <polyline
              points="442,155 478,164 484,160 488,167 540,180 546,148 552,226 594,230"
              fill="none"
              stroke="#0f766e"
              strokeWidth="2.2"
            />
            <text x="486" y="155" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#64748b">Splice Loss</text>
            <text x="562" y="152" textAnchor="middle" fontSize="8" fontWeight="900" fill="#dc2626">Break</text>
            <text x="518" y="243" textAnchor="middle" fontSize="8" fontWeight="700" fill="#475569">Distance (km) vs Attenuation (dB)</text>

            <rect x="616" y="122" width="182" height="128" rx="8" fill="#eff6ff" stroke="#93c5fd" />
            <text x="707" y="140" textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#1e3a8a">Formula &amp; Field Action</text>
            <rect x="628" y="150" width="158" height="30" rx="5" fill="#ffffff" stroke="#60a5fa" />
            <text x="707" y="169" textAnchor="middle" fontSize="11" fontWeight="900" fill="#0f172a">d = (c × t) / (2 × n)</text>
            <text x="707" y="196" textAnchor="middle" fontSize="8.2" fontWeight="700" fill="#334155">n ≈ 1.468 (Fiber Refractive Index)</text>
            <text x="707" y="213" textAnchor="middle" fontSize="8.2" fontWeight="700" fill="#0f766e">1. Match km on GIS / KMZ map</text>
            <text x="707" y="229" textAnchor="middle" fontSize="8.2" fontWeight="700" fill="#0f766e">2. Pinpoint manhole / dig site</text>
            <text x="707" y="244" textAnchor="middle" fontSize="8.2" fontWeight="700" fill="#0f766e">3. Dispatch FOPS + Fusion Splicer</text>
          </svg>
        </div>
      </figure>
    </div>
  );
};

/**
 * Technical Hardware & Fiber Cable Reference Plates using static images from /images/transport/
 */
export const TransportHardwareVisuals: React.FC<DiagramProps> = ({ isReportAr }) => {
  return (
    <div className="rt-plates-grid my-5 grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3 print:my-3 break-inside-avoid">
      {/* Plate 1: Core Transport & Field Test Equipment */}
      <figure className="p-3.5 bg-card border border-line rounded-2xl print:border-slate-300 print:rounded-xl print:p-3 flex flex-col justify-between shadow-2xs break-inside-avoid">
        <div>
          <figcaption className="text-xs font-black text-ink pb-2 mb-2 border-b border-line/70">
            {isReportAr
              ? 'لوحة (1): أهم أجهزة شبكات النقل والاختبار الميداني للألياف'
              : 'Plate 1: Core Optical/IP Transport Hardware & Field Test Instruments'}
          </figcaption>
          <div className="rt-plate-frame bg-white rounded-xl border border-slate-200 p-2 overflow-hidden flex items-center justify-center">
            <img
              src="/images/transport/transport-devices-overview.png"
              alt={isReportAr ? 'أجهزة النقل والقياس الميداني' : 'Transport Network and Field Test Hardware'}
              className="w-full h-auto max-h-64 object-contain"
            />
          </div>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[10px] font-bold text-sub">
          <div className="rt-plate-chip p-1.5 rounded bg-bg border border-line/60 print:border-slate-200">
            <span className="font-black text-ink">1. DWDM / OTN:</span>{' '}
            {isReportAr ? 'OptiX OSN / NCS 2000' : 'Optical Shelf'}
          </div>
          <div className="rt-plate-chip p-1.5 rounded bg-bg border border-line/60 print:border-slate-200">
            <span className="font-black text-ink">2. MPLS Router:</span>{' '}
            {isReportAr ? 'NE40E / ASR 9000' : 'PE / P Core'}
          </div>
          <div className="rt-plate-chip p-1.5 rounded bg-bg border border-line/60 print:border-slate-200">
            <span className="font-black text-ink">3. OTDR Tester:</span>{' '}
            {isReportAr ? 'تحديد مسافة القطع' : 'Break Distance'}
          </div>
          <div className="rt-plate-chip p-1.5 rounded bg-bg border border-line/60 print:border-slate-200">
            <span className="font-black text-ink">4. Fusion Splicer:</span>{' '}
            {isReportAr ? 'لحام الألياف الضوئية' : 'Fiber Splicing'}
          </div>
        </div>
      </figure>

      {/* Plate 2: Optical Fiber Cable Cross-Sections */}
      <figure className="p-3.5 bg-card border border-line rounded-2xl print:border-slate-300 print:rounded-xl print:p-3 flex flex-col justify-between shadow-2xs break-inside-avoid">
        <div>
          <figcaption className="text-xs font-black text-ink pb-2 mb-2 border-b border-line/70">
            {isReportAr
              ? 'لوحة (2): المقاطع الهندسية لأنواع كابلات الألياف الضوئية في الشبكة'
              : 'Plate 2: Engineering Cross-Sections of Transport Optical Fiber Cables'}
          </figcaption>
          <div className="rt-plate-frame bg-white rounded-xl border border-slate-200 p-2 overflow-hidden flex items-center justify-center">
            <img
              src="/images/transport/fiber-cables-types.png"
              alt={isReportAr ? 'أنواع كابلات الألياف الضوئية' : 'Optical Fiber Cable Cross-Sections'}
              className="w-full h-auto max-h-64 object-contain"
            />
          </div>
        </div>
        <div className="mt-2.5 space-y-1 text-[10px] font-bold text-sub">
          <div className="rt-plate-chip p-1.5 rounded bg-bg border border-line/60 print:border-slate-200">
            <span className="font-black text-amber-600">▲ Single-Mode Patchcord (OS2):</span>{' '}
            {isReportAr ? 'كابل أصفر داخل المقاسم (ODF ↔ الأجهزة)' : 'Yellow indoor single-mode jumper (LC/SC)'}
          </div>
          <div className="rt-plate-chip p-1.5 rounded bg-bg border border-line/60 print:border-slate-200">
            <span className="font-black text-ink">■ Armored Underground Trunk:</span>{' '}
            {isReportAr ? 'كابل أرضي مسلّح للشبكة الوطنية SNFN بين المدن' : 'Corrugated steel armored trunk for SNFN'}
          </div>
          <div className="rt-plate-chip p-1.5 rounded bg-bg border border-line/60 print:border-slate-200">
            <span className="font-black text-sky-600">▼ Submarine Cable:</span>{' '}
            {isReportAr ? 'كابل بحري متعدد التسليح للربط الدولي مع أوروبا' : 'Multi-armored subsea cable for Europe transit'}
          </div>
        </div>
      </figure>
    </div>
  );
};
