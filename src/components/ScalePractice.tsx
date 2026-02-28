import { useState, useEffect, useRef, useCallback } from 'react';
import { type NoteInfo, type NoteName, isNoteMatch, getScaleNotes, getAllNoteNames, SCALES } from '../lib/noteMapping';
import type { PitchResult } from '../lib/pitchDetector';

interface ScalePracticeProps {
  currentNote: NoteInfo | null;
  currentPitch: PitchResult | null;
  isListening: boolean;
}

export function ScalePractice({ currentNote, currentPitch, isListening }: ScalePracticeProps) {
  const [rootNote, setRootNote] = useState<NoteName>('E');
  const [scaleKey, setScaleKey] = useState('pentatonicMinor');
  const [tolerance, setTolerance] = useState(50);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedNotes, setCompletedNotes] = useState<boolean[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [stableFeedback, setStableFeedback] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const holdTimerRef = useRef<number | null>(null);
  const matchedRef = useRef(false);
  const feedbackTimerRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  const scaleNotes = getScaleNotes(rootNote, scaleKey);
  const targetNote = scaleNotes[currentIndex];
  const progress = scaleNotes.length > 0 ? (completedNotes.length / scaleNotes.length) * 100 : 0;

  const resetPractice = useCallback(() => {
    setCurrentIndex(0);
    setCompletedNotes([]);
    setIsComplete(false);
    setStartTime(null);
    setElapsedTime(0);
    matchedRef.current = false;
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Reset when scale changes
  useEffect(() => {
    resetPractice();
  }, [rootNote, scaleKey, resetPractice]);

  // Timer management
  useEffect(() => {
    if (startTime && !isComplete) {
      timerIntervalRef.current = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [startTime, isComplete]);

  const advanceNote = useCallback(() => {
    const nextIndex = currentIndex + 1;
    setCompletedNotes((prev) => [...prev, true]);

    if (nextIndex >= scaleNotes.length) {
      setIsComplete(true);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    } else {
      setCurrentIndex(nextIndex);
      matchedRef.current = false;
    }
  }, [currentIndex, scaleNotes.length]);

  // Check if current note matches the scale target
  useEffect(() => {
    if (!currentPitch || !currentNote || !targetNote || matchedRef.current || isComplete) {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      return;
    }

    // Start timer on first detected note
    if (!startTime) {
      setStartTime(Date.now());
    }

    const { match } = isNoteMatch(currentPitch.frequency, targetNote, tolerance);

    if (match && !holdTimerRef.current) {
      holdTimerRef.current = window.setTimeout(() => {
        matchedRef.current = true;
        setTimeout(advanceNote, 400);
      }, 400);
    } else if (!match && holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, [currentPitch, currentNote, targetNote, tolerance, advanceNote, isComplete, startTime]);

  // Debounced feedback to avoid flashing
  useEffect(() => {
    if (!currentNote || matchedRef.current || isComplete) return;
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => {
      setStableFeedback(currentNote.fullName);
    }, 120);
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, [currentNote, isComplete]);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const matchResult = currentPitch && targetNote
    ? isNoteMatch(currentPitch.frequency, targetNote, tolerance)
    : null;

  // Directional hint for scale practice
  const getDirectionHint = (): string | null => {
    if (!currentPitch || !targetNote || isComplete) return null;
    const { match, cents } = isNoteMatch(currentPitch.frequency, targetNote, tolerance);
    if (match) return null;
    if (cents < -100) return '↑ Play higher';
    if (cents > 100) return '↓ Play lower';
    if (cents < 0) return '↑ A bit higher';
    return '↓ A bit lower';
  };

  const directionHint = getDirectionHint();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div style={{ padding: '1.5rem 0' }}>
      {/* Scale selector */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'center',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
      }}>
        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
            Root
          </label>
          <select
            value={rootNote}
            onChange={(e) => setRootNote(e.target.value as NoteName)}
            aria-label="Root note"
            style={selectStyle}
          >
            {getAllNoteNames().map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>
            Scale
          </label>
          <select
            value={scaleKey}
            onChange={(e) => setScaleKey(e.target.value)}
            aria-label="Scale type"
            style={selectStyle}
          >
            {Object.entries(SCALES).map(([key, scale]) => (
              <option key={key} value={key}>{scale.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        margin: '0 auto 1.25rem',
        maxWidth: '300px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.65rem',
          color: '#64748b',
          marginBottom: '0.25rem',
        }}>
          <span>{completedNotes.length}/{scaleNotes.length} notes</span>
          {startTime && <span>{formatTime(elapsedTime)}</span>}
        </div>
        <div style={{
          width: '100%',
          height: '4px',
          borderRadius: '2px',
          background: 'rgba(100, 116, 139, 0.15)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            borderRadius: '2px',
            background: isComplete ? '#22c55e' : '#6366f1',
            transition: 'width 0.3s ease, background 0.3s ease',
          }} />
        </div>
      </div>

      {/* Scale note display */}
      <div style={{
        display: 'flex',
        gap: '4px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '2rem',
        padding: '0 1rem',
      }}>
        {scaleNotes.map((note, i) => {
          const isCurrent = i === currentIndex && !isComplete;
          const isDone = i < completedNotes.length;
          const isActive = isCurrent && matchResult?.match;

          return (
            <div
              key={`${note.fullName}-${i}`}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: isCurrent ? 700 : 500,
                color: isDone ? '#22c55e' : isCurrent ? '#fff' : '#64748b',
                background: isDone
                  ? 'rgba(34, 197, 94, 0.15)'
                  : isActive
                    ? 'rgba(234, 179, 8, 0.2)'
                    : isCurrent
                      ? 'rgba(99, 102, 241, 0.2)'
                      : 'rgba(100, 116, 139, 0.05)',
                border: `1px solid ${
                  isDone
                    ? 'rgba(34, 197, 94, 0.3)'
                    : isCurrent
                      ? 'rgba(99, 102, 241, 0.4)'
                      : 'rgba(100, 116, 139, 0.1)'
                }`,
                transition: 'all 0.15s ease',
                transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              {note.name}
              <span style={{ fontSize: '0.55rem', opacity: 0.6 }}>{note.octave}</span>
            </div>
          );
        })}
      </div>

      {/* Current target or completion */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        {isComplete ? (
          <div>
            <div style={{ fontSize: '2rem', color: '#22c55e', fontWeight: 700, marginBottom: '0.5rem' }}>
              Scale Complete!
            </div>
            <div style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
              {rootNote} {SCALES[scaleKey].name} — all {scaleNotes.length} notes
            </div>
            {elapsedTime > 0 && (
              <div style={{
                color: '#a5b4fc',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}>
                Completed in {formatTime(elapsedTime)}
              </div>
            )}
            <button onClick={resetPractice} style={actionButtonStyle} aria-label="Play the scale again">
              Play Again
            </button>
          </div>
        ) : targetNote && (
          <div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
              Next note ({currentIndex + 1}/{scaleNotes.length}):
            </div>
            <div style={{
              fontSize: '3.5rem',
              fontWeight: 700,
              color: matchResult?.match ? '#eab308' : '#e2e8f0',
              lineHeight: 1,
            }}>
              {targetNote.name}
              <span style={{ fontSize: '1.5rem', opacity: 0.5 }}>{targetNote.octave}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
              {targetNote.frequency.toFixed(1)} Hz
            </div>
          </div>
        )}
      </div>

      {/* Feedback */}
      {isListening && !isComplete && (
        <div style={{
          textAlign: 'center',
          padding: '0.75rem',
          borderRadius: '8px',
          background: matchResult?.match
            ? 'rgba(234, 179, 8, 0.1)'
            : 'rgba(100, 116, 139, 0.05)',
          marginBottom: '1rem',
          fontSize: '0.85rem',
          color: matchResult?.match ? '#eab308' : '#94a3b8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.2rem',
        }}>
          <span>
            {matchResult?.match
              ? 'Hold steady...'
              : stableFeedback
                ? `Playing: ${stableFeedback}`
                : 'Listening...'}
          </span>
          {directionHint && !matchResult?.match && (
            <span style={{ color: '#6366f1', fontSize: '0.8rem', fontWeight: 500 }}>
              {directionHint}
            </span>
          )}
        </div>
      )}

      {/* Tolerance */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        justifyContent: 'center',
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
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid rgba(100, 116, 139, 0.2)',
  background: '#1e293b',
  color: '#e2e8f0',
  fontSize: '0.85rem',
  fontFamily: 'system-ui, sans-serif',
  cursor: 'pointer',
};

const actionButtonStyle: React.CSSProperties = {
  padding: '0.6rem 1.5rem',
  borderRadius: '8px',
  border: '1px solid rgba(34, 197, 94, 0.3)',
  background: 'rgba(34, 197, 94, 0.15)',
  color: '#22c55e',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 600,
  fontFamily: 'system-ui, sans-serif',
};
