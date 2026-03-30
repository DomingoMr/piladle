import React, { useRef, useState } from 'react';
import rawMelodies from '../data/disney-songs.json';
import type { DisneyMelody } from '../types';

// Hacemos el casteo de los datos crudos a nuestra interfaz
const melodies = rawMelodies as DisneyMelody[];

// Subcomponente para manejar el reproductor individual de cada botón de intento
const AudioSnippetPlayer = ({
    songId,
    attempt,
    startTime,
    endTime
}: {
    songId: string;
    attempt: number;
    startTime: number;
    endTime: number;
}) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // 1. CORRECCIÓN DE RUTA: Debe coincidir exactamente con la estructura dentro de /public
    const audioUrl = `/public/audio/melodies/${songId}.mp3`;
    const duration = (endTime - startTime).toFixed(1);

    const playSnippet = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        // Pausar si ya está sonando
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
            return;
        }

        try {
            // 2. Aplicar el tiempo de inicio
            audio.currentTime = startTime;

            // 3. Await en la promesa de reproducción (captura el NotSupportedError)
            await audio.play();
            setIsPlaying(true);

            // 4. Detener exactamente cuando llegue al end_time
            const stopAudio = () => {
                if (audio.currentTime >= endTime) {
                    audio.pause();
                    setIsPlaying(false);
                    audio.removeEventListener('timeupdate', stopAudio);
                }
            };

            audio.addEventListener('timeupdate', stopAudio);
        } catch (error) {
            console.error(`❌ Error al reproducir ${songId}:`, error);
            alert(`No se encontró el audio en la ruta: ${audioUrl}\nRevisa la consola para más detalles.`);
            setIsPlaying(false);
        }
    };

    return (
        <div className="audio-snippet" style={{ display: 'inline-block', marginRight: '10px' }}>
            <button
                onClick={playSnippet}
                style={{
                    padding: '8px 12px',
                    backgroundColor: isPlaying ? '#ff4757' : '#1e90ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                {isPlaying ? '⏹ Detener' : `▶ Intento ${attempt} (${duration}s)`}
            </button>

            {/* 5. CORRECCIÓN: preload="metadata" es obligatorio para poder hacer 'seek' (currentTime) */}
            <audio ref={audioRef} src={audioUrl} preload="metadata" />
        </div>
    );
};

export const MelodyTester = () => {
    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', color: 'white' }}>
            <h2>🎵 Entorno de Pruebas: Disney Melody</h2>
            <p>Audita las letras y los cortes de audio antes de integrar al juego principal.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                {melodies.map((melody) => (
                    <div
                        key={melody.id}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            padding: '15px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}
                    >
                        <h3>{melody.metadata.titles.en_US} <small style={{ opacity: 0.7 }}>({melody.metadata.movies.en_US})</small></h3>
                        <p style={{ fontSize: '0.8em', color: '#aaa' }}>ID: {melody.id}</p>

                        <div style={{ margin: '15px 0' }}>
                            <strong>📝 Pistas de Letra:</strong>
                            <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                                {melody.gameplay.text_clues.map((clue, idx) => (
                                    <li key={idx} style={{ marginBottom: '4px' }}>
                                        <span style={{ color: '#ffd32a' }}>Intento {idx + 1}:</span> {clue}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div style={{ marginTop: '15px' }}>
                            <strong>🔊 Pistas de Audio:</strong>
                            <div style={{ marginTop: '10px' }}>
                                {melody.gameplay.audio_source.clues.map((clue) => (
                                    <AudioSnippetPlayer
                                        key={clue.attempt}
                                        songId={melody.id}
                                        attempt={clue.attempt}
                                        startTime={clue.start_time}
                                        endTime={clue.end_time}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};