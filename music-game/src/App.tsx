import { useState, useCallback } from 'react';
import type { GameState, Player, RoundResult } from './types';
import { createInitialState } from './types';
import { SetupScreen } from './components/SetupScreen';
import { GenrePickScreen } from './components/GenrePickScreen';
import { SongPickScreen } from './components/SongPickScreen';
import { RevealScreen } from './components/RevealScreen';
import { VoteScreen } from './components/VoteScreen';
import { ResultsScreen } from './components/ResultsScreen';

export default function App() {
  const [game, setGame] = useState<GameState>(createInitialState);

  // ─── Setup ───
  const handleStart = useCallback((players: Player[], maxLifelines: number) => {
    setGame({
      ...createInitialState(),
      phase: 'genre_pick',
      players,
      maxLifelines,
    });
  }, []);

  // ─── Genre Pick ───
  const handleGenrePicked = useCallback((genre: string) => {
    setGame((prev) => ({
      ...prev,
      phase: 'song_pick',
      currentGenre: genre,
      currentSongPickIndex: 0,
      // Clear previous picks
      players: prev.players.map((p) => ({ ...p, songPick: null, songArtist: null })),
    }));
  }, []);

  const handleUseLifeline = useCallback(() => {
    setGame((prev) => {
      const players = [...prev.players];
      const picker = { ...players[prev.currentPickerIndex] };
      picker.lifelines = Math.max(0, picker.lifelines - 1);
      players[prev.currentPickerIndex] = picker;
      return { ...prev, players };
    });
  }, []);

  // ─── Song Pick ───
  const handleSongPicked = useCallback((song: string, artist: string) => {
    setGame((prev) => {
      const players = [...prev.players];
      const current = { ...players[prev.currentSongPickIndex] };
      current.songPick = song;
      current.songArtist = artist || null;
      players[prev.currentSongPickIndex] = current;

      const nextIndex = prev.currentSongPickIndex + 1;

      if (nextIndex >= players.length) {
        // All players have picked — go to reveal
        return {
          ...prev,
          players,
          phase: 'ready_reveal',
        };
      }

      return {
        ...prev,
        players,
        currentSongPickIndex: nextIndex,
      };
    });
  }, []);

  // ─── Start Voting ───
  const handleStartVoting = useCallback(() => {
    setGame((prev) => ({
      ...prev,
      phase: 'vote',
      votes: {},
      currentVoterIndex: 0,
    }));
  }, []);

  // ─── Vote ───
  const handleVote = useCallback((votedForPlayerId: string) => {
    setGame((prev) => {
      const votes = { ...prev.votes };
      votes[prev.players[prev.currentVoterIndex].id] = votedForPlayerId;

      const nextVoter = prev.currentVoterIndex + 1;

      if (nextVoter >= prev.players.length) {
        // All votes in — go to results
        return {
          ...prev,
          votes,
          phase: 'results',
        };
      }

      return {
        ...prev,
        votes,
        currentVoterIndex: nextVoter,
      };
    });
  }, []);

  // ─── Next Round ───
  const handleNextRound = useCallback((winnerId: string) => {
    setGame((prev) => {
      // Count votes for round history
      const voteCounts: Record<string, number> = {};
      for (const vid of Object.values(prev.votes)) {
        voteCounts[vid] = (voteCounts[vid] || 0) + 1;
      }

      const roundResult: RoundResult = {
        round: prev.currentRound,
        genre: prev.currentGenre,
        winnerId,
        picks: prev.players.map((p) => ({
          playerId: p.id,
          song: p.songPick || '',
          artist: p.songArtist || '',
          votes: voteCounts[p.id] || 0,
        })),
      };

      // Update scores
      const players = prev.players.map((p) => ({
        ...p,
        score: p.id === winnerId ? p.score + 1 : p.score,
        songPick: null,
        songArtist: null,
      }));

      // Winner picks next genre
      const winnerIndex = players.findIndex((p) => p.id === winnerId);

      return {
        ...prev,
        phase: 'genre_pick',
        players,
        currentPickerIndex: winnerIndex >= 0 ? winnerIndex : 0,
        currentGenre: '',
        currentRound: prev.currentRound + 1,
        votes: {},
        currentVoterIndex: 0,
        currentSongPickIndex: 0,
        roundHistory: [...prev.roundHistory, roundResult],
      };
    });
  }, []);

  // ─── End Game ───
  const handleEndGame = useCallback(() => {
    setGame(createInitialState());
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0a1e',
      color: '#e5e7eb',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        input:focus {
          border-color: rgba(168, 139, 250, 0.5) !important;
          box-shadow: 0 0 0 2px rgba(168, 139, 250, 0.1);
        }
        button:active {
          transform: scale(0.97);
        }
        ::selection {
          background: rgba(168, 139, 250, 0.3);
        }
      `}</style>

      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        minHeight: '100vh',
      }}>
        {game.phase === 'setup' && (
          <SetupScreen onStart={handleStart} />
        )}

        {game.phase === 'genre_pick' && (
          <GenrePickScreen
            picker={game.players[game.currentPickerIndex]}
            pickerIndex={game.currentPickerIndex}
            round={game.currentRound}
            onGenrePicked={handleGenrePicked}
            onUseLifeline={handleUseLifeline}
          />
        )}

        {game.phase === 'song_pick' && (
          <SongPickScreen
            player={game.players[game.currentSongPickIndex]}
            playerIndex={game.currentSongPickIndex}
            genre={game.currentGenre}
            round={game.currentRound}
            totalPlayers={game.players.length}
            currentPlayerNumber={game.currentSongPickIndex + 1}
            onSongPicked={handleSongPicked}
          />
        )}

        {game.phase === 'ready_reveal' && (
          <RevealScreen
            players={game.players}
            genre={game.currentGenre}
            round={game.currentRound}
            onStartVoting={handleStartVoting}
          />
        )}

        {game.phase === 'vote' && (
          <VoteScreen
            voter={game.players[game.currentVoterIndex]}
            voterIndex={game.currentVoterIndex}
            players={game.players}
            genre={game.currentGenre}
            round={game.currentRound}
            currentVoterNumber={game.currentVoterIndex + 1}
            totalVoters={game.players.length}
            onVote={handleVote}
          />
        )}

        {game.phase === 'results' && (
          <ResultsScreen
            players={game.players}
            genre={game.currentGenre}
            round={game.currentRound}
            votes={game.votes}
            roundHistory={game.roundHistory}
            onNextRound={handleNextRound}
            onEndGame={handleEndGame}
          />
        )}
      </div>
    </div>
  );
}
