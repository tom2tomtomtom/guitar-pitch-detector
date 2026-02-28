import { useState } from 'react';
import { usePitchDetector } from './hooks/usePitchDetector';
import { PitchMeter } from './components/PitchMeter';
import { TeachingMode } from './components/TeachingMode';
import { TestMode } from './components/TestMode';
import { ScalePractice } from './components/ScalePractice';

type Mode = 'tuner' | 'teaching' | 'test' | 'scale';

const MODES: { key: Mode; label: string; icon: string; description: string }[] = [
  { key: 'tuner', label: 'Free Play', icon: '🎵', description: 'See what note you\'re playing with real-time tuning feedback' },
  { key: 'teaching', label: 'Learn', icon: '📖', description: 'See notes light up on the fretboard as you play' },
  { key: 'test', label: 'Test', icon: '🎯', description: 'Play specific notes on specific strings to build accuracy' },
  { key: 'scale', label: 'Scales', icon: '🎶', description: 'Practice playing through scales step by step' },
];

export default function App() {
  const [mode, setMode] = useState<Mode>('tuner');
  const { isListening, currentPitch, currentNote, audioLevel, error, startListening, stopListening } = usePitchDetector();

  const currentMode = MODES.find((m) => m.key === mode)!;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Pulsing keyframe animation for listening state */}
      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes level-bar {
          from { opacity: 0.6; }
          to { opacity: 1; }
        }
      `}</style>

      <div style={{
        maxWidth: '520px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
      }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            🎸 Guitar Pitch Detector
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            Real-time pitch detection using the YIN algorithm
          </p>
        </header>

        {/* Mic button + audio level */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            onClick={isListening ? stopListening : startListening}
            aria-label={isListening ? 'Stop listening to microphone' : 'Start listening to microphone'}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '12px',
              border: 'none',
              background: isListening
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'system-ui, sans-serif',
              boxShadow: isListening
                ? '0 4px 20px rgba(239, 68, 68, 0.3)'
                : '0 4px 20px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.2s ease',
              animation: isListening ? 'pulse-ring 2s infinite' : 'none',
            }}
          >
            {isListening ? '⏹ Stop Listening' : '🎤 Start Listening'}
          </button>

          {/* Audio level meter - shows mic is working */}
          {isListening && (
            <div
              role="meter"
              aria-label="Microphone input level"
              aria-valuenow={Math.round(audioLevel * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{
                marginTop: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Mic</span>
              <div style={{
                width: '120px',
                height: '4px',
                borderRadius: '2px',
                background: 'rgba(100, 116, 139, 0.15)',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${Math.max(2, audioLevel * 100)}%`,
                  height: '100%',
                  borderRadius: '2px',
                  background: audioLevel > 0.7
                    ? '#ef4444'
                    : audioLevel > 0.3
                      ? '#22c55e'
                      : '#64748b',
                  transition: 'width 0.05s ease-out, background 0.15s ease',
                }} />
              </div>
              <span style={{ fontSize: '0.65rem', color: '#475569', minWidth: '20px' }}>
                {audioLevel < 0.02 ? '—' : audioLevel > 0.7 ? 'Loud' : audioLevel > 0.3 ? 'Good' : 'Low'}
              </span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
                fontSize: '0.85rem',
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Mode tabs */}
        <div
          role="tablist"
          aria-label="Detection mode"
          style={{
            display: 'flex',
            gap: '4px',
            background: 'rgba(100, 116, 139, 0.08)',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '0.5rem',
          }}
        >
          {MODES.map((m) => (
            <button
              key={m.key}
              role="tab"
              aria-selected={mode === m.key}
              aria-controls={`panel-${m.key}`}
              onClick={() => setMode(m.key)}
              title={m.description}
              style={{
                flex: 1,
                padding: '0.6rem 0.5rem',
                borderRadius: '8px',
                border: 'none',
                background: mode === m.key ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: mode === m.key ? '#a5b4fc' : '#64748b',
                fontSize: '0.8rem',
                fontWeight: mode === m.key ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif',
                transition: 'all 0.15s ease',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Mode description */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#64748b',
          marginBottom: '1.5rem',
          lineHeight: 1.4,
        }}>
          {currentMode.icon} {currentMode.description}
        </div>

        {/* Active mode content */}
        <div role="tabpanel" id={`panel-${mode}`}>
          {mode === 'tuner' && (
            <PitchMeter note={currentNote} pitch={currentPitch} isListening={isListening} />
          )}
          {mode === 'teaching' && (
            <TeachingMode
              currentNote={currentNote}
              currentPitch={currentPitch}
              isListening={isListening}
            />
          )}
          {mode === 'test' && (
            <TestMode
              currentNote={currentNote}
              currentPitch={currentPitch}
              isListening={isListening}
            />
          )}
          {mode === 'scale' && (
            <ScalePractice
              currentNote={currentNote}
              currentPitch={currentPitch}
              isListening={isListening}
            />
          )}
        </div>

        {/* Footer info */}
        <footer style={{
          marginTop: '3rem',
          textAlign: 'center',
          fontSize: '0.7rem',
          color: '#475569',
          lineHeight: 1.6,
        }}>
          <p style={{ margin: 0 }}>
            Uses the YIN pitch detection algorithm for real-time frequency analysis.
          </p>
          <p style={{ margin: '0.25rem 0 0' }}>
            Works best with single notes (monophonic). For best results, play close to the mic.
          </p>
        </footer>
      </div>
    </div>
  );
}
