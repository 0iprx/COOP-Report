import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Download,
  FileCode,
  FileText,
  History,
  Languages,
  MoreHorizontal,
  Pin,
  Presentation,
  Printer,
  RotateCcw,
  RotateCw,
  UploadCloud,
  Loader2
} from 'lucide-react';
import { Menu, MenuItem, MenuLabel, MenuSeparator } from '../ui/Menu';

interface ReportActionBarProps {
  isAr: boolean;
  previewLang: 'ar' | 'en';
  onPreviewLang: (l: 'ar' | 'en') => void;

  pages: number;
  isTargetAchieved: boolean;
  wordCount: number;
  totalHours: number;
  courseHours: number;

  showOnlyActualWeeks: boolean;
  actualWeeksCount: number;
  plannedWeeks: number;
  onToggleActualWeeks: () => void;

  downloadingDocx: boolean;
  downloadingHtml: boolean;
  downloadingPptx: boolean;
  onExportDocx: () => void;
  onExportHtml: () => void;
  onExportPptx: () => void;
  onPrint: () => void;

  versionsCount: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSnapshot: () => void;
  onOpenVersions: () => void;

  downloadingArchive: string | null;
  onBackupJson: () => void;
  onBackupCsv: () => void;
  onBackupMarkdown: () => void;
  onImportBackup: () => void;
}

/**
 * One sticky bar for everything done *to the report as a whole*:
 * choose the language/weeks to show, export (Word / PowerPoint / HTML / PDF) and manage versions & backups.
 * Replaces two button-heavy cards that used to sit far apart.
 */
