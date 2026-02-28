import type { Player } from '../types';
import { PLAYER_COLORS } from './SetupScreen';

interface RevealScreenProps {
  players: Player[];
  genre: string;
  round: number;
  onStartVoting: () => void;
}

export function RevealScreen({ players, genre, round, onStartVoting }: RevealScreenProps) {
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
          Round {round}
        </div>
        <div style={{
          fontSize: '1.8rem',
          fontWeight: 700,
          color: '#e5e7eb',
          marginTop: '0.25rem',
        }}>
          All songs are in!
        </div>
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))',
          display: 'inline-block',
        }}>
          <span style={{
            fontSize: '1rem',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #c084fc, #f472b6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {genre}
          </span>
        </div>
      </div>

      {/* Song list */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginBottom: '2rem',
      }}>
        {players.map((player, i) => (
          <div
            key={player.id}
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '14px',
              background: 'rgba(168, 139, 250, 0.06)',
              border: '1px solid rgba(168, 139, 250, 0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: PLAYER_COLORS[i % PLAYER_COLORS.length],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              fontWeight: 800,
              color: '#fff',
              flexShrink: 0,
            }}>
              {player.name[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.7rem',
                color: '#9ca3af',
                marginBottom: '0.15rem',
              }}>
                {player.name}
              </div>
              <div style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#e5e7eb',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {player.songPick || '—'}
              </div>
              {player.songArtist && (
                <div style={{
                  fontSize: '0.8rem',
                  color: '#a78bfa',
                  marginTop: '0.1rem',
                }}>
                  {player.songArtist}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <div style={{
          fontSize: '0.85rem',
          color: '#9ca3af',
          marginBottom: '1rem',
        }}>
          Play each song, then vote for the best!
        </div>
      </div>

      {/* Vote button */}
      <button
        onClick={onStartVoting}
        style={{
          width: '100%',
          padding: '1rem',
          borderRadius: '14px',
          border: 'none',
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          color: '#fff',
          fontSize: '1.2rem',
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'system-ui, sans-serif',
          boxShadow: '0 6px 30px rgba(139, 92, 246, 0.4)',
          transition: 'all 0.2s ease',
        }}
      >
        Start Voting
      </button>
    </div>
  );
}
