import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import GameFeedback from '@/components/games/GameFeedback';
import SpeakButton from '@/components/SpeakButton';
import WordImage from '@/components/WordImage';
import { choiceClass, useRevealShortcut, type QuestionProps } from '@/components/games/questions/questionShared';
import { useAutoSpeak } from '@/hooks/useAutoSpeak';
import { useSpeaker } from '@/hooks/useSpeaker';
import { toWordResult, type WordResult } from '@/lib/games/types';
import type { Word } from '@/lib/vocabulary';

interface ListenChoiceQuestionProps extends QuestionProps {
  word: Word;
  options: Word[];
}

export default function ListenChoiceQuestion({ word, options, onDone, isSaving }: ListenChoiceQuestionProps) {
  const speak = useSpeaker();
  useAutoSpeak(word.finnish, 'fi');
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const isLocked = isSolved || isRevealed;
  const hadWrongAttempt = wrongIds.length > 0;
  useRevealShortcut(() => setIsRevealed(true));
  const results: WordResult[] = [toWordResult(word, !hadWrongAttempt && !isRevealed)];

  const choose = (option: Word) => {
    if (isLocked || wrongIds.includes(option.id)) return;
    if (option.id === word.id) {
      setIsSolved(true);
    } else {
      setWrongIds((previous) => [...previous, option.id]);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => void speak(word.finnish, 'fi')}
          className="inline-flex h-auto min-h-16 w-full items-center justify-center gap-2 rounded-3xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800 shadow-sm transition hover:bg-blue-100"
        >
          <Volume2 className="h-4 w-4" aria-hidden="true" /> Dinle
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => choose(option)}
            disabled={isLocked || wrongIds.includes(option.id)}
            className={`${choiceClass(isLocked, option.id === word.id, wrongIds.includes(option.id), isRevealed)} overflow-hidden`}
          >
            <WordImage src={option.image_url} alt="" fit="cover" className="aspect-square w-full" />
          </button>
        ))}
      </div>

      {(isSolved || hadWrongAttempt || isRevealed) && (
        <GameFeedback
          correct={isSolved || isRevealed}
          title={isRevealed ? 'Cevap gösterildi' : isSolved ? 'Doğru!' : 'Yanlış cevap, tekrar deneyin'}
          detail={
            <span className="flex flex-wrap items-center gap-3">
              Doğru Fince kelime: <strong>{word.finnish}</strong>
              <SpeakButton text={word.finnish} language="fi" label="Fince telaffuz" />
            </span>
          }
          isRevealed={isRevealed}
          isReady
          isSaving={isSaving}
          onReveal={() => setIsRevealed(true)}
          showActionButton={false}
          feedbackKey={wrongIds.length}
          onContinue={() => onDone(results)}
        />
      )}
    </section>
  );
}
