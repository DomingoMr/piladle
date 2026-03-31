import { getGameDateString } from './game';

export type RankingEntry = {
  name: string;
  score: number;
  playerId: string;
};

export type GameMode = 'classic' | 'emoji' | 'silhouette' | 'song' | 'card';

export function calculateScore(attempts: number): number {
  if (attempts === 0) return 0;
  if (attempts === 1) return 1000;
  if (attempts === 2) return 850;
  if (attempts === 3) return 700;
  if (attempts === 4) return 500;
  if (attempts === 5) return 300;
  return 100;
}

export const ApiRankingService = {
  async getRanking(mode: string): Promise<RankingEntry[]> {
    try {
      const date = getGameDateString();
      console.log(`[Frontend] Fetching ranking for mode: ${mode}, date: ${date}`);
      const res = await fetch(`/api/rankings?mode=${mode}&date=${date}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[Frontend] GET /api/rankings failed with status ${res.status}:`, errorText);
        return [];
      }
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("[Frontend] Network or Parse error in getRanking:", err);
      return [];
    }
  },

  async saveScore(mode: string, score: number, name: string, playerId: string): Promise<RankingEntry[]> {
    try {
      const date = getGameDateString();
      console.log(`[Frontend] Saving score for mode: ${mode}, score: ${score}`);
      const res = await fetch('/api/rankings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          mode,
          score,
          date,
          playerId
        })
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[Frontend] POST /api/rankings failed with status ${res.status}:`, errorText);
        throw new Error('Failed to save score');
      }
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("[Frontend] Error in saveScore:", err);
      return [];
    }
  }
};
