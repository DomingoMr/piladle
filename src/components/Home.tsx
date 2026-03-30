import type { ReactNode } from 'react';

export type ModeButtonProps = {
  id: string;
  name: string;
  subtitle: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
};

export function ModeButton({ name, subtitle, icon, active, onClick }: ModeButtonProps) {
  return (
    <button
      type="button"
      className={`mode-btn ${active ? 'is-active' : 'is-locked'}`}
      onClick={onClick}
      disabled={!active}
    >
      <div className="mode-icon-wrap">
        <div className="mode-icon">{icon}</div>
      </div>
      <div className="mode-content">
        <span className="mode-name">{name}</span>
        <span className="mode-subtitle">{active ? subtitle : 'coming...'}</span>
      </div>
    </button>
  );
}

type HomeProps = {
  onSelectMode: (mode: 'classic' | 'emoji' | 'silhouette' | 'song' | 'card') => void;
  onOpenReport: () => void;
  onOpenRanking: () => void;
};

export function Home({ onSelectMode, onOpenReport, onOpenRanking }: HomeProps) {
  return (
    <main className="home-stage">
      <header className="home-header">
        <img src="/logo.png" alt="Mousdle - The daily character guessing challenge" className="home-logo" />
        <h1 className="home-subtitle">Guess the daily Disney Pixar character</h1>
      </header>

      <div className="home-report-wrap">
        <button
          className="glow-icon-btn"
          onClick={onOpenReport}
          aria-label="Report Bug"
          data-tooltip="Report Bug"
        >
          <span>📩</span>
        </button>
        <button
          className="glow-icon-btn"
          onClick={onOpenRanking}
          aria-label="Ranking"
          data-tooltip="Ranking"
        >
          <span>🏆</span>
        </button>
        <a
          href="https://ko-fi.com/yensid"
          target="_blank"
          rel="noopener noreferrer"
          className="glow-icon-btn"
          aria-label="Support us"
          data-tooltip="Support us"
        >
          <span>☕</span>
        </a>
      </div>

      <section className="home-modes">
        <ModeButton
          id="classic"
          name="Classic"
          subtitle="Get clues with every try"
          icon="✨"
          active={true}
          onClick={() => onSelectMode('classic')}
        />
        <ModeButton
          id="emoji"
          name="Emoji"
          subtitle="Guess with a set of emojis"
          icon="😃"
          active={true}
          onClick={() => onSelectMode('emoji')}
        />
        <ModeButton
          id="silhouette"
          name="Silhouette"
          subtitle="Whose silhouette is this?"
          icon="👤"
          active={true}
          onClick={() => onSelectMode('silhouette')}
        />
        <ModeButton
          id="song"
          name="Song"
          subtitle="Guess the song!"
          icon="🎵"
          active={true}
          onClick={() => onSelectMode('song')}
        />
        <ModeButton
          id="card"
          name="Card"
          subtitle="Whose card is this?"
          icon={<img src="/lorcana.png" alt="Lorcana" style={{ width: '65%', height: '65%', objectFit: 'contain', backgroundColor: 'transparent', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />}
          active={true}
          onClick={() => onSelectMode('card')}
        />
      </section>

    </main>
  );
}
