import { motion } from 'framer-motion';
import type { DisneyCharacter } from '../types';

type EmojiDisplayProps = {
  secret: DisneyCharacter;
  guesses: DisneyCharacter[];
  hasWon: boolean;
};

export function EmojiDisplay({ secret, guesses, hasWon }: EmojiDisplayProps) {
  const emojis = secret.emojis || [];
  
  // Unlocked count: start with 1, up to 5 emojis based on wrong guesses.
  // If won, show all 5.
  const unlockedCount = hasWon ? 5 : Math.min(1 + guesses.length, 5);

  return (
    <section className="emoji-display-section" aria-live="polite">
      <div className="emoji-header">
        <h3 className="emoji-title">Emojis Uncovered: <span>{unlockedCount}/5</span></h3>
      </div>
      
      <div className="emoji-cards">
        {Array.from({ length: 5 }).map((_, index) => {
          const isUnlocked = index < unlockedCount;
          const emoji = emojis[index];
          
          return (
            <motion.div
              key={index}
              className={`emoji-card-wrap ${isUnlocked ? 'is-unlocked' : 'is-locked'}`}
            >
              <motion.div
                className="emoji-card-inner"
                initial={false}
                animate={{ rotateY: isUnlocked ? 0 : 180 }}
                transition={{ duration: 0.7, type: 'spring', bounce: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front (Unlocked Emoji) */}
                <div className="emoji-card-face emoji-card-front">
                  <span className="emoji-char">{emoji}</span>
                </div>
                
                {/* Back (Locked Magic Sparkles) */}
                <div className="emoji-card-face emoji-card-back">
                  <span className="emoji-mystery">✨</span>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
