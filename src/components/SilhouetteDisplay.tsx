import { motion } from 'framer-motion';
import type { DisneyCharacter } from '../types';

interface SilhouetteDisplayProps {
  secret: DisneyCharacter;
  guesses: DisneyCharacter[];
  hasWon: boolean;
}

export function SilhouetteDisplay({ secret, guesses, hasWon }: SilhouetteDisplayProps) {
  const attempts = guesses.length;

  // Initial: blur(20px) grayscale(100%) brightness(0.5)
  // Max attempts for progression: 5
  const maxProgression = 5;
  const progress = Math.min(attempts, maxProgression);

  const blurValue = hasWon ? 0 : Math.max(20 - progress * 4, 0);
  const grayscaleValue = hasWon ? 0 : Math.max(100 - progress * 20, 0);
  const brightnessValue = hasWon ? 1 : 0.5 + (progress * 0.1);

  const filterString = `blur(${blurValue}px) grayscale(${grayscaleValue}%) brightness(${brightnessValue})`;

  return (
    <div className="silhouette-header">
      <h2 className="silhouette-title">Who is this Disney character?</h2>


      <motion.div
        className="silhouette-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={`/silhouette/${secret.silhouettePath}`}
          alt="Character silhouette"
          className="silhouette-img"
          style={{ filter: filterString }}
        />
      </motion.div>
    </div>
  );
}
