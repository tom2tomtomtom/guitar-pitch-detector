import { useState, useRef, useEffect } from 'react';
import { Fretboard } from './Fretboard';
import { type NoteInfo, findExactNoteOnFretboard, STRING_NAMES, type FretPosition } from '../lib/noteMapping';
import type { PitchResult } from '../lib/pitchDetector';

interface TeachingModeProps {
  currentNote: NoteInfo | null;
  currentPitch: PitchResult | null;
  isListening: boolean;
}

export function TeachingMode({ currentNote, currentPitch, isListening }: TeachingModeProps) {
  // Keep a stable display note (debounced so it doesn't flicker)
  const [displayNote, setDisplayNote] = useState<NoteInfo | null>(null);
  const [positions, setPositions] = useState<FretPosition[]>([]);
  const [recentNotes, setRecentNotes] = useState<NoteInfo[]>([]);
  const lastNoteRef = useRef<string | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!currentNote || !currentPitch) {
      // Only clear after a delay so it doesn't flash on brief silence
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        setDisplayNote(null);
        setPositions([]);
        lastNoteRef.current = null;
      }, 600);
      return;
    }

    const noteKey = `${currentNote.name}${currentNote.octave}`;

    // Only update if note actually changed (avoids flicker from cent changes)
    if (noteKey !== lastNoteRef.current) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      lastNoteRef.current = noteKey;

      // Small delay before showing to avoid rapid flashing between notes
      debounceRef.current = window.setTimeout(() => {
        setDisplayNote(currentNote);
        const fretPositions = findExactNoteOnFretboard(currentNote);
        setPositions(fretPositions);

        // Track recent notes (last 8, no consecutive duplicates)
        setRecentNotes((prev) => {
          if (prev.length > 0 && prev[prev.length - 1].fullName === currentNote.fullName) {
            return prev;
          }
          const next = [...prev, currentNote];
          return next.slice(-8);
        });
      }, 80);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [currentNote, currentPitch]);

  const getPositionLabel = () => {
    if (!displayNote || positions.length === 0) return null;
    return positions.map((p) => {
      const fretLabel = p.fret === 0 ? 'open' : `fret ${p.fret}`;
      return `${STRING_NAMES[p.string - 1]} (${fretLabel})`;
    });
  };

  const posLabels = getPositionLabel();
  const cents = displayNote?.cents ?? 0;
  const absCents = Math.abs(cents);
  const tuneColor = absCents <= 5 ? '#22c55e' : absCents <= 15 ? '#eab308' : '#ef4444';

  return (
    <div style={{ padding: '1rem 0' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
          Play any note and see it on the fretboard
        </div>
      </div>

      {/* Current note display */}
      <div style={{
        textAlign: 'center',
        marginBottom: '1.5rem',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {displayNote ? (
          <>
            <div style={{
              fontSize: '4.5rem',
              fontWeight: 700,
              color: tuneColor,
              lineHeight: 1,
              transition: 'color 0.2s ease',
            }}>
              {displayNote.name}
              <span style={{ fontSize: '2rem', opacity: 0.5 }}>{displayNote.octave}</span>
            </div>

            {/* Guitar position info */}
            {posLabels && posLabels.length > 0 && (
              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.9rem',
                color: '#a5b4fc',
                lineHeight: 1.6,
              }}>
                {posLabels.length === 1 ? (
                  <span>{posLabels[0]}</span>
                ) : (
                  <span>{posLabels.join('  ·  ')}</span>
                )}
              </div>
            )}

            {/* Tuning feedback */}
            <div style={{
              marginTop: '0.4rem',
              fontSize: '0.8rem',
              color: tuneColor,
            }}>
              {absCents <= 5
                ? 'In tune!'
                : `${cents > 0 ? '+' : ''}${cents} cents ${cents > 0 ? 'sharp' : 'flat'}`}
            </div>
          </>
        ) : (
          <div style={{ fontSize: '1.5rem', color: '#475569' }}>
            {isListening ? 'Play a note...' : 'Start listening to begin'}
          </div>
        )}
      </div>

      {/* Fretboard */}
      <div style={{
        background: 'rgba(100,116,139,0.04)',
        borderRadius: '12px',
        padding: '0.75rem 0.5rem',
        marginBottom: '1.5rem',
        border: '1px solid rgba(100,116,139,0.1)',
      }}>
        <Fretboard
          highlightPositions={positions}
          activeNote={displayNote}
        />
      </div>

      {/* Recent notes trail */}
      {recentNotes.length > 0 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.4rem' }}>
            Recent notes
          </div>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {recentNotes.map((n, i) => (
              <div
                key={`${n.fullName}-${i}`}
                style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: i === recentNotes.length - 1
                    ? 'rgba(99,102,241,0.2)'
                    : 'rgba(100,116,139,0.08)',
                  color: i === recentNotes.length - 1 ? '#a5b4fc' : '#94a3b8',
                  border: `1px solid ${i === recentNotes.length - 1 ? 'rgba(99,102,241,0.3)' : 'rgba(100,116,139,0.1)'}`,
                }}
              >
                {n.name}
                <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>{n.octave}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
