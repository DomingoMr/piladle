import { useMemo, useState } from 'react';
import type { DisneyCharacter } from '../types';

type CharacterAvatarProps = {
  character: DisneyCharacter;
  size?: 'sm' | 'md';
};

export function CharacterAvatar({ character, size = 'md' }: CharacterAvatarProps) {
  const [missing, setMissing] = useState(false);
  const initials = useMemo(
    () =>
      character.name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase(),
    [character.name],
  );
  const src = `/characters/${character.imageFile}`;

  if (missing) {
    return <span className={`character-avatar character-avatar--${size} is-fallback`}>{initials}</span>;
  }

  return (
    <img
      className={`character-avatar character-avatar--${size}`}
      src={src}
      alt={`Character ${character.name} in Pixadle`}
      loading="lazy"
      onError={() => setMissing(true)}
    />
  );
}
