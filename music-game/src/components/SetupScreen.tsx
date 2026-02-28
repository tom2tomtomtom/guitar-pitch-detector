import { useState } from 'react';
import type { Player } from '../types';
import { createPlayer } from '../types';

interface SetupScreenProps {
  onStart: (players: Player[], maxLifelines: number) => void;
}

export function SetupScreen({ onStart }: SetupScreenProps) {
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [maxLifelines, setMaxLifelines] = useState(2);

  const addPlayer = () => {
    if (playerNames.length < 10) {
      setPlayerNames([...playerNames, '']);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const updateName = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const canStart = playerNames.filter((n) => n.trim().length > 0).length >= 2;

  const handleStart = () => {
    const validNames = playerNames.filter((n) => n.trim().length > 0);
    const players = validNames.map((name) => createPlayer(name.trim(), maxLifelines));
    onStart(players, maxLifelines);
  };

  return (
    <div style={{ padding: '1rem 0', maxWidth: '400px', margin: '0 auto' }}>
      {/* Logo / Title */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          fontSize: '3.5rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #c084fc, #f472b6, #fb923c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
        }}>
          AUX Battle
        </div>
        <div style={{
          fontSize: '1rem',
          color: '#a78bfa',
          marginTop: '0.5rem',
          fontWeight: 500,
        }}>
          The music taste showdown
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: '#6b7280',
          marginTop: '1rem',
          lineHeight: 1.5,
          padding: '0 1rem',
        }}>
          Pick a genre, everyone chooses a song, vote for the best one.
          Winner picks the next genre!
        </div>
      </div>

      {/* Player list */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          fontSize: '0.85rem',
          color: '#9ca3af',
          marginBottom: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Players
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {playerNames.map((name, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: PLAYER_COLORS[i % PLAYER_COLORS.length],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <input
                type="text"
                placeholder={`Player ${i + 1}`}
                value={name}
                onChange={(e) => updateName(i, e.target.value)}
                maxLength={20}
                autoFocus={i === 0}
                style={{
                  flex: 1,
                  padding: '0.65rem 0.75rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(168, 139, 250, 0.2)',
                  background: 'rgba(168, 139, 250, 0.05)',
                  color: '#e5e7eb',
                  fontSize: '1rem',
                  fontFamily: 'system-ui, sans-serif',
                  outline: 'none',
                }}
              />
              {playerNames.length > 2 && (
                <button
                  onClick={() => removePlayer(i)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {playerNames.length < 10 && (
          <button
            onClick={addPlayer}
            style={{
              marginTop: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px dashed rgba(168, 139, 250, 0.3)',
              background: 'transparent',
              color: '#a78bfa',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontFamily: 'system-ui, sans-serif',
              width: '100%',
            }}
          >
            + Add Player
          </button>
        )}
      </div>

      {/* Lifelines setting */}
      <div style={{
        marginBottom: '2rem',
        padding: '1rem',
        borderRadius: '12px',
        background: 'rgba(168, 139, 250, 0.05)',
        border: '1px solid rgba(168, 139, 250, 0.1)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#e5e7eb', fontWeight: 600 }}>
              Lifelines
            </div>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.15rem' }}>
              Genre suggestions each player can use
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setMaxLifelines(Math.max(0, maxLifelines - 1))}
              style={stepperBtn}
            >
              -
            </button>
            <span style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#c084fc',
              minWidth: '24px',
              textAlign: 'center',
            }}>
              {maxLifelines}
            </span>
            <button
              onClick={() => setMaxLifelines(Math.min(5, maxLifelines + 1))}
              style={stepperBtn}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!canStart}
        style={{
          width: '100%',
          padding: '1rem',
          borderRadius: '14px',
          border: 'none',
          background: canStart
            ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
            : 'rgba(100, 116, 139, 0.2)',
          color: canStart ? '#fff' : '#6b7280',
          fontSize: '1.2rem',
          fontWeight: 700,
          cursor: canStart ? 'pointer' : 'default',
          fontFamily: 'system-ui, sans-serif',
          boxShadow: canStart ? '0 6px 30px rgba(139, 92, 246, 0.4)' : 'none',
          transition: 'all 0.2s ease',
          letterSpacing: '-0.01em',
        }}
      >
        Start Game
      </button>
    </div>
  );
}

const PLAYER_COLORS = [
  '#8b5cf6', '#ec4899', '#f97316', '#22c55e',
  '#3b82f6', '#ef4444', '#eab308', '#06b6d4',
  '#a855f7', '#14b8a6',
];

const stepperBtn: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  border: '1px solid rgba(168, 139, 250, 0.3)',
  background: 'rgba(168, 139, 250, 0.1)',
  color: '#c084fc',
  cursor: 'pointer',
  fontSize: '1.1rem',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export { PLAYER_COLORS };
