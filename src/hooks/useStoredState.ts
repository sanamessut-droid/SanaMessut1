import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeStored<T>(defaults: T, parsed: unknown): T {
  if (isRecord(defaults) && isRecord(parsed)) {
    return { ...defaults, ...parsed } as T;
  }
  return parsed as T;
}

function readStored<T>(key: string, defaults: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaults;
    return mergeStored(defaults, JSON.parse(raw) as unknown);
  } catch {
    return defaults;
  }
}

function readRemote<T>(userMetadata: RecordValue | undefined, key: string, defaults: T): T | undefined {
  const appSettings = userMetadata?.app_settings;
  if (!isRecord(appSettings) || !(key in appSettings)) return undefined;
  return mergeStored(defaults, appSettings[key]);
}

export function useStoredState<T>(
  key: string,
  defaults: T,
): [T, Dispatch<SetStateAction<T>>] {
  const { user } = useAuth();
  const userKey = user?.id ?? 'anonymous';
  const defaultsRef = useRef(defaults);
  const skipWriteValue = useRef<string | null>(null);
  const [value, setValue] = useState<T>(() => readRemote(user?.user_metadata, key, defaultsRef.current) ?? readStored(key, defaultsRef.current));
  const [hydratedUserKey, setHydratedUserKey] = useState(userKey);

  useEffect(() => {
    const remoteValue = readRemote(user?.user_metadata, key, defaultsRef.current) ?? readStored(key, defaultsRef.current);
    const serializedValue = JSON.stringify(remoteValue);
    skipWriteValue.current = serializedValue;
    setValue((current) => JSON.stringify(current) === serializedValue ? current : remoteValue);
    setHydratedUserKey(userKey);
  }, [key, userKey]);

  useEffect(() => {
    if (hydratedUserKey !== userKey) return;
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    if (skipWriteValue.current === serializedValue) {
      skipWriteValue.current = null;
      return;
    }
    if (!userKey || userKey === 'anonymous') return;

    void supabase.auth.getUser().then(({ data }) => {
      const currentSettings = data.user?.user_metadata?.app_settings;
      const nextSettings = isRecord(currentSettings)
        ? { ...currentSettings, [key]: value }
        : { [key]: value };
      return supabase.auth.updateUser({ data: { app_settings: nextSettings } });
    });
  }, [hydratedUserKey, key, userKey, value]);

  return [value, setValue];
}
