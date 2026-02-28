import { useState } from 'react';
import type { Player } from '../types';
import { PLAYER_COLORS } from './SetupScreen';

interface VoteScreenProps {
  voter: Player;
  voterIndex: number;
  players: Player[];
  genre: string;
  round: number;
  currentVoterNumber: number;
  totalVoters: number;
  onVote: (votedForPlayerId: string) => void;
}

export function VoteScreen({
  voter,
  voterIndex,
  players,
  genre,
  round,
  currentVoterNumber,
  totalVoters,
  onVote,
}: VoteScreenProps) {
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  // Filter out the voter (can't vote for yourself)
  const votablePlayers = players.filter((p) => p.id !== voter.id);

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
          Vote {currentVoterNumber}/{totalVoters}
        </div>

        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: PLAYER_COLORS[voterIndex % PLAYER_COLORS.length],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 800,
          color: '#fff',
          margin: '0 auto 1.5rem',
          boxShadow: `0 6px 30px ${PLAYER_COLORS[voterIndex % PLAYER_COLORS.length]}50`,
        }}>
          {voter.name[0].toUpperCase()}
        </div>

        <div style={{
          fontSize: '1.8rem',
          fontWeight: 700,
          color: '#e5e7eb',
          marginBottom: '0.5rem',
        }}>
          Pass to {voter.name}
        </div>

        <div style={{
          fontSize: '0.9rem',
          color: '#9ca3af',
          marginBottom: '2rem',
        }}>
          Time to vote!
        </div>

        <div style={{
          fontSize: '1rem',
          color: '#a78bfa',
          animation: 'pulse 2s infinite',
        }}>
          Tap to vote
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem 0', maxWidth: '400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 600,
        }}>
          {voter.name} — Round {round}
        </div>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#e5e7eb',
          marginTop: '0.25rem',
        }}>
          Vote for the best song
        </div>
        <div style={{
          marginTop: '0.25rem',
          fontSize: '0.85rem',
          color: '#a78bfa',
        }}>
          Genre: {genre}
        </div>
      </div>

      {/* Song choices */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '2rem',
      }}>
        {votablePlayers.map((player) => {
          const pi = players.indexOf(player);
          const isSelected = selected === player.id;

          return (
            <button
              key={player.id}
              onClick={() => setSelected(player.id)}
              style={{
                padding: '1rem 1.25rem',
                borderRadius: '14px',
                border: `2px solid ${isSelected ? PLAYER_COLORS[pi % PLAYER_COLORS.length] : 'rgba(168, 139, 250, 0.12)'}`,
                background: isSelected
                  ? `${PLAYER_COLORS[pi % PLAYER_COLORS.length]}15`
                  : 'rgba(168, 139, 250, 0.04)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                textAlign: 'left',
                fontFamily: 'system-ui, sans-serif',
                transition: 'all 0.15s ease',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: PLAYER_COLORS[pi % PLAYER_COLORS.length],
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
                  marginBottom: '0.1rem',
                }}>
                  {player.name}
                </div>
                <div style={{
                  fontSize: '1rem',
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
              {isSelected && (
                <div style={{
                  fontSize: '1.5rem',
                }}>
                  ✓
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Submit vote */}
      <button
        onClick={() => selected && onVote(selected)}
        disabled={!selected}
        style={{
          width: '100%',
          padding: '1rem',
          borderRadius: '14px',
          border: 'none',
          background: selected
            ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
            : 'rgba(100, 116, 139, 0.2)',
          color: selected ? '#fff' : '#6b7280',
          fontSize: '1.1rem',
          fontWeight: 700,
          cursor: selected ? 'pointer' : 'default',
          fontFamily: 'system-ui, sans-serif',
          boxShadow: selected ? '0 6px 30px rgba(139, 92, 246, 0.3)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        Cast Vote
      </button>
    </div>
  );
}
