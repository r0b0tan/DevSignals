export type Tone = 'neutral' | 'muted' | 'positive';

interface StatusPillProps {
  label: string;
  tone: Tone;
}

export function StatusPill({ label, tone }: StatusPillProps) {
  const toneClasses = {
    neutral: 'bg-gray-100/80 text-gray-600',
    muted: 'bg-amber-50/60 text-amber-700/80',
    positive: 'bg-emerald-50/60 text-emerald-700/80',
  };

  return (
    <span
      className={`inline-block rounded-md px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
