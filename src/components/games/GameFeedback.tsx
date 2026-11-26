import { useEffect, useRef } from 'react';

const AUTO_CONTINUE_MS = 1000;

interface GameFeedbackProps {
  correct: boolean;
  title: string;
  detail?: React.ReactNode;
  isRevealed?: boolean;
  isReady?: boolean;
  isSaving: boolean;
  onReveal?: () => void;
  onContinue: () => void;
  showActionButton?: boolean;
  feedbackKey?: string | number;
}

export default function GameFeedback({
  correct,
  isReady = true,
  onContinue,
  showActionButton = true,
}: GameFeedbackProps) {
  const continueRef = useRef(onContinue);
  const hasContinuedRef = useRef(false);

  useEffect(() => {
    continueRef.current = onContinue;
  });

  useEffect(() => {
    hasContinuedRef.current = false;
  }, [correct, isReady, showActionButton]);

  useEffect(() => {
    if (!isReady || (!correct && !showActionButton)) return;
    const timer = window.setTimeout(() => {
      if (hasContinuedRef.current) return;
      hasContinuedRef.current = true;
      continueRef.current();
    }, AUTO_CONTINUE_MS);
    return () => window.clearTimeout(timer);
  }, [correct, isReady, showActionButton]);

  return null;
}
