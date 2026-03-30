export type Gender = 'Female' | 'Male' | 'Neutral';
export type Role = 'Hero' | 'Ally' | 'Villain';
export type TileState = 'exact' | 'near' | 'miss';

export type RawCharacter = {
  nombre: string;
  pelicula: string;
  rol: string;
  especie: string;
  poderes: 'Sí' | 'No' | string;
  año: number;
  género: string;
  emojis?: string[];
};

export type RawMovie = {
  title: string;
  year: number;
  characters: RawCharacter[];
};

export type RawDataset = {
  scope: unknown;
  movies: RawMovie[];
};

export type DisneyCharacter = {
  id: string;
  name: string;
  movie: string;
  role: Role;
  species: string;
  powers: boolean;
  year: number;
  gender: Gender;
  imageFile: string;
  emojis: string[];
  silhouettePath?: string;
};

export type ComparisonTile = {
  key: string;
  label: string;
  value: string;
  state: TileState;
  hint?: string;
  character?: DisneyCharacter;
};

// En tu archivo types.ts (o al principio de MelodyTester.tsx)
export interface AudioClue {
  attempt: number;
  start_time: number;
  end_time: number;
}

export interface DisneyMelody {
  id: string;
  day_number: number;
  metadata: {
    titles: { en_US: string; es_ES?: string; es_LA?: string };
    movies: { en_US: string; es_ES?: string; es_LA?: string };
    release_year?: number;
    spotify_url?: string;
  };
  search_aliases: string[];
  gameplay: {
    text_clues: string[];
    audio_source: {
      url: string;
      is_local: boolean;
      clues: AudioClue[];
    };
  };
}