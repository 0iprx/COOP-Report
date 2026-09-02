import React from 'react';
import { Sparkles, Check, X, ArrowLeftRight, FileText } from 'lucide-react';
import { DiffChunk } from '@coop/shared';

interface DiffModalProps {
  isOpen: boolean;
  actionTitle: string;
  originalText: string;
  improvedText: string;
  diffChunks?: DiffChunk[];
  onAccept: () => void;
  onClose: () => void;
}

export const DiffModal: React.FC<DiffModalProps> = ({
  isOpen,
  actionTitle,
  originalText,
  improvedText,
  diffChunks = [],
  onAccept,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-card border border-line rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-line flex items-center justify-between bg-bg/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-lg text-ink">{actionTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-sub hover:text-ink p-1 rounded-md transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Comparison View */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-sub">
              <FileText className="w-3.5 h-3.5" />
              <span>النص الأصلي</span>
            </div>
            <div className="bg-bg border border-line rounded-lg p-3 text-sm text-ink/80 leading-relaxed max-h-36 overflow-y-auto">
              {originalText}
            </div>
          </div>

          <div className="flex items-center justify-center my-1 text-sub">
            <ArrowLeftRight className="w-4 h-4" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-ok">
              <Sparkles className="w-3.5 h-3.5" />
              <span>النتيجة بعد المعالجة والتحسين</span>
            </div>
            <div className="bg-ok-bg border border-ok/30 rounded-lg p-3 text-sm text-ink leading-relaxed max-h-48 overflow-y-auto">
              {improvedText}
            </div>
          </div>

          {/* Detailed Word Diff if chunks available */}
          {diffChunks.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-line">
              <span className="text-xs font-bold text-sub">تحليل الفروقات والكلمات:</span>
              <div className="bg-white border border-line rounded-lg p-3 text-sm leading-relaxed">
                {diffChunks.map((chunk, idx) => {
                  if (chunk.type === 'removed') {
                    return (
                      <span key={idx} className="bg-accent-dim text-accent line-through px-1 mx-0.5 rounded">
                        {chunk.value}
                      </span>
                    );
                  }
                  if (chunk.type === 'added') {
                    return (
                      <span key={idx} className="bg-ok-bg text-ok font-bold px-1 mx-0.5 rounded">
                        {chunk.value}
                      </span>
                    );
                  }
                  return <span key={idx}>{chunk.value}</span>;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-line bg-bg/40 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-sub hover:text-ink border border-line hover:border-ink rounded-lg transition-colors flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>إبقاء النص الأصلي</span>
          </button>
          <button
            onClick={onAccept}
            className="px-5 py-2 text-sm font-bold text-white bg-accent hover:bg-accent/90 rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>اعتماد النص المحسّن</span>
          </button>
        </div>
      </div>
    </div>
  );
};
