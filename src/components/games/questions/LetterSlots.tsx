interface LetterSlotsProps {
  chars: string[];
  hiddenIndexes: number[];
  values: (string | null)[];
  tone: 'default' | 'correct' | 'revealed' | 'wrong';
  errorSlot: number | null;
  compact?: boolean;
}

export default function LetterSlots({ chars, hiddenIndexes, values, tone, errorSlot, compact = false }: LetterSlotsProps) {
  return (
    <div className={`flex max-w-full flex-wrap items-end justify-center whitespace-normal ${compact ? 'gap-x-0.5 gap-y-1.5' : 'gap-x-1 gap-y-3'}`}>
      {chars.map((char, index) => {
        const isHidden = hiddenIndexes.includes(index);
        const value = isHidden ? values[hiddenIndexes.indexOf(index)] : null;
        const isError = errorSlot === index;

        if (!isHidden) {
          return (
            <span key={index} className={`flex items-end justify-center font-bold text-slate-700 ${compact ? 'h-6 w-1.5 text-sm sm:text-base' : 'h-8 w-2 text-lg sm:text-xl'}`}>
              {char.trim() ? char : ''}
            </span>
          );
        }

        let toneClass = 'border-slate-300 text-slate-900';
        if (tone === 'correct') toneClass = 'border-emerald-500 text-emerald-900';
        else if (tone === 'revealed') toneClass = 'border-blue-500 text-blue-900';
        else if (tone === 'wrong' || isError) toneClass = 'border-rose-500 text-rose-900';
        return (
          <span
            key={index}
            className={`flex items-end justify-center border-b-2 px-0.5 pb-0.5 font-bold leading-none ${compact ? 'h-6 min-w-3 text-sm sm:min-w-4 sm:text-base' : 'h-8 min-w-4 text-lg sm:min-w-5 sm:text-xl'} ${toneClass}`}
          >
            {value ?? ''}
          </span>
        );
      })}
    </div>
  );
}
