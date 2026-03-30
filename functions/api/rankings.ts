/// <reference types="@cloudflare/workers-types" />

export interface Env {
  RANKINGS: KVNamespace;
}

export type RankingEntry = {
  name: string;
  score: number;
  playerId: string;
};

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
