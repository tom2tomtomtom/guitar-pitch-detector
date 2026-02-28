import { useState, useEffect, useCallback, useRef } from 'react';
import { Fretboard } from './Fretboard';
import {
  type NoteInfo,
  type FretPosition,
  isNoteMatch,
  buildFretboard,
  STRING_NAMES,
} from '../lib/noteMapping';
import type { PitchResult } from '../lib/pitchDetector';

interface TestModeProps {
  currentNote: NoteInfo | null;
  currentPitch: PitchResult | null;
  isListening: boolean;
}

interface Challenge {
  position: FretPosition;
  prompt: string;
}

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; maxFret: number; description: string }> = {
  beginner:     { label: 'Beginner',     maxFret: 4,  description: 'Frets 0–4' },
  intermediate: { label: 'Intermediate', maxFret: 7,  description: 'Frets 0–7' },
  advanced:     { label: 'Advanced',     maxFret: 12, description: 'Frets 0–12' },
};

// Build a pool of guitar-friendly challenges
function buildChallengePool(maxFret: number): Challenge[] {
  const fretboard = buildFretboard();
  const challenges: Challenge[] = [];

  for (const pos of fretboard) {
    if (pos.fret > maxFret) continue;

    const stringLabel = STRING_NAMES[pos.string - 1];
    const fretLabel = pos.fret === 0 ? 'open' : `fret ${pos.fret}`;

    challenges.push({
      position: pos,
      prompt: `Play ${pos.note.name} on the ${stringLabel} string (${fretLabel})`,
    });
  }

  return challenges;
}

