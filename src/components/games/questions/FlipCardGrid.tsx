import WordImage from '@/components/WordImage';
import type { ChoiceRound } from '@/components/games/questions/questionShared';
import type { Word } from '@/lib/vocabulary';

interface FlipCardGridProps {
  options: Word[];
  target: Word;
  faceText: (word: Word) => string;
  round: ChoiceRound;
}

export default function FlipCardGrid({ options, target, faceText, round }: FlipCardGridProps) {
  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:gap-3">
      {options.map((option) => {
        const isWrongChoice = round.wrongIds.includes(option.id);
        const isCorrectCard = option.id === target.id;
        const isFlipped = isWrongChoice || round.isLocked;
        const borderClass = isWrongChoice
          ? 'border-rose-500'
          : isCorrectCard && round.isLocked
            ? round.isRevealed
              ? 'border-blue-500'
              : 'border-emerald-500'
            : round.isLocked
              ? 'border-slate-200 opacity-60'
              : 'border-slate-200 hover:border-blue-400 hover:shadow-md';
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => round.choose(option)}
            disabled={round.isLocked || isWrongChoice}
            aria-label={`${faceText(option)} kartı`}
            className={`relative aspect-square w-full overflow-hidden rounded-3xl border-2 bg-white transition-all duration-200 [perspective:1000px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ${borderClass}`}
          >
            <span
              className={`absolute inset-0 block transition-transform duration-500 [transform-style:preserve-3d] ${
                isFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              <span className="absolute inset-0 flex items-center justify-center overflow-hidden break-all whitespace-normal px-2 text-center text-base font-semibold leading-tight text-slate-900 [backface-visibility:hidden]">
                {faceText(option)}
              </span>
              <span className="absolute inset-0 overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <WordImage src={option.image_url} alt="" fit="cover" className="h-full w-full" />
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
