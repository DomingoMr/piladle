import { AnimatePresence, motion } from 'framer-motion';
import type { DisneyMelody } from '../types';

type SongTileState = 'exact' | 'near' | 'miss';

type SongTile = {
  key: string;
  label: string;
  value: string;
  state: SongTileState;
  hint?: string;
};

function yearState(guess: number, secret: number): SongTileState {
  if (guess === secret) return 'exact';
  if (Math.abs(guess - secret) <= 5) return 'near';
  return 'miss';
}

function yearHint(guess: number, secret: number) {
  if (guess === secret) return 'Exact';
  return guess < secret ? 'Later ↑' : 'Earlier ↓';
}

function createSongTiles(guess: DisneyMelody, secret: DisneyMelody): SongTile[] {
  const guessYear = guess.metadata.release_year ?? 0;
  const secretYear = secret.metadata.release_year ?? 0;
  return [
    {
      key: 'title',
      label: 'Song',
      value: guess.metadata.titles.en_US,
      state: guess.id === secret.id ? 'exact' : 'miss',
    },
    {
      key: 'movie',
      label: 'Movie',
      value: guess.metadata.movies.en_US,
      state: guess.metadata.movies.en_US === secret.metadata.movies.en_US ? 'exact' : 'miss',
    },
    {
      key: 'year',
      label: 'Year',
      value: guessYear ? String(guessYear) : '?',
      state: guessYear ? yearState(guessYear, secretYear) : 'miss',
      hint: guessYear ? yearHint(guessYear, secretYear) : undefined,
    },
  ];
}

type SongGuessBoardProps = {
  guesses: DisneyMelody[];
  secret: DisneyMelody;
};

const columns = ['Song', 'Movie', 'Year'];

export function SongGuessBoard({ guesses, secret }: SongGuessBoardProps) {
  return (
    <section className="board-wrap song-board-wrap" aria-live="polite">
      {guesses.length > 0 && (
        <div className="board-columns song-board-columns" aria-hidden="true">
          {columns.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      )}

      <AnimatePresence initial={false}>
        {[...guesses].reverse().map((guess, guessIndex) => {
          const tiles = createSongTiles(guess, secret);
          const isWinningRow = guess.id === secret.id;

          return (
            <motion.div
              layout="position"
              key={guess.id}
              className={`guess-row song-guess-row ${isWinningRow ? 'is-winner' : ''}`}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {tiles.map((tile, tileIndex) => (
                <motion.article
                  key={`${guess.id}-${tile.key}`}
                  className={`guess-tile is-${tile.state}`}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    duration: 1.4,
                    bounce: 0.55,
                    delay: tileIndex * 0.35 + guessIndex * 0.1,
                  }}
                >
                  <strong className="guess-tile__value">{tile.value}</strong>
                  {tile.hint ? <span className="guess-tile__hint">{tile.hint}</span> : null}
                </motion.article>
              ))}

              {isWinningRow && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20 }}>
                  {[...Array(12)].map((_, i) => {
                    const randomX = (Math.random() - 0.5) * 1000;
                    const randomY = (Math.random() - 0.5) * 120;
                    const randomDelay = Math.random() * 2;
                    const duration = 1.5 + Math.random() * 1.5;
                    const sizes = ['1.2rem', '1.6rem', '2rem', '2.5rem'];
                    const size = sizes[Math.floor(Math.random() * sizes.length)];

                    return (
                      <motion.div
                        key={i}
                        className="magic-star"
                        style={{ fontSize: size }}
                        initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                        animate={{
                          opacity: [0, 1, 0.8, 0],
                          scale: [0.5, 1.2, 0.8, 0],
                          x: randomX,
                          y: randomY,
                          rotate: 180,
                        }}
                        transition={{
                          duration,
                          repeat: Infinity,
                          delay: randomDelay,
                          ease: 'easeInOut',
                        }}
                      >
                        ✨
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </section>
  );
}
