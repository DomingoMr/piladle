import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiRankingService, RankingEntry } from '../lib/ranking';

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string | null;
  playerId: string;
}

export function RankingModal({ isOpen, onClose, userName, playerId }: RankingModalProps) {
  const [globalRanking, setGlobalRanking] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      ApiRankingService.getRanking('global').then((rankings) => {
        setGlobalRanking(rankings);
        setIsLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="hint-modal-overlay"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="hint-modal-content ranking-modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
        >
          <button className="hint-modal-close" onClick={onClose}>&times;</button>
          <h2 className="ranking-modal-title">🏆 Global Ranking 🏆</h2>
          <p className="ranking-modal-subtitle">Today score across all daily modes</p>

          <div className="ranking-modal-list">
            {isLoading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading online rankings...</div>
            ) : globalRanking.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No scores yet today!</div>
            ) : (
              globalRanking.map((entry, index) => {
                const isRealRank = index < 100; // showing all top 100
                const rankDisplay = isRealRank ? index + 1 : '...';

                return (
                  <div key={index} className={`ranking-modal-item ${entry.playerId === playerId ? 'is-user' : ''}`}>
                    <div className="rank-num">{rankDisplay}</div>
                    <div className="rank-name">{entry.name}</div>
                    <div className="rank-score">{entry.score} pts</div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
