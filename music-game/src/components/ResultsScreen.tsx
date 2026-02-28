import type { Player, RoundResult } from '../types';
import { PLAYER_COLORS } from './SetupScreen';

interface ResultsScreenProps {
  players: Player[];
  genre: string;
  round: number;
  votes: Record<string, string>;
  roundHistory: RoundResult[];
  onNextRound: (winnerId: string) => void;
  onEndGame: () => void;
}

export function ResultsScreen({
  players,
  genre,
  round,
  votes,
  roundHistory,
  onNextRound,
  onEndGame,
}: ResultsScreenProps) {
  // Count votes per player
  const voteCounts: Record<string, number> = {};
  for (const p of players) {
    voteCounts[p.id] = 0;
  }
  for (const votedFor of Object.values(votes)) {
    voteCounts[votedFor] = (voteCounts[votedFor] || 0) + 1;
  }

  // Sort by votes descending
  const ranked = [...players]
    .map((p) => ({
      player: p,
      voteCount: voteCounts[p.id] || 0,
    }))
    .sort((a, b) => b.voteCount - a.voteCount);

  const winner = ranked[0];
  const isTie = ranked.length > 1 && ranked[0].voteCount === ranked[1].voteCount;

  // For tie: pick randomly among tied players
  const tiedPlayers = ranked.filter((r) => r.voteCount === winner.voteCount);
  const tiebreaker = tiedPlayers[Math.floor(Math.random() * tiedPlayers.length)];
  const finalWinner = isTie ? tiebreaker : winner;

  const winnerIndex = players.indexOf(finalWinner.player);

  // Overall scoreboard (including this round's winner bonus)
  const scoreboard = [...players]
    .map((p) => ({
      player: p,
      totalScore: p.score + (p.id === finalWinner.player.id ? 1 : 0),
      thisRoundVotes: voteCounts[p.id] || 0,
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div style={{ padding: '1rem 0', maxWidth: '400px', margin: '0 auto' }}>
      {/* Winner announcement */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 600,
        }}>
          Round {round} — {genre}
        </div>

        <div style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#e5e7eb',
          marginTop: '0.75rem',
        }}>
          {isTie ? 'Tiebreaker!' : 'Winner!'}
        </div>

        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: PLAYER_COLORS[winnerIndex % PLAYER_COLORS.length],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          fontWeight: 800,
          color: '#fff',
          margin: '1rem auto',
          boxShadow: `0 6px 30px ${PLAYER_COLORS[winnerIndex % PLAYER_COLORS.length]}60`,
        }}>
          {finalWinner.player.name[0].toUpperCase()}
        </div>

        <div style={{
          fontSize: '2rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #c084fc, #f472b6, #fb923c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {finalWinner.player.name}
        </div>

        <div style={{
          fontSize: '1rem',
          color: '#a78bfa',
          marginTop: '0.5rem',
        }}>
          "{finalWinner.player.songPick}"
          {finalWinner.player.songArtist && (
            <span style={{ color: '#9ca3af' }}> — {finalWinner.player.songArtist}</span>
          )}
        </div>

        <div style={{
          fontSize: '0.85rem',
          color: '#22c55e',
          marginTop: '0.4rem',
          fontWeight: 600,
        }}>
          {finalWinner.voteCount} vote{finalWinner.voteCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Round results */}
      <div style={{
        marginBottom: '2rem',
      }}>
        <div style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: 600,
          marginBottom: '0.75rem',
        }}>
          Round Results
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        }}>
          {ranked.map(({ player, voteCount }, i) => {
            const pi = players.indexOf(player);
            const isWinner = player.id === finalWinner.player.id;

            return (
              <div
                key={player.id}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  background: isWinner
                    ? 'rgba(34, 197, 94, 0.08)'
                    : 'rgba(168, 139, 250, 0.04)',
                  border: `1px solid ${isWinner ? 'rgba(34, 197, 94, 0.2)' : 'rgba(168, 139, 250, 0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#6b7280',
                  width: '20px',
                  textAlign: 'center',
                }}>
                  {i + 1}
                </div>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: PLAYER_COLORS[pi % PLAYER_COLORS.length],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#fff',
                  flexShrink: 0,
                }}>
                  {player.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#e5e7eb',
                  }}>
                    {player.name}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {player.songPick}
                    {player.songArtist && ` — ${player.songArtist}`}
                  </div>
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: isWinner ? '#22c55e' : '#6b7280',
                }}>
                  {voteCount}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall scoreboard */}
      {roundHistory.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 600,
            marginBottom: '0.5rem',
          }}>
            Scoreboard
          </div>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            {scoreboard.map(({ player, totalScore }) => {
              const pi = players.indexOf(player);
              return (
                <div
                  key={player.id}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(168, 139, 250, 0.06)',
                    border: '1px solid rgba(168, 139, 250, 0.1)',
                    textAlign: 'center',
                    minWidth: '70px',
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: PLAYER_COLORS[pi % PLAYER_COLORS.length],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#fff',
                    margin: '0 auto 0.3rem',
                  }}>
                    {player.name[0].toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                    {player.name}
                  </div>
                  <div style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: '#c084fc',
                  }}>
                    {totalScore}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={onEndGame}
          style={{
            flex: 1,
            padding: '0.85rem',
            borderRadius: '12px',
            border: '1px solid rgba(168, 139, 250, 0.2)',
            background: 'transparent',
            color: '#9ca3af',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          End Game
        </button>
        <button
          onClick={() => onNextRound(finalWinner.player.id)}
          style={{
            flex: 2,
            padding: '0.85rem',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif',
            boxShadow: '0 6px 30px rgba(139, 92, 246, 0.3)',
          }}
        >
          Next Round
        </button>
      </div>

      <div style={{
        textAlign: 'center',
        fontSize: '0.75rem',
        color: '#6b7280',
        marginTop: '0.75rem',
      }}>
        {finalWinner.player.name} picks the next genre!
      </div>
    </div>
  );
}