function pickRandom(pool: Challenge[], exclude?: Challenge): Challenge {
  const filtered = exclude ? pool.filter((c) => c !== exclude) : pool;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

interface ScoreEntry {
  challenge: Challenge;
  hit: boolean;
  cents: number;
}

export function TestMode({ currentNote, currentPitch, isListening }: TestModeProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');
  const [challengePool, setChallengePool] = useState(() => buildChallengePool(DIFFICULTY_CONFIG.intermediate.maxFret));
  const [challenge, setChallenge] = useState<Challenge>(() => pickRandom(buildChallengePool(DIFFICULTY_CONFIG.intermediate.maxFret)));
  const [tolerance, setTolerance] = useState(50);
  const [score, setScore] = useState<ScoreEntry[]>([]);
  const [isMatched, setIsMatched] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedbackNote, setFeedbackNote] = useState<string | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const matchedRef = useRef(false);
  const feedbackTimerRef = useRef<number | null>(null);

  const targetNote = challenge.position.note;

  // Rebuild pool when difficulty changes
  useEffect(() => {
    const pool = buildChallengePool(DIFFICULTY_CONFIG[difficulty].maxFret);
    setChallengePool(pool);
    const next = pickRandom(pool);
    setChallenge(next);
    setIsMatched(false);
    matchedRef.current = false;
    setFeedbackNote(null);
    setScore([]);
    setStreakCount(0);
  }, [difficulty]);

  const advanceChallenge = useCallback(() => {
    const next = pickRandom(challengePool, challenge);
    setChallenge(next);
    setIsMatched(false);
    matchedRef.current = false;
    setFeedbackNote(null);
  }, [challenge, challengePool]);

  // Check note match
  useEffect(() => {
    if (!currentPitch || !currentNote || matchedRef.current) {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      return;
    }

    const { match, cents } = isNoteMatch(currentPitch.frequency, targetNote, tolerance);

    // Update feedback with debounce so it doesn't flash
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedbackNote(currentNote.fullName);
    }, 100);

    if (match && !holdTimerRef.current) {
      holdTimerRef.current = window.setTimeout(() => {
        matchedRef.current = true;
        setIsMatched(true);
        setScore((prev) => [...prev, { challenge, hit: true, cents }]);
        setStreakCount((prev) => {
          const next = prev + 1;
          setBestStreak((best) => Math.max(best, next));
          return next;
        });
        setTimeout(advanceChallenge, 1000);
      }, 500);
    } else if (!match && holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, [currentPitch, currentNote, targetNote, tolerance, advanceChallenge, challenge]);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const skipChallenge = () => {
    setScore((prev) => [...prev, { challenge, hit: false, cents: 0 }]);
    setStreakCount(0);
    advanceChallenge();
  };

  const resetScore = () => {
    setScore([]);
    setStreakCount(0);
    setBestStreak(0);
    advanceChallenge();
  };

  const hits = score.filter((s) => s.hit).length;
  const total = score.length;
  const accuracy = total > 0 ? Math.round((hits / total) * 100) : 0;

  const matchResult = currentPitch
    ? isNoteMatch(currentPitch.frequency, targetNote, tolerance)
    : null;

  // Compute directional hint
  const getDirectionHint = (): string | null => {
    if (!currentPitch || !currentNote || isMatched) return null;
    const { cents } = isNoteMatch(currentPitch.frequency, targetNote, tolerance);
    if (Math.abs(cents) <= tolerance) return null;
    // If cents is very negative, they need to play higher
    // If cents is very positive, they need to play lower
    if (cents < -100) return '↑ Play higher';
    if (cents > 100) return '↓ Play lower';
    if (cents < 0) return '↑ A bit higher';
    return '↓ A bit lower';
  };

  const directionHint = getDirectionHint();

  return (
    <div style={{ padding: '1rem 0' }}>
      {/* Difficulty selector */}
      <div style={{
        display: 'flex',
        gap: '4px',
        justifyContent: 'center',
        marginBottom: '1.25rem',
      }}>
        {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG[Difficulty]][]).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setDifficulty(key)}
            aria-pressed={difficulty === key}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              border: `1px solid ${difficulty === key ? 'rgba(99, 102, 241, 0.4)' : 'rgba(100, 116, 139, 0.15)'}`,
              background: difficulty === key ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: difficulty === key ? '#a5b4fc' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: difficulty === key ? 600 : 400,
              fontFamily: 'system-ui, sans-serif',
              transition: 'all 0.15s ease',
            }}
          >
            {config.label}
            <span style={{ display: 'block', fontSize: '0.6rem', opacity: 0.7 }}>{config.description}</span>
          </button>
        ))}
      </div>

      {/* Challenge prompt */}
      <div style={{
        textAlign: 'center',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          fontSize: '1.3rem',
          fontWeight: 600,
          color: isMatched ? '#22c55e' : '#e2e8f0',
          lineHeight: 1.4,
          transition: 'color 0.2s ease',
          padding: '0 1rem',
        }}>
          {isMatched ? (
            <span>{streakCount >= 3 ? 'Awesome streak!' : 'Correct!'}</span>
          ) : (
            challenge.prompt
          )}
        </div>

        {/* Show the target note big */}
        <div style={{
          fontSize: '4rem',
          fontWeight: 700,
          color: isMatched ? '#22c55e' : '#a5b4fc',
          lineHeight: 1,
          marginTop: '0.5rem',
          transition: 'all 0.2s ease',
          transform: isMatched ? 'scale(1.1)' : 'scale(1)',
        }}>
          {targetNote.name}
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
          {targetNote.frequency.toFixed(1)} Hz
        </div>
      </div>

      {/* Fretboard with target highlighted */}
      <div style={{
        background: 'rgba(100,116,139,0.04)',
        borderRadius: '12px',
        padding: '0.75rem 0.5rem',
        marginBottom: '1.5rem',
        border: '1px solid rgba(100,116,139,0.1)',
      }}>
        <Fretboard
          targetPositions={[challenge.position]}
          activeNote={isMatched ? targetNote : (matchResult?.match ? currentNote : null)}
          highlightPositions={isMatched ? [challenge.position] : []}
        />
      </div>

      {/* Feedback */}
      {isListening && (
        <div style={{
          textAlign: 'center',
          padding: '0.75rem',
          borderRadius: '10px',
          marginBottom: '1.25rem',
          background: isMatched
            ? 'rgba(34, 197, 94, 0.1)'
            : matchResult?.match
              ? 'rgba(234, 179, 8, 0.1)'
              : 'rgba(100, 116, 139, 0.05)',
          border: `1px solid ${
            isMatched
              ? 'rgba(34, 197, 94, 0.3)'
              : matchResult?.match
                ? 'rgba(234, 179, 8, 0.3)'
                : 'rgba(100, 116, 139, 0.1)'
          }`,
          transition: 'all 0.2s ease',
          minHeight: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.25rem',
        }}>
          {isMatched ? (
            <span style={{ color: '#22c55e', fontSize: '1rem', fontWeight: 600 }}>
              Got it! Next one coming...
            </span>
          ) : matchResult?.match ? (
            <span style={{ color: '#eab308' }}>
              That's it — hold steady! ({matchResult.cents > 0 ? '+' : ''}{matchResult.cents} cents)
            </span>
          ) : feedbackNote ? (
            <>
              <span style={{ color: '#94a3b8' }}>
                You're playing {feedbackNote}
              </span>
              {directionHint && (
                <span style={{ color: '#6366f1', fontSize: '0.8rem', fontWeight: 500 }}>
                  {directionHint}
                </span>
              )}
            </>
          ) : (
            <span style={{ color: '#475569' }}>Listening...</span>
          )}
        </div>
      )}

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'center',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
      }}>
        <button onClick={skipChallenge} style={btnStyle('#475569')} aria-label="Skip this challenge">
          Skip
        </button>
        <button onClick={resetScore} style={btnStyle('#64748b')} aria-label="Reset score and start over">
          Reset
        </button>
      </div>

      {/* Tolerance */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        justifyContent: 'center',
        marginBottom: '1.25rem',
      }}>
        <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Tolerance:</label>
        <input
          type="range"
          min="10"
          max="100"
          value={tolerance}
          onChange={(e) => setTolerance(Number(e.target.value))}
          aria-label={`Tolerance: plus or minus ${tolerance} cents`}
          style={{ width: '120px' }}
        />
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', minWidth: '60px' }}>
          ±{tolerance} cents
        </span>
      </div>

      {/* Score */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '1rem',
        background: 'rgba(100, 116, 139, 0.05)',
        borderRadius: '12px',
        flexWrap: 'wrap',
      }}>
        <ScoreStat label="Accuracy" value={`${accuracy}%`} />
        <ScoreStat label="Hits" value={`${hits}/${total}`} />
        <ScoreStat label="Streak" value={`${streakCount}`} highlight={streakCount >= 3} />
        <ScoreStat label="Best" value={`${bestStreak}`} subtle />
      </div>
    </div>
  );
}

function ScoreStat({ label, value, highlight, subtle }: { label: string; value: string; highlight?: boolean; subtle?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontSize: subtle ? '1.2rem' : '1.5rem',
        fontWeight: 700,
        color: highlight ? '#22c55e' : subtle ? '#64748b' : '#e2e8f0',
      }}>
        {value}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{label}</div>
    </div>
  );
}

function btnStyle(color: string): React.CSSProperties {
  return {
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    border: `1px solid ${color}40`,
    background: `${color}15`,
    color: '#e2e8f0',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontFamily: 'system-ui, sans-serif',
  };
}
