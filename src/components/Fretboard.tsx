import { NUM_FRETS, STRING_NAMES, buildFretboard, type FretPosition } from '../lib/noteMapping';
import type { NoteInfo } from '../lib/noteMapping';

interface FretboardProps {
  /** Positions to highlight (lit up). */
  highlightPositions?: FretPosition[];
  /** The note currently being played (detected). */
  activeNote?: NoteInfo | null;
  /** Optional: positions to show as targets (outlined). */
  targetPositions?: FretPosition[];
}

const FRETBOARD = buildFretboard();

// Fret marker dots (standard guitar inlays)
const SINGLE_DOT_FRETS = [3, 5, 7, 9];
const DOUBLE_DOT_FRET = 12;

export function Fretboard({ highlightPositions = [], activeNote, targetPositions = [] }: FretboardProps) {
  const isHighlighted = (s: number, f: number) =>
    highlightPositions.some((p) => p.string === s && p.fret === f);

  const isTarget = (s: number, f: number) =>
    targetPositions.some((p) => p.string === s && p.fret === f);

  const isActive = (s: number, f: number) => {
    if (!activeNote) return false;
    const pos = FRETBOARD.find((p) => p.string === s && p.fret === f);
    return pos ? pos.note.name === activeNote.name && pos.note.octave === activeNote.octave : false;
  };

  const getNote = (s: number, f: number) =>
    FRETBOARD.find((p) => p.string === s && p.fret === f);

  return (
    <div style={{ overflowX: 'auto', padding: '0.5rem 0' }}>
      <div style={{ minWidth: '480px' }}>
        {/* Fret numbers */}
        <div style={{ display: 'flex', marginBottom: '2px' }}>
          <div style={{ width: '38px', flexShrink: 0 }} />
          {Array.from({ length: NUM_FRETS + 1 }, (_, f) => (
            <div
              key={f}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '0.6rem',
                color: '#475569',
                minWidth: '32px',
              }}
            >
              {f === 0 ? '' : f}
            </div>
          ))}
        </div>

        {/* Strings (1=high E at top, 6=low E at bottom) */}
        {Array.from({ length: 6 }, (_, si) => {
          const stringNum = si + 1;
          return (
            <div key={stringNum} style={{ display: 'flex', alignItems: 'center', height: '30px' }}>
              {/* String label */}
              <div style={{
                width: '38px',
                flexShrink: 0,
                fontSize: '0.65rem',
                color: '#94a3b8',
                textAlign: 'right',
                paddingRight: '6px',
                fontWeight: 500,
              }}>
                {STRING_NAMES[si]}
              </div>

              {/* Frets */}
              {Array.from({ length: NUM_FRETS + 1 }, (_, f) => {
                const lit = isHighlighted(stringNum, f);
                const active = isActive(stringNum, f);
                const target = isTarget(stringNum, f);
                const note = getNote(stringNum, f);

                return (
                  <div
                    key={f}
                    style={{
                      flex: 1,
                      minWidth: '32px',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      borderRight: f < NUM_FRETS ? '1px solid rgba(100,116,139,0.15)' : 'none',
                      borderLeft: f === 0 ? '2px solid #94a3b8' : 'none',
                      background: f === 0
                        ? 'rgba(100,116,139,0.03)'
                        : 'transparent',
                    }}
                  >
                    {/* String wire */}
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: '50%',
                      height: `${1 + si * 0.3}px`,
                      background: 'rgba(148,163,184,0.3)',
                      transform: 'translateY(-50%)',
                    }} />

                    {/* Note dot */}
                    {(lit || active || target) && (
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.55rem',
                        fontWeight: 700,
                        zIndex: 2,
                        transition: 'all 0.15s ease',
                        background: active
                          ? '#22c55e'
                          : lit
                            ? 'rgba(99,102,241,0.8)'
                            : 'transparent',
                        border: target && !active && !lit
                          ? '2px dashed rgba(234,179,8,0.6)'
                          : active
                            ? '2px solid #22c55e'
                            : '2px solid rgba(99,102,241,0.5)',
                        color: active || lit ? '#fff' : '#eab308',
                        boxShadow: active
                          ? '0 0 10px rgba(34,197,94,0.5)'
                          : lit
                            ? '0 0 8px rgba(99,102,241,0.4)'
                            : 'none',
                        transform: active ? 'scale(1.2)' : 'scale(1)',
                      }}>
                        {note?.note.name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Fret dots (inlays) */}
        <div style={{ display: 'flex', marginTop: '4px' }}>
          <div style={{ width: '38px', flexShrink: 0 }} />
          {Array.from({ length: NUM_FRETS + 1 }, (_, f) => (
            <div
              key={f}
              style={{
                flex: 1,
                minWidth: '32px',
                textAlign: 'center',
                fontSize: '0.5rem',
                color: '#475569',
                lineHeight: 1,
              }}
            >
              {SINGLE_DOT_FRETS.includes(f) ? '●' : f === DOUBLE_DOT_FRET ? '● ●' : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
