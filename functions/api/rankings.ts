/// <reference types="@cloudflare/workers-types" />

export interface Env {
  RANKINGS: KVNamespace;
}

export type RankingEntry = {
  name: string;
  score: number;
  playerId: string;
};

function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateUTC(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPeriodDates(baseDate: string, period: 'weekly' | 'monthly'): string[] {
  const base = parseDateString(baseDate);
  let start: Date;

  if (period === 'weekly') {
    const dayOfWeek = base.getUTCDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    start = new Date(base);
    start.setUTCDate(base.getUTCDate() - daysFromMonday);
  } else {
    start = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1));
  }

  const dates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= base) {
    dates.push(formatDateUTC(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function mergeRankingsByTotalScore(rankingsByDate: RankingEntry[][]): RankingEntry[] {
  const totals = new Map<string, RankingEntry>();
  for (const dayRanking of rankingsByDate) {
    for (const entry of dayRanking) {
      const existing = totals.get(entry.playerId);
      if (existing) {
        existing.score += entry.score;
        existing.name = entry.name;
      } else {
        totals.set(entry.playerId, { ...entry });
      }
    }
  }

  return [...totals.values()].sort((a, b) => b.score - a.score).slice(0, 100);
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  console.log("Starting GET request", context.request.url);
  try {
    if (!context.env || !context.env.RANKINGS) {
      console.error("KV Binding missing in GET!");
      return Response.json({ error: 'KV Binding RANKINGS is undefined in this environment' }, { status: 500 });
    }

    const url = new URL(context.request.url);
    const mode = url.searchParams.get('mode') || 'classic';
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
    const period = (url.searchParams.get('period') || 'daily') as 'daily' | 'weekly' | 'monthly';

    if (period !== 'daily' && period !== 'weekly' && period !== 'monthly') {
      return Response.json({ error: 'Invalid period' }, { status: 400 });
    }

    if (period === 'daily') {
      const key = `ranking:${date}:${mode}`;
      console.log("Fetching key:", key);

      const data = await context.env.RANKINGS.get(key);

      if (!data) {
        console.log("No data found, returning empty array.");
        return Response.json([]);
      }

      return new Response(data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const dates = getPeriodDates(date, period);
    const keys = dates.map((d) => `ranking:${d}:${mode}`);
    console.log(`Fetching ${keys.length} keys for ${period} ranking`);
    const dataByDate = await Promise.all(keys.map((key) => context.env.RANKINGS.get(key)));
    const parsedRankings = dataByDate
      .filter((data): data is string => !!data)
      .map((data) => JSON.parse(data) as RankingEntry[]);

    return Response.json(mergeRankingsByTotalScore(parsedRankings));
  } catch (err: any) {
    console.error("GET Error:", err);
    return Response.json({ error: 'GET Internal Error', message: err.message, stack: err.stack }, { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  console.log("Starting POST request");
  try {
    if (!context.env || !context.env.RANKINGS) {
      console.error("KV Binding missing in POST!");
      return Response.json({ error: 'KV Binding RANKINGS is undefined in this environment' }, { status: 500 });
    }

    const body = await context.request.json<{
      name: string;
      mode: string;
      score: number;
      date: string;
      playerId: string;
    }>();

    console.log("POST body received:", JSON.stringify(body));

    if (!body.name || !body.mode || typeof body.score !== 'number' || !body.date || !body.playerId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const key = `ranking:${body.date}:${body.mode}`;
    console.log("Saving to key:", key);

    // Get existing rankings
    const existingData = await context.env.RANKINGS.get(key);
    let rankings: RankingEntry[] = existingData ? JSON.parse(existingData) : [];

    // Find if user already exists
    const existingIndex = rankings.findIndex(r => r.playerId === body.playerId);

    if (existingIndex >= 0) {
      rankings[existingIndex].name = body.name;
      if (body.score > rankings[existingIndex].score) {
        rankings[existingIndex].score = body.score;
      }
    } else {
      rankings.push({
        name: body.name,
        score: body.score,
        playerId: body.playerId
      });
    }

    // Sort descending by score
    rankings.sort((a, b) => b.score - a.score);

    // Keep top 100
    rankings = rankings.slice(0, 100);

    // Save back to KV
    await context.env.RANKINGS.put(key, JSON.stringify(rankings));
    console.log("Saved successfully!");

    return Response.json(rankings);
  } catch (err: any) {
    console.error("POST Error:", err);
    return Response.json({ error: 'POST Internal Server Error', message: err.message, stack: err.stack }, { status: 500 });
  }
};
