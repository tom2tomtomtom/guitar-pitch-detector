export interface Player {
  id: string;
  name: string;
  score: number;
  lifelines: number;
  songPick: string | null;
  songArtist: string | null;
}

export interface RoundResult {
  round: number;
  genre: string;
  winnerId: string;
  picks: { playerId: string; song: string; artist: string; votes: number }[];
}

export type GamePhase =
  | 'setup'
  | 'genre_pick'
  | 'song_pick'
  | 'ready_reveal'
  | 'vote'
  | 'results';

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPickerIndex: number;
  currentGenre: string;
  currentRound: number;
  currentSongPickIndex: number;
  votes: Record<string, string>; // voterId -> votedForPlayerId
  currentVoterIndex: number;
  roundHistory: RoundResult[];
  maxLifelines: number;
}

export function createInitialState(): GameState {
  return {
    phase: 'setup',
    players: [],
    currentPickerIndex: 0,
    currentGenre: '',
    currentRound: 1,
    currentSongPickIndex: 0,
    votes: {},
    currentVoterIndex: 0,
    roundHistory: [],
    maxLifelines: 2,
  };
}

export function createPlayer(name: string, maxLifelines: number): Player {
  return {
    id: crypto.randomUUID(),
    name,
    score: 0,
    lifelines: maxLifelines,
    songPick: null,
    songArtist: null,
  };
}
