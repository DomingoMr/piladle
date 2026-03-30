import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiRankingService, GameMode, RankingEntry } from '../lib/ranking';

interface RankingSectionProps {
  mode: GameMode;
  score: number;
  onSaveName: (name: string) => void;
  savedName: string | null;
  playerId: string;
  allScores: Record<string, number>;
}

export function RankingSection({ mode, score, onSaveName, savedName, playerId, allScores }: RankingSectionProps) {
  const [nameInput, setNameInput] = useState('');
  const [showRanking, setShowRanking] = useState(!!savedName);
  const [dailyRanking, setDailyRanking] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showRanking && savedName) {
      setIsLoading(true);
      
      // Calculate global score to make sure it's up to date
      const totalScore = Object.values(allScores).reduce((sum, s) => sum + s, 0);
      
      Promise.all([
        ApiRankingService.saveScore(mode, score, savedName, playerId),
        ApiRankingService.saveScore('global', totalScore, savedName, playerId)
      ]).then(([modeRankings]) => {
        setDailyRanking(modeRankings);
        setIsLoading(false);
      });
    }
  }, [showRanking, savedName, mode, score, playerId, allScores]);

  const handleSave = () => {
    if (!nameInput.trim()) return;
    onSaveName(nameInput.trim());
    setShowRanking(true);
  };

  const userRank = dailyRanking.findIndex(r => r.playerId === playerId) + 1;
  const isTop3 = userRank > 0 && userRank <= 3;

  return (
    <div className="ranking-section">
      <AnimatePresence mode="wait">
        {!showRanking ? (
          <motion.div 
            key="entry"
            className="ranking-entry-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <p className="ranking-entry-text">Awesome! Enter your name to save your score and see the daily ranking.</p>
            <div className="ranking-entry-form">
              <input 
                type="text" 
                className="ranking-input" 
                placeholder="Your name..." 
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <button className="ranking-save-btn" onClick={handleSave}>Save</button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="ranking"
            className="ranking-results-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="ranking-results-title">Daily Ranking - {mode.toUpperCase()}</h3>
            
            {isTop3 && (
              <div className="ranking-congrats">
                <span className="sparkle">✨</span>
                Congratulations! You are in the Top 3!
                <span className="sparkle">✨</span>
              </div>
            )}

            <div className="ranking-list">
              {isLoading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading online rankings...</div>
              ) : (
                dailyRanking.slice(0, 3).map((entry, index) => (
                  <div key={index} className={`ranking-item rank-${index + 1} ${entry.playerId === playerId ? 'is-user' : ''}`}>
                  <div className="rank-badge">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  <div className="rank-name">{entry.name}</div>
                  <div className="rank-score">{entry.score} pts</div>
                </div>
              )))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