export const ReportActionBar: React.FC<ReportActionBarProps> = (p) => {
  const L = (ar: string, en: string) => (p.isAr ? ar : en);
  const pct = Math.min(100, Math.round((p.totalHours / Math.max(p.courseHours, 1)) * 100));
  const busyExport = p.downloadingDocx || p.downloadingHtml || p.downloadingPptx;

  return (
    <div
      className="sticky top-[6.25rem] z-20 no-print rounded-2xl border border-line bg-card shadow-sm px-3 py-2.5 sm:px-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
      role="toolbar"
      aria-label={L('أدوات التقرير', 'Report tools')}
    >
      {/* Left: report health */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${p.isTargetAchieved ? 'bg-ok-bg text-ok' : 'bg-accent-dim text-accent'}`}>
          <FileText className="w-[18px] h-[18px]" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-extrabold text-ink">{L(`${p.pages} صفحة`, `${p.pages} pages`)}</span>
            {p.isTargetAchieved ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-ok-bg text-ok flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {L('يستوفي 20+ صفحة', 'Meets 20+ pages')}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-warn-bg text-warn flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {L('أقل من 20 صفحة', 'Under 20 pages')}
              </span>
            )}
          </div>
          <p className="text-[11px] text-sub mt-0.5 truncate">
            {L(`${p.wordCount} كلمة`, `${p.wordCount} words`)} · {L(`${p.totalHours} من ${p.courseHours} ساعة (${pct}%)`, `${p.totalHours} of ${p.courseHours} h (${pct}%)`)}
          </p>
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Weeks shown */}
        <div className="inline-flex p-0.5 bg-bg border border-line rounded-xl text-xs font-bold" role="group" aria-label={L('الأسابيع المعروضة', 'Weeks shown')}>
          <button
            type="button"
            aria-pressed={p.showOnlyActualWeeks}
            onClick={() => !p.showOnlyActualWeeks && p.onToggleActualWeeks()}
            className={`px-2.5 py-1 rounded-lg transition-colors ${p.showOnlyActualWeeks ? 'bg-card text-ink shadow-xs border border-line' : 'text-sub hover:text-ink'}`}
            title={L('عرض وتصدير الأسابيع المنجزة فعلياً فقط', 'Show and export only the weeks you actually logged')}
          >
            {L(`المنجزة (${p.actualWeeksCount})`, `Logged (${p.actualWeeksCount})`)}
          </button>
          <button
            type="button"
            aria-pressed={!p.showOnlyActualWeeks}
            onClick={() => p.showOnlyActualWeeks && p.onToggleActualWeeks()}
            className={`px-2.5 py-1 rounded-lg transition-colors ${!p.showOnlyActualWeeks ? 'bg-card text-ink shadow-xs border border-line' : 'text-sub hover:text-ink'}`}
            title={L('عرض الخطة الكاملة', 'Show the full plan')}
          >
            {L(`الخطة (${p.plannedWeeks})`, `Plan (${p.plannedWeeks})`)}
          </button>
        </div>

        {/* Language */}
        <div className="inline-flex p-0.5 bg-bg border border-line rounded-xl text-xs font-bold" role="group" aria-label={L('لغة التقرير', 'Report language')}>
          {(['ar', 'en'] as const).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={p.previewLang === l}
              onClick={() => p.onPreviewLang(l)}
              className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${p.previewLang === l ? 'bg-accent text-white shadow-xs' : 'text-sub hover:text-ink'}`}
            >
              <Languages className="w-3.5 h-3.5" />
              {l === 'ar' ? 'العربية' : 'English'}
            </button>
          ))}
        </div>

        {/* Export */}
        <Menu
          width="w-72"
          label={L('تصدير', 'Export')}
          trigger={({ open, triggerProps }) => (
            <button
              {...triggerProps}
              className="px-3 py-2 text-xs font-bold text-ink bg-bg hover:bg-line rounded-xl border border-line transition-colors flex items-center gap-1.5"
            >
              {busyExport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-accent" />}
              <span>{L('تصدير', 'Export')}</span>
              <ChevronDown className={`w-3 h-3 text-sub transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
          )}
        >
          {(close) => (
            <>
              <MenuLabel>{L('بلغة التقرير المختارة', 'In the selected language')}</MenuLabel>
              <MenuItem icon={<FileText className="w-4 h-4" />} label={L('مستند Word (.docx)', 'Word document (.docx)')} hint={L('مع فهرسة وروابط داخلية', 'With table of contents & internal links')} disabled={p.downloadingDocx} onClick={p.onExportDocx} close={close} />
              <MenuItem icon={<Presentation className="w-4 h-4" />} label={L('عرض PowerPoint (.pptx)', 'PowerPoint slides (.pptx)')} hint={L('شرائح للمناقشة أمام اللجنة', 'Slides for the committee defence')} disabled={p.downloadingPptx} onClick={p.onExportPptx} close={close} />
              <MenuItem icon={<FileCode className="w-4 h-4" />} label={L('صفحة HTML مستقلة', 'Standalone HTML page')} hint={L('تعمل دون إنترنت', 'Works offline')} disabled={p.downloadingHtml} onClick={p.onExportHtml} close={close} />
            </>
          )}
        </Menu>

        <button
          type="button"
          onClick={p.onPrint}
          className="px-3.5 py-2 text-xs font-bold text-white bg-accent hover:bg-accent-mid rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          title={L('طباعة التقرير أو حفظه كملف PDF', 'Print the report or save it as PDF')}
        >
          <Printer className="w-4 h-4" />
          <span>{L('طباعة / PDF', 'Print / PDF')}</span>
        </button>

        {/* Versions & backups */}
        <Menu
          width="w-72"
          label={L('النسخ والحماية', 'Versions & protection')}
          trigger={({ triggerProps }) => (
            <button
              {...triggerProps}
              className="w-9 h-9 flex items-center justify-center text-sub hover:text-ink bg-bg hover:bg-line rounded-xl border border-line transition-colors"
              aria-label={L('النسخ والحماية', 'Versions & protection')}
              title={L('النسخ والحماية', 'Versions & protection')}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        >
          {(close) => (
            <>
              <MenuLabel>{L('الإصدارات', 'Versions')}</MenuLabel>
              <MenuItem icon={<RotateCcw className="w-4 h-4 text-accent" />} label={L('تراجع للنسخة السابقة', 'Undo to previous version')} disabled={!p.canUndo} onClick={p.onUndo} close={close} />
              <MenuItem icon={<RotateCw className="w-4 h-4 text-ok" />} label={L('التقدم للنسخة الأحدث', 'Redo to newer version')} disabled={!p.canRedo} onClick={p.onRedo} close={close} />
              <MenuItem icon={<Pin className="w-4 h-4" />} label={L('تثبيت لقطة من الحالة الحالية', 'Pin a snapshot of the current state')} onClick={p.onSnapshot} close={close} />
              <MenuItem icon={<History className="w-4 h-4" />} label={L(`سجل الإصدارات (${p.versionsCount})`, `Version history (${p.versionsCount})`)} onClick={p.onOpenVersions} close={close} />
              <MenuSeparator />
              <MenuLabel>{L('نسخ احتياطية', 'Backups')}</MenuLabel>
              <MenuItem icon={<Download className="w-4 h-4 text-ok" />} label={L('أرشيف كامل (JSON)', 'Full archive (JSON)')} hint={L('مع توقيع SHA-256', 'With SHA-256 checksum')} disabled={!!p.downloadingArchive} onClick={p.onBackupJson} close={close} />
              <MenuItem icon={<Download className="w-4 h-4 text-ok" />} label={L('السجل اليومي (CSV)', 'Daily log (CSV)')} disabled={!!p.downloadingArchive} onClick={p.onBackupCsv} close={close} />
              <MenuItem icon={<Download className="w-4 h-4 text-ok" />} label={L('التقرير النصي (Markdown)', 'Text report (Markdown)')} disabled={!!p.downloadingArchive} onClick={p.onBackupMarkdown} close={close} />
              <MenuItem icon={<UploadCloud className="w-4 h-4 text-accent" />} label={L('استيراد نسخة احتياطية', 'Import a backup')} hint={L('مع تدقيق سلامة الملف', 'File integrity is verified first')} onClick={p.onImportBackup} close={close} />
            </>
          )}
        </Menu>
      </div>
    </div>
  );
};
