import type { LetterTile } from '@/lib/games/letterTiles';

interface LetterPickerProps {
  tiles: LetterTile[];
  values: (string | null)[];
  disabled: boolean;
  onPick: (tile: LetterTile) => void;
  compact?: boolean;
}

export default function LetterPicker({ tiles, values, disabled, onPick, compact = false }: LetterPickerProps) {
  const filledCount = values.filter((v) => v !== null).length;
  const maxSlots = values.length;

  return (
    <div className={`flex flex-wrap items-center justify-center ${compact ? 'gap-1' : 'gap-1.5'}`}>
      {tiles.map((tile) => {
        const isFullyUsed = filledCount >= maxSlots;
        return (
          <button
            key={tile.id}
            type="button"
            disabled={disabled || isFullyUsed}
            onClick={() => onPick(tile)}
            className={`flex items-center justify-center rounded-lg border border-slate-200 font-bold transition ${compact ? 'h-8 w-8 text-sm sm:h-9 sm:w-9 sm:text-base' : 'h-10 w-10 text-lg sm:h-12 sm:w-12 sm:text-xl'} ${
              disabled || isFullyUsed
                ? 'cursor-default bg-slate-50 text-slate-400'
                : 'bg-white text-slate-900 shadow-sm hover:bg-slate-50 active:scale-95 disabled:opacity-40'
            }`}
          >
            {tile.char}
          </button>
        );
      })}
    </div>
  );
}
