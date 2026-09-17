import React from 'react';
import { parseStructuredDailyNarrative, convertBulletsToCohesiveParagraphs } from '@coop/shared';
import { MapPin, Clock, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface ProceduralNarrativeViewProps {
  rawText: string;
  isAr?: boolean;
}

export const translateSectionHeader = (header: string, isAr: boolean) => {
  const clean = header.replace(/[:：]$/, '').trim();
  if (isAr) {
    const enToArMap: Record<string, string> = {
      'Executive Accomplishment Summary': 'موجز الإنجاز',
      'Field Accomplishment Summary': 'ملخص الإنجاز الميداني',
      'Training Summary': 'موجز الإنجاز الميداني',
      'Operational Objective': 'الهدف التشغيلي',
      'Operational Scope & Field Assignment': 'نطاق التكليف والمهمة الميدانية',
      'Operational Scope': 'نطاق التكليف',
      'Assignment Scope': 'نطاق التكليف',
      'Target Competency & Skill': 'الجدارة والمهارة المستهدفة',
      'Field Procedures & Technical Steps': 'الإجراءات والخطوات الميدانية',
      'Field Procedures': 'الإجراءات والخطوات الميدانية',
      'Technical Actions & Troubleshooting': 'الإجراءات والحلول الفنية',
      'Technical Actions': 'الإجراءات الفنية',
      'Technical Steps': 'الخطوات الفنية',
      'Field Practice & Practical Application': 'الممارسة والتطبيق الميداني',
      'Systems, Tools & Equipment Utilized': 'الأنظمة والأدوات المستخدمة',
      'Systems & Tools': 'الأنظمة والأدوات المستخدمة',
      'Systems & Technologies Utilized': 'الأنظمة والتقنيات المستخدمة',
      'Systems & Technologies': 'الأنظمة والتقنيات المستخدمة',
      'Applied Tools & Technical Concepts': 'الأدوات والمفاهيم التقنية المطبقة',
      'Applied Tools': 'الأدوات المطبقة',
      'Technical Outcomes & Deliverables': 'المخرجات والنتائج الفنية',
      'Technical Outcomes': 'المخرجات الفنية',
      'Deliverables': 'المخرجات الفنية',
      'Value Added & Business Impact': 'الأثر والقيمة المضافة',
      'Learning Outcomes & Self-Assessment': 'مخرجات التعلم والتقييم الذاتي',
      'Location': 'الموقع',
      'Period': 'الفترة',
      'Field Tasks & Activities': 'المهام والأنشطة الميدانية',
      'Challenges & Resolutions': 'التحديات والحلول',
      'Key Learnings & Knowledge Acquired': 'ما تم تعلمه اليوم',
      'Assigned Team': 'الفريق',
      'Department / Unit': 'القسم',
      'Phase / Milestone': 'المرحلة',
      'Conclusion': 'الخلاصة والنتائج'
    };
    return enToArMap[clean] || clean;
  }
  const headerMap: Record<string, string> = {
    'موجز الإنجاز': 'Executive Accomplishment Summary',
    'ملخص الإنجاز الميداني': 'Field Accomplishment Summary',
    'الهدف التشغيلي': 'Operational Objective',
    'نطاق التكليف والمهمة الميدانية': 'Operational Scope & Field Assignment',
    'نطاق التكليف': 'Assignment Scope',
    'الجدارة والمهارة المستهدفة': 'Target Competency & Skill',
    'الإجراءات والخطوات الميدانية': 'Field Procedures & Technical Steps',
    'الإجراءات والحلول الفنية': 'Technical Actions & Troubleshooting',
    'الممارسة والتطبيق الميداني': 'Field Practice & Practical Application',
    'الأنظمة والأدوات المستخدمة': 'Systems, Tools & Equipment Utilized',
    'الأنظمة والتقنيات المستخدمة': 'Systems & Technologies Utilized',
    'الأدوات والمفاهيم التقنية المطبقة': 'Applied Tools & Technical Concepts',
    'المخرجات والنتائج الفنية': 'Technical Outcomes & Deliverables',
    'الأثر والقيمة المضافة': 'Value Added & Business Impact',
    'مخرجات التعلم والتقييم الذاتي': 'Learning Outcomes & Self-Assessment',
    'الموقع': 'Location',
    'الفترة': 'Period',
    'المهام والأنشطة الميدانية': 'Field Tasks & Activities',
    'التحديات والحلول': 'Challenges & Resolutions',
    'ما تم تعلمه اليوم': 'Key Learnings & Knowledge Acquired',
    'فريق': 'Assigned Team',
    'قسم': 'Department / Unit',
    'مرحلة': 'Phase / Milestone',
    'الخلاصة': 'Conclusion'
  };
  return headerMap[clean] || clean;
};

export const ProceduralNarrativeView: React.FC<ProceduralNarrativeViewProps> = ({ rawText, isAr = true }) => {
  if (!rawText || !rawText.trim()) return null;

  const parsed = parseStructuredDailyNarrative(rawText);

  // If guided / classified sections exist, render the structured academic layout
  if (parsed && parsed.hasStructuredSections) {
    return (
      <div className="space-y-3.5 text-start print:space-y-2.5">
        {/* 1. Location & Shift / Period Badges */}
        {(parsed.location || parsed.period) && (
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-line/60 text-xs font-bold print:border-slate-200 print:pb-1.5">
            {parsed.location && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-dim text-accent border border-accent/20 print:border-slate-300 print:bg-slate-100 print:text-slate-800 print:py-0.5 print:px-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="text-sub font-medium print:text-slate-600">{isAr ? 'الموقع:' : 'Location:'}</span>
                <span className="font-extrabold text-ink print:text-slate-900">{parsed.location}</span>
              </span>
            )}
            {parsed.period && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-bg border border-line text-sub print:border-slate-300 print:bg-slate-100 print:text-slate-800 print:py-0.5 print:px-2">
                <Clock className="w-3.5 h-3.5 text-accent shrink-0 print:text-slate-700" />
                <span className="font-medium print:text-slate-600">{isAr ? 'الفترة:' : 'Period:'}</span>
                <span className="font-extrabold text-ink print:text-slate-900">{parsed.period}</span>
              </span>
            )}
          </div>
        )}

        {/* 2. Tasks & Activities Performed */}
        {parsed.activities && (
          <div className="space-y-1.5">
            <div className="text-xs font-black text-sub uppercase tracking-wider flex items-center gap-1.5 print:text-slate-800 print:text-[10pt]">
              <FileText className="w-3.5 h-3.5 text-accent shrink-0 print:text-slate-700" />
              <span>{isAr ? 'المهام والأنشطة الإجرائية المنفذة:' : 'Operational Tasks & Activities Performed:'}</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed sm:leading-loose text-ink font-normal whitespace-pre-wrap text-justify print:text-[10.5pt] print:leading-relaxed">
              {parsed.activities}
            </p>
          </div>
        )}

        {/* 3. Key Achievements & Deliverables */}
        {parsed.achievements && (
          <div className="p-3 sm:p-3.5 rounded-xl bg-ok-bg/40 border border-ok/30 space-y-1 print:bg-slate-50 print:border-s-4 print:border-emerald-600 print:border-y-0 print:border-e-0 print:rounded-none print:py-2 print:px-3">
            <div className="text-xs font-black text-ok flex items-center gap-1.5 print:text-slate-900 print:text-[10pt]">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-ok print:text-emerald-700" />
              <span>{isAr ? 'أهم الإنجازات والمخرجات المتحققة:' : 'Key Achievements & Deliverables:'}</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-ink font-normal whitespace-pre-wrap print:text-[10pt] print:leading-relaxed">
              {parsed.achievements}
            </p>
          </div>
        )}

        {/* 4. Technical Challenges & Resolutions */}
        {parsed.challenges && (
          <div className="p-3 sm:p-3.5 rounded-xl bg-warn-bg/40 border border-warn/30 space-y-1 print:bg-slate-50 print:border-s-4 print:border-amber-600 print:border-y-0 print:border-e-0 print:rounded-none print:py-2 print:px-3">
            <div className="text-xs font-black text-warn flex items-center gap-1.5 print:text-slate-900 print:text-[10pt]">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-warn print:text-amber-700" />
              <span>{isAr ? 'المشاكل والتحديات الفنية وطريقة معالجتها:' : 'Technical Challenges & How Resolved:'}</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-ink font-normal whitespace-pre-wrap print:text-[10pt] print:leading-relaxed">
              {parsed.challenges}
            </p>
          </div>
        )}

        {/* 5. New Knowledge & Acquired Skills */}
        {parsed.newLearnings && (
          <div className="p-3 sm:p-3.5 rounded-xl bg-accent-dim/40 border border-accent/30 space-y-1 print:bg-slate-50 print:border-s-4 print:border-accent print:border-y-0 print:border-e-0 print:rounded-none print:py-2 print:px-3">
            <div className="text-xs font-black text-accent flex items-center gap-1.5 print:text-slate-900 print:text-[10pt]">
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-accent print:text-slate-800" />
              <span>{isAr ? 'الجديد والمعارف والمهارات المكتسبة اليوم:' : 'New Knowledge & Acquired Skills Today:'}</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-ink font-normal whitespace-pre-wrap print:text-[10pt] print:leading-relaxed">
              {parsed.newLearnings}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Fallback for standard unstructured narrative
  const preprocessed = rawText
    .replace(/(?<=[.!?؟])\s+(Period|Location|Training Summary|Executive Summary|Technical Summary|Summary|Field Procedures|Technical Actions|Technical Steps|Systems & Tools|Systems & Technologies|Applied Tools|Technical Outcomes|Deliverables|Conclusion|الموقع|الفترة|موجز الإنجاز|الهدف التشغيلي|الإجراءات|الأنظمة|الخلاصة|المخرجات)\s*[:：]/gi, '\n\n$1:\n')
    .replace(/\n{3,}/g, '\n\n');

  const cohesiveText = convertBulletsToCohesiveParagraphs(preprocessed);
  const lines = cohesiveText.split('\n');
  const elements: React.ReactNode[] = [];

  const sectionHeaderRegex = /^(الهدف التشغيلي|نطاق التكليف والمهمة الميدانية|نطاق التكليف|الجدارة والمهارة المستهدفة|الإجراءات والخطوات الميدانية|الإجراءات والحلول الفنية|الممارسة والتطبيق الميداني|الأنظمة والأدوات المستخدمة|الأنظمة والتقنيات المستخدمة|الأدوات والمفاهيم التقنية المطبقة|المخرجات والنتائج الفنية|الأثر والقيمة المضافة|مخرجات التعلم والتقييم الذاتي|ملخص الإنجاز الميداني|موجز الإنجاز|فريق|قسم|مرحلة|الموقع|الفترة|الخلاصة|Period|Location|Training Summary|Executive Summary|Field Procedures|Technical Actions|Technical Steps|Systems & Tools|Systems & Technologies|Applied Tools|Technical Outcomes|Deliverables|Conclusion|Challenges & Resolutions|Key Learnings)\s*[:：]?$/i;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    const isHeader = (trimmed.startsWith('**') && trimmed.endsWith('**')) ||
      sectionHeaderRegex.test(trimmed) ||
      (/^(في تمام الساعة|بعد الساعة|الساعة|قسم|فريق|مرحلة|منظومة|موجز|الفترة|Period|Location|Summary)\s*[\d:]*.*:?$/i.test(trimmed) && trimmed.length < 80);

    if (isHeader) {
      const title = trimmed.replace(/^\*\*|\*\*$/g, '').replace(/[:：]$/, '').trim();
      const displayTitle = translateSectionHeader(title, isAr);
      elements.push(
        <div key={`heading-${elements.length}`} className="font-black text-xs sm:text-sm text-accent pt-3 pb-1 border-b border-line/40 flex items-center gap-1.5 first:pt-0 print:text-slate-900 print:border-slate-300 print:pt-3 print:pb-1">
          <span className="w-1.5 h-3.5 bg-accent rounded-full shrink-0 print:bg-slate-800"></span>
          <span>{displayTitle}:</span>
        </div>
      );
      continue;
    }

    const cleanPara = trimmed.replace(/^[•\-\*]\s*|\s*\*$/g, '').trim();
    if (!cleanPara) continue;

    elements.push(
      <p key={`p-${elements.length}`} className="text-xs sm:text-sm leading-relaxed sm:leading-loose text-ink my-1.5 text-justify font-normal print:text-[10.5pt] print:leading-[1.85] print:mb-3">
        {cleanPara}
      </p>
    );
  }

  return <div className="space-y-1 text-start">{elements}</div>;
};
