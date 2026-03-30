import { useRef, useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { DisneyMelody } from '../types';
import { SongGuessBoard } from './SongGuessBoard';
import rawMelodies from '../data/disney-pixar-songs.json';

// Snippet duration in seconds per attempt index (0-based)
const SNIPPET_DURATIONS = [3, 4.5, 6];

type SongDisplayProps = {
  secret: DisneyMelody;
  guessedSongIds: string[];
  guessedSongs: DisneyMelody[];
  onGuess: (song: DisneyMelody) => void;
  hasWon: boolean;
  hintRevealed: boolean;
  onHintReveal: () => void;
};

const allSongs = rawMelodies as DisneyMelody[];

export function SongDisplay({
  secret,
  guessedSongIds,
  guessedSongs,
  onGuess,
  hasWon,
  hintRevealed,
  onHintReveal,
}: SongDisplayProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Search state — mirrors SearchCombobox exactly
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [searchBy, setSearchBy] = useState<'song' | 'movie'>('song');

  const attemptCount = guessedSongIds.length;
  const clueIndex = Math.min(attemptCount, SNIPPET_DURATIONS.length - 1);
  const snippetDuration = SNIPPET_DURATIONS[clueIndex];
  // Hint unlocks on 4th attempt (index 3)
  const showHintTrigger = attemptCount >= 3 && !hasWon;

  const audioBase = import.meta.env.VITE_URL_SONGS ?? '/audio/melodies';
  const audioUrl = `${audioBase}/${secret.id}.mp3`;

  // Song suggestions — same style as SearchCombobox
  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const alreadyGuessed = new Set(guessedSongIds);
    if (!normalized) return [];
    return allSongs
      .filter((s) => !alreadyGuessed.has(s.id))
      .filter((s) => {
        if (searchBy === 'song') {
          return (
            s.metadata.titles.en_US.toLowerCase().startsWith(normalized) ||
            s.search_aliases.some((a) => a.toLowerCase().startsWith(normalized))
          );
        } else {
          return s.metadata.movies.en_US.toLowerCase().includes(normalized);
        }
      })
      .slice(0, 8);
  }, [query, guessedSongIds, searchBy]);

  // Stop audio on unmount or secret change
  useEffect(() => {
    return () => stopAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secret.id]);

  // Cancel any in-flight RAF and fully stop audio
  function stopAudio() {
    // Cancel RAF first — must happen before pause() to avoid the tick
    // calling stopAudio() again from the a.paused check
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      // Reset to beginning so browser doesn't stay in "ended" state.
      // Safari refuses to re-seek from an ended position without this,
      // causing the "need two clicks" bug.
      audio.currentTime = 0;
    }
    setIsPlaying(false);
  }

  async function handlePlayPause() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      stopAudio();
      return;
    }

    // Always start from 0 and stop at snippetDuration (3s, 4.5s, 6s)
    // The JSON start_time/end_time are ignored as the audio files are already clipped to 6s.
    const startTime = 0;
    const endTime = snippetDuration;

    try {
      // Some browsers (Safari) need the audio to be buffered before seeking.
      // If readyState is too low, wait for canplay before proceeding.
      if (audio.readyState < 3 /* HAVE_FUTURE_DATA */) {
        await new Promise<void>((resolve, reject) => {
          const onCanPlay = () => {
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
            resolve();
          };
          const onError = () => {
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('error', onError);
            reject(new Error('Audio load error'));
          };
          audio.addEventListener('canplay', onCanPlay, { once: true });
          audio.addEventListener('error', onError, { once: true });
          audio.load();
        });
      }

      audio.currentTime = startTime;
      await audio.play();
      setIsPlaying(true);

      // RAF loop — uses audio.currentTime for drift-free progress
      const tick = () => {
        const a = audioRef.current;
        if (!a) return;

        const elapsed = a.currentTime; // Simplified since startTime is 0

        if (a.paused || a.ended || a.currentTime >= endTime - 0.05) {
          stopAudio();
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err) {
      console.error('Audio error:', err);
      setIsPlaying(false);
    }
  }

  function submit(song: DisneyMelody | undefined) {
    if (!song) return;
    onGuess(song);
    setQuery('');
    setOpen(false);
  }

  return (
    <div className="song-display">
      {/* Player card */}
      <div className="song-player-card">
        <div className="song-player-header">
          <span className="song-player-icon">🎵</span>
          <span className="song-player-label">Guess the Disney Song</span>
        </div>

        {/* Attempt chips */}
        <div className="song-attempts">
          {SNIPPET_DURATIONS.map((dur, i) => {
            const label = i === 0 ? '3s' : i === 1 ? '4.5s' : '6s';
            const isUsed = attemptCount > i;
            const isCurrent = (attemptCount === i || (i === 2 && attemptCount > 2)) && !hasWon;
            return (
              <div
                key={i}
                className={`song-attempt-chip${isUsed ? ' is-used' : ''}${isCurrent ? ' is-current' : ''}`}
              >
                {label}
              </div>
            );
          })}
        </div>

        {/* Play + progress bar */}
        <div className="song-player-controls">
          <button
            className={`song-play-btn${isPlaying ? ' is-playing' : ''}`}
            onClick={handlePlayPause}
            type="button"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <div className="song-progress-wrap">
            <div className="song-progress-track" />
          </div>
          <span className="song-duration-label">{snippetDuration}s</span>
        </div>

        <audio ref={audioRef} src={audioUrl} preload="auto" />
      </div>

      {/* Win reveal */}
      {hasWon && (
        <div className="song-win-reveal">
          <div className="song-win-title">🎉Nice!</div>
          <div className="song-win-song">{secret.metadata.titles.en_US}</div>
          <div className="song-win-movie">
            from <em>{secret.metadata.movies.en_US}</em>
          </div>
        </div>
      )}

      {/* Search — identical structure to SearchCombobox */}
      {!hasWon && (
        <div className="search-box song-search-wrap">
          <div className="search-box__field">
            <input
              aria-label={searchBy === 'song' ? 'Search a Disney song' : 'Search a movie'}
              className="search-box__input"
              placeholder={searchBy === 'song' ? 'Search a Disney song…' : 'Search a movie…'}
              value={query}
              autoComplete="off"
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
                setActiveIndex(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setOpen(true);
                  setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setActiveIndex((i) => Math.max(i - 1, 0));
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  submit(suggestions[activeIndex] ?? suggestions[0]);
                } else if (e.key === 'Escape') {
                  setOpen(false);
                }
              }}
            />
            <button
              type="button"
              className="search-box__submit"
              onClick={() => submit(suggestions[activeIndex] ?? suggestions[0])}
              disabled={suggestions.length === 0}
              aria-label="Submit guess"
            >
              ➜
            </button>
          </div>

          {/* Search-by toggle */}
          <div className="search-mode-wrap">
            <label className="search-mode-toggle">
              <span className="search-mode-label">Search by Movie</span>
              <div className="switch">
                <input
                  type="checkbox"
                  checked={searchBy === 'movie'}
                  onChange={(e) => {
                    setSearchBy(e.target.checked ? 'movie' : 'song');
                    setQuery('');
                    setOpen(false);
                  }}
                />
                <span className="slider round" />
              </div>
            </label>
          </div>

          {/* Dropdown */}
          <AnimatePresence>
            {open && suggestions.length > 0 ? (
              <motion.div
                className="search-dropdown"
                initial={{ opacity: 0, y: 10, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.985 }}
                transition={{ duration: 0.16 }}
              >
                {suggestions.map((song, idx) => (
                  <button
                    key={song.id}
                    type="button"
                    className={`search-option ${idx === activeIndex ? 'is-active' : ''}`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => submit(song)}
                  >
                    <span className="song-option-icon">🎵</span>
                    <span className="search-option__text">
                      <span className="search-option__name">{song.metadata.titles.en_US}</span>
                      <span className="search-option__meta">{song.metadata.movies.en_US}</span>
                    </span>
                  </button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      )}

      {/* Magical Hint trigger — between search and board */}
      {showHintTrigger && (
        <div className="hint-trigger-wrap" style={open && suggestions.length > 0 ? { visibility: 'hidden' } : undefined}>
          <button
            className={`hint-trigger-btn${hintRevealed ? ' hint-trigger-btn--revealed' : ''}`}
            onClick={onHintReveal}
            type="button"
            disabled={hintRevealed}
          >
            <span className="hint-trigger-sparkle">✨</span>
            <span>{hintRevealed ? 'Hint revealed!' : 'Magical Hint'}</span>
            <span className="hint-trigger-sparkle">✨</span>
          </button>
        </div>
      )}

      {/* Guess board — below hint trigger */}
      <SongGuessBoard guesses={guessedSongs} secret={secret} />
    </div>
  );
}
