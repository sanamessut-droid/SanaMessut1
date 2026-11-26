import { useCallback, useMemo, useState } from 'react';
import ListeningPlayer from '@/components/listening/ListeningPlayer';
import GameEndActions from '@/components/games/GameEndActions';
import {
  DEFAULT_LISTENING_SETTINGS,
  selectListeningWordsFromConfig,
  type ListeningOrder,
  type ListeningSettings,
} from '@/lib/listening';
import { useStoredState } from '@/hooks/useStoredState';
import { useLibrary } from '@/contexts/LibraryContext';
import type { GameSetupConfig } from '@/lib/games/gameConfig';
import type { Word } from '@/lib/vocabulary';

interface ListeningGameProps {
  order: ListeningOrder;
  words: Word[];
  config: GameSetupConfig;
  title: string;
  onExit: () => void;
  onRestart: () => void;
  onNext?: () => void;
}

export default function ListeningGame({ order, words, config, title, onExit, onRestart, onNext }: ListeningGameProps) {
  const { recordGameCompletion } = useLibrary();
  const [isFinished, setIsFinished] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [globalSettings] = useStoredState<ListeningSettings>(
    'sanasto.listeningSettings',
    DEFAULT_LISTENING_SETTINGS,
  );

  const queue = useMemo(() => selectListeningWordsFromConfig(words, config), [words, config]);

  const finishGame = useCallback(async () => {
    setFinishError(null);
    try {
      await recordGameCompletion(order === 'fi_tr' || order === 'fi_only' ? 'listen-fi-tr' : 'listen-tr-fi', queue.map((word) => word.id));
      setIsFinished(true);
    } catch {
      setFinishError('Dinleme oyunu tamamlanamadı. Lütfen tekrar deneyin.');
    }
  }, [order, queue, recordGameCompletion]);

  const lockedSettings = useMemo<ListeningSettings>(() => ({
    ...globalSettings,
    order,
  }), [globalSettings, order]);

  if (isFinished || queue.length === 0) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-2xl flex-col justify-center gap-6">
        <h1 className="text-center text-2xl font-bold text-slate-900">{title}</h1>
        <GameEndActions
          onRestart={onRestart}
          onNext={onNext}
          onExit={onExit}
        />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] overflow-hidden">
      {finishError && <p className="absolute left-3 right-3 top-16 z-20 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-800">{finishError}</p>}
      <ListeningPlayer
        queue={queue}
        settings={lockedSettings}
        title={title}
        onBack={onExit}
        onFinish={finishGame}
      />
    </div>
  );
}
