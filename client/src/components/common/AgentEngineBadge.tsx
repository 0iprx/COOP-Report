import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Cpu } from 'lucide-react';
import { api } from '../../services/api';

interface EngineStatus {
  state: 'disabled' | 'idle' | 'downloading' | 'loading' | 'ready' | 'error';
  tier: 'strong' | 'light' | null;
  availableMemoryGb: number;
  downloadedBytes: number;
  totalBytes: number;
}

/** Shows whether the site's built-in AI model is ready, downloading or unavailable */
export const AgentEngineBadge: React.FC<{ isAr: boolean }> = ({ isAr }) => {
  const { data } = useQuery<{ local: EngineStatus }>({
    queryKey: ['agentStatus'],
    queryFn: async () => (await api.get('/agent/status')).data,
    refetchInterval: (q) => {
      const s = q.state.data?.local?.state;
      return s === 'downloading' || s === 'loading' || s === 'idle' ? 4000 : false;
    }
  });
  const s = data?.local;
  if (!s) return null;

  const pct = s.totalBytes ? Math.round((s.downloadedBytes / s.totalBytes) * 100) : 0;
  const model = s.tier === 'light' ? 'Qwen2.5-1.5B' : 'Qwen2.5-3B';
  let label: string;
  let tone: string;
  switch (s.state) {
    case 'ready':
      label = isAr ? `الوكيل الذكي المدمج جاهز (${model})` : `Built-in AI agent ready (${model})`;
      tone = 'bg-ok-bg text-ok border-ok/30';
      break;
    case 'downloading':
      label = isAr ? `جارٍ تجهيز الوكيل الذكي لأول مرة… ${pct}%` : `Preparing built-in AI agent… ${pct}%`;
      tone = 'bg-warn-bg text-warn border-warn/30';
      break;
    case 'loading':
    case 'idle':
      label = isAr ? 'جارٍ تشغيل الوكيل الذكي…' : 'Starting built-in AI agent…';
      tone = 'bg-warn-bg text-warn border-warn/30';
      break;
    default:
      label = isAr
        ? 'الوكيل يعمل بالمحرك اللغوي المدمج (ذاكرة الخادم لا تكفي لتشغيل النموذج)'
        : 'Agent running on the built-in language engine (not enough server memory for the model)';
      tone = 'bg-bg text-sub border-line';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold no-print ${tone}`}>
      <Cpu className="w-3.5 h-3.5" />
      <span>{label}</span>
    </span>
  );
};
