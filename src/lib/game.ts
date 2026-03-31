import type { ComparisonTile, DisneyCharacter, DisneyMelody, TileState } from '../types';

const EPOCH_UTC = Date.UTC(2025, 0, 1);
const MS_PER_DAY = 86_400_000;

function getLocalDayIndex(): number {
  const d = new Date();
  // Get milliseconds for the exact start (midnight) of the user's current local day
  const localMidnightUtc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.floor((localMidnightUtc - EPOCH_UTC) / MS_PER_DAY);
}

/**
 * Returns the current date in YYYY-MM-DD format based on the user's local midnight.
 * This ensures that rankings and challenges are always in sync regardless of UTC time.
 */
export function getGameDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Shared logic for character-based modes to guarantee no collisions on the same day.
 * We use a large prime jump for randomization and fixed offsets to space them out.
 */
function getPartitionedIndex(modulus: number, slot: 0 | 1 | 2, dayIndex: number): number {
  if (modulus < 3) return dayIndex % modulus; // Fallback for tiny pools
  const primeStep = 1000003;
  const baseSeed = (dayIndex * primeStep) % modulus;
  const offset = Math.floor(modulus / 3);
  let finalIndex = (baseSeed + slot * offset) % modulus;
  if (finalIndex < 0) finalIndex += modulus;
  return finalIndex;
}

export function getDailyCharacter(characters: DisneyCharacter[]): DisneyCharacter {
  const dayIndex = getLocalDayIndex();
  const index = getPartitionedIndex(characters.length, 0, dayIndex);
  return characters[index];
}

export function getDailyEmojiCharacter(characters: DisneyCharacter[]): DisneyCharacter {
  const dayIndex = getLocalDayIndex();
  
  // All characters currently have 5+ emojis, so we pick from the full list
  // but use a different slot to avoid collisions with Classic/Silhouette.
  const index = getPartitionedIndex(characters.length, 1, dayIndex);
  return characters[index];
}

export function getDailySilhouetteCharacter(characters: DisneyCharacter[]): DisneyCharacter {
  const dayIndex = getLocalDayIndex();
  const index = getPartitionedIndex(characters.length, 2, dayIndex);
  return characters[index];
}

export function getDailySong(melodies: DisneyMelody[]): DisneyMelody {
  const dayIndex = getLocalDayIndex();
  
  // Use a unique prime and offset for song randomization
  const primeStep = 1000049; 
  let seed = ((dayIndex + 1460) * primeStep) % melodies.length;
  if (seed < 0) seed += melodies.length;
  
  return melodies[seed];
}

function stateForMatch(isExact: boolean): TileState {
  return isExact ? 'exact' : 'miss';
}

function yearState(guess: number, secret: number): TileState {
  if (guess === secret) return 'exact';
  if (Math.abs(guess - secret) <= 5) return 'near';
  return 'miss';
}

function yearHint(guess: number, secret: number) {
  if (guess === secret) return 'Exact';
  return guess < secret ? 'Later ↑' : 'Earlier ↓';
}

export function getDailyCard(lorcanaPool: Record<string, any[]>): { characterName: string; card: any } {
  const dayIndex = getLocalDayIndex();
  const characterNames = Object.keys(lorcanaPool).sort(); // Sort to ensure consistent indexing

  const charPrimeStep = 1000039;
  let charSeed = ((dayIndex + 1095) * charPrimeStep) % characterNames.length;
  if (charSeed < 0) charSeed += characterNames.length;
  const characterName = characterNames[charSeed];

  const cards = lorcanaPool[characterName];
  const cardPrimeStep = 1000043;
  let cardSeed = ((dayIndex + 2190) * cardPrimeStep) % cards.length;
  if (cardSeed < 0) cardSeed += cards.length;
  const card = cards[cardSeed];

  return { characterName, card };
}

export function createTileComparisons(guess: DisneyCharacter, secret: DisneyCharacter): ComparisonTile[] {
  return [
    {
      key: 'character',
      label: 'Character',
      value: guess.name,
      state: stateForMatch(guess.id === secret.id),
      character: guess,
    },
    {
      key: 'movie',
      label: 'Movie',
      value: guess.movie,
      state: stateForMatch(guess.movie === secret.movie),
    },
    {
      key: 'role',
      label: 'Role',
      value: guess.role,
      state: stateForMatch(guess.role === secret.role),
    },
    {
      key: 'gender',
      label: 'Gender',
      value: guess.gender,
      state: stateForMatch(guess.gender === secret.gender),
    },
    {
      key: 'species',
      label: 'Species',
      value: guess.species,
      state: stateForMatch(guess.species === secret.species),
    },
    {
      key: 'magic',
      label: 'Magic',
      value: guess.powers ? 'Magic' : 'No magic',
      state: stateForMatch(guess.powers === secret.powers),
    },
    {
      key: 'year',
      label: 'Year',
      value: String(guess.year),
      state: yearState(guess.year, secret.year),
      hint: yearHint(guess.year, secret.year),
    },
  ];
}
