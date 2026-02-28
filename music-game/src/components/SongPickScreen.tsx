import { useState } from 'react';
import type { Player } from '../types';
import { PLAYER_COLORS } from './SetupScreen';

interface SongPickScreenProps {
  player: Player;
  playerIndex: number;
  genre: string;
  round: number;
  totalPlayers: number;
  currentPlayerNumber: number;
  onSongPicked: (song: string, artist: string) => void;
}

export function SongPickScreen({
  player,
  playerIndex,
  genre,
  round,
  totalPlayers,
  currentPlayerNumber,
  onSongPicked,
}: SongPickScreenProps) {
  const [song, setSong] = useState('');
  const [artist, setArtist] = useState('');
  const [revealed, setRevealed] = useState(false);

  const canSubmit = song.trim().length > 0;

  const handleSubmit = () => {
    if (canSubmit) {
      onSongPicked(song.trim(), artist.trim());
    }
  };

  // "Pass the phone" screen - tap to reveal your turn
  if (!revealed) {
    return (
      <div
        onClick={() => setRevealed(true)}
        style={{
          padding: '1rem 0',
          maxWidth: '400px',
          margin: '0 auto',
          textAlign: 'center',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <div style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 600,
          marginBottom: '1rem',
        }}>
          Round {round} — Player {currentPlayerNumber}/{totalPlayers}
        </div>

        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: PLAYER_COLORS[playerIndex % PLAYER_COLORS.length],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 800,
          color: '#fff',
          margin: '0 auto 1.5rem',
          boxShadow: `0 6px 30px ${PLAYER_COLORS[playerIndex % PLAYER_COLORS.length]}50`,
        }}>
          {player.name[0].toUpperCase()}
        </div>

        <div style={{
          fontSize: '1.8rem',
          fontWeight: 700,
          color: '#e5e7eb',
          marginBottom: '0.5rem',
        }}>
          Pass to {player.name}
        </div>

        <div style={{
          fontSize: '0.9rem',
          color: '#9ca3af',
          marginBottom: '2rem',
        }}>
          Don't let anyone see your pick!
        </div>

        <div style={{
          fontSize: '1rem',
          color: '#a78bfa',
          animation: 'pulse 2s infinite',
        }}>
          Tap to start
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem 0', maxWidth: '400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 600,
        }}>
          {player.name}'s turn
        </div>

        {/* Genre display */}
        <div style={{
          marginTop: '1rem',
          padding: '1rem 1.5rem',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))',
          border: '1px solid rgba(168, 139, 250, 0.2)',
          display: 'inline-block',
        }}>
          <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
            The genre is
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #c084fc, #f472b6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {genre}
          </div>
        </div>
      </div>

      {/* Song input */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.8rem',
          color: '#9ca3af',
          marginBottom: '0.4rem',
          fontWeight: 600,
        }}>
          Your song
        </label>
        <input
          type="text"
          placeholder="Song name..."
          value={song}
          onChange={(e) => setSong(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleSubmit()}
          maxLength={80}
          autoFocus
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: '1px solid rgba(168, 139, 250, 0.2)',
            background: 'rgba(168, 139, 250, 0.05)',
            color: '#e5e7eb',
            fontSize: '1.1rem',
            fontFamily: 'system-ui, sans-serif',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.8rem',
          color: '#9ca3af',
          marginBottom: '0.4rem',
          fontWeight: 600,
        }}>
          Artist (optional)
        </label>
        <input
          type="text"
          placeholder="Artist name..."
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleSubmit()}
          maxLength={60}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: '1px solid rgba(168, 139, 250, 0.2)',
            background: 'rgba(168, 139, 250, 0.05)',
            color: '#e5e7eb',
            fontSize: '1rem',
            fontFamily: 'system-ui, sans-serif',
            outline: 'none',
          }}
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          width: '100%',
          padding: '1rem',
          borderRadius: '14px',
          border: 'none',
          background: canSubmit
            ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
            : 'rgba(100, 116, 139, 0.2)',
          color: canSubmit ? '#fff' : '#6b7280',
          fontSize: '1.1rem',
          fontWeight: 700,
          cursor: canSubmit ? 'pointer' : 'default',
          fontFamily: 'system-ui, sans-serif',
          boxShadow: canSubmit ? '0 6px 30px rgba(139, 92, 246, 0.3)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        Lock In
      </button>
    </div>
  );
}
