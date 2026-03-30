import { motion } from 'framer-motion';

interface CardDisplayProps {
  cardUrl: string;
  guesses: number;
  hasWon: boolean;
}

export function CardDisplay({ cardUrl, guesses, hasWon }: CardDisplayProps) {
  // Reveal progression: blur(20px) -> 15px -> 10px -> 5px -> 0px
  const blurValue = hasWon ? 0 : Math.max(20 - guesses * 5, 0);

  return (
    <div className="silhouette-header">
      <h2 className="silhouette-title">Who is hiding in this Lorcana card?</h2>

      <motion.div
        className="card-display-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={cardUrl}
          alt="Lorcana Card"
          className="card-display-img"
          style={{ filter: `blur(${blurValue}px)` }}
        />
      </motion.div>
    </div>
  );
}
