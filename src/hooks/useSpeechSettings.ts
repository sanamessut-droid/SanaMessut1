import { useCallback, useEffect, useRef, useState } from 'react';
import { useStoredState } from '@/hooks/useStoredState';
import { getVoices, pickBestVoice, subscribeToVoiceChanges, type SpeechLanguage } from '@/lib/speech';

const STORAGE_KEY = 'sanasto.speechSettings';

export interface SpeechSettings {
  rate: number;
  fiVoiceURI: string | null;
  trVoiceURI: string | null;
}

export const DEFAULT_SPEECH_SETTINGS: SpeechSettings = {
  rate: 0.9,
  fiVoiceURI: null,
  trVoiceURI: null,
};

export function useSpeechSettings() {
  const [settings, setSettings] = useStoredState<SpeechSettings>(STORAGE_KEY, DEFAULT_SPEECH_SETTINGS);
  const updateSettings = useCallback((patch: Partial<SpeechSettings>) => {
    setSettings((current) => ({ ...current, ...patch }));
  }, [setSettings]);

  return { settings, updateSettings };
}

export function useVoices(language: SpeechLanguage): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => getVoices(language));

  useEffect(() => {
    setVoices(getVoices(language));
    return subscribeToVoiceChanges(() => setVoices(getVoices(language)));
  }, [language]);

  return voices;
}

export function useAutoPickVoices() {
  const { settings, updateSettings } = useSpeechSettings();
  const fiVoices = useVoices('fi');
  const trVoices = useVoices('tr');
  const autoPickedFi = useRef(new Set<string>());
  const autoPickedTr = useRef(new Set<string>());

  useEffect(() => {
    if (settings.fiVoiceURI !== null || fiVoices.length === 0) return;
    const best = pickBestVoice('fi');
    if (best && !autoPickedFi.current.has(best.voiceURI)) {
      autoPickedFi.current.add(best.voiceURI);
      updateSettings({ fiVoiceURI: best.voiceURI });
    }
  }, [fiVoices, settings.fiVoiceURI, updateSettings]);

  useEffect(() => {
    if (settings.trVoiceURI !== null || trVoices.length === 0) return;
    const best = pickBestVoice('tr');
    if (best && !autoPickedTr.current.has(best.voiceURI)) {
      autoPickedTr.current.add(best.voiceURI);
      updateSettings({ trVoiceURI: best.voiceURI });
    }
  }, [settings.trVoiceURI, trVoices, updateSettings]);

  return { settings, updateSettings };
}
