import { shuffle } from '@/lib/random';

export interface LetterTile {
  char: string;
  id: number;
}

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

function pickExtraLetters(existing: string[], count: number): string[] {
  const pool = [...ALPHABET].filter((c) => !existing.includes(c));
  const shuffled = shuffle(pool);
  const extras: string[] = [];
  for (let i = 0; i < shuffled.length && extras.length < count; i++) {
    extras.push(shuffled[i]);
  }
  return extras;
}

export function buildLetterTiles(text: string): LetterTile[] {
  const chars = [...text.normalize('NFC')];
  const uniqueChars = Array.from(new Set(chars));
  const targetCount = Math.max(chars.length, uniqueChars.length + 4);
  const extraCount = Math.max(0, targetCount - uniqueChars.length);
  const extras = pickExtraLetters(uniqueChars, extraCount);
  const allChars = Array.from(new Set([...uniqueChars, ...extras])).sort((a, b) =>
    a.localeCompare(b, 'fi'),
  );
  return allChars.map((char, index) => ({ char, id: index }));
}
