import { AnimatePresence, motion } from 'framer-motion';
import { createTileComparisons } from '../lib/game';
import type { DisneyCharacter } from '../types';
import { CharacterAvatar } from './CharacterAvatar';

type GuessBoardProps = {
  guesses: DisneyCharacter[];
  secret: DisneyCharacter;
};

const columns = ['Character', 'Movie', 'Role', 'Gender', 'Species', 'Magic', 'Year'];

export function GuessBoard({ guesses, secret }: GuessBoardProps) {
  return (
    <section className="board-wrap" aria-live="polite">
      {guesses.length > 0 && (
        <div className="board-columns" aria-hidden="true">
          {columns.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      )}

      <AnimatePresence initial={false}>
        {[...guesses].reverse().map((guess, guessIndex) => {
          const tiles = createTileComparisons(guess, secret);
          const isWinningRow = guess.id === secret.id;

          return (
            <motion.div
              layout="position"
              key={guess.id}
              className={`guess-row ${isWinningRow ? 'is-winner' : ''}`}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {tiles.map((tile, tileIndex) => (
                <motion.article
                  key={`${guess.id}-${tile.key}`}
                  className={`guess-tile is-${tile.state} ${tile.key === 'character' ? 'guess-tile--character' : ''}`}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    duration: 1.4,
                    bounce: 0.55,
                    delay: tileIndex * 0.35 + guessIndex * 0.1,
                  }}
                >
                  {tile.key === 'character' && tile.character ? (
                    <div className="guess-tile__character">
                      <CharacterAvatar character={tile.character} size="md" />
                      <span className="guess-tile__character-name">{tile.value}</span>
                    </div>
                  ) : (
                    <>
                      <strong className="guess-tile__value">{tile.value}</strong>
                      {tile.hint ? <span className="guess-tile__hint">{tile.hint}</span> : null}
                    </>
                  )}
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
                          ease: "easeInOut"
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
