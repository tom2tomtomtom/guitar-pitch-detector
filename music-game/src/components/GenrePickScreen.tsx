import { useState } from 'react';
import type { Player } from '../types';
import { getRandomGenres, GENRE_CATEGORIES } from '../genres';
import { PLAYER_COLORS } from './SetupScreen';

interface GenrePickScreenProps {
  picker: Player;
  pickerIndex: number;
  round: number;
  onGenrePicked: (genre: string) => void;
  onUseLifeline: () => void;
}

export function GenrePickScreen({ picker, pickerIndex, round, onGenrePicked, onUseLifeline }: GenrePickScreenProps) {
  const [customGenre, setCustomGenre] = useState('');
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [showBrowse, setShowBrowse] = useState(false);

  const handleSuggest = () => {
    if (picker.lifelines <= 0) return;
    const randoms = getRandomGenres(3);
    setSuggestions(randoms);
    onUseLifeline();
  };

  const handleSubmitCustom = () => {
    if (customGenre.trim()) {
      onGenrePicked(customGenre.trim());
    }
  };

  return (
    <div style={{ padding: '1rem 0', maxWidth: '400px', margin: '0 auto' }}>
      {/* Round header */}
      <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
        <div style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 600,
        }}>
          Round {round}
        </div>
      </div>

      {/* Picker announcement */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: PLAYER_COLORS[pickerIndex % PLAYER_COLORS.length],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          fontWeight: 800,
          color: '#fff',
          margin: '0 auto 0.75rem',
          boxShadow: `0 4px 20px ${PLAYER_COLORS[pickerIndex % PLAYER_COLORS.length]}60`,
        }}>
          {picker.name[0].toUpperCase()}
        </div>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#e5e7eb',
        }}>
          {picker.name}'s pick!
        </div>
        <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>
          Choose a genre or theme for this round
        </div>
      </div>

      {/* Custom genre input */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Type a genre or theme..."
            value={customGenre}
            onChange={(e) => setCustomGenre(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmitCustom()}
            maxLength={50}
            autoFocus
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              border: '1px solid rgba(168, 139, 250, 0.2)',
              background: 'rgba(168, 139, 250, 0.05)',
              color: '#e5e7eb',
              fontSize: '1rem',
              fontFamily: 'system-ui, sans-serif',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSubmitCustom}
            disabled={!customGenre.trim()}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              border: 'none',
              background: customGenre.trim()
                ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                : 'rgba(100, 116, 139, 0.2)',
              color: customGenre.trim() ? '#fff' : '#6b7280',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: customGenre.trim() ? 'pointer' : 'default',
              fontFamily: 'system-ui, sans-serif',
              transition: 'all 0.15s ease',
            }}
          >
            Go
          </button>
        </div>
      </div>

      {/* Divider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        margin: '1.5rem 0',
      }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(168, 139, 250, 0.15)' }} />
        <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase' }}>or</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(168, 139, 250, 0.15)' }} />
      </div>

      {/* Lifeline / Suggest button */}
      {!suggestions ? (
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <button
            onClick={handleSuggest}
            disabled={picker.lifelines <= 0}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              border: '1px solid rgba(251, 146, 60, 0.3)',
              background: picker.lifelines > 0
                ? 'rgba(251, 146, 60, 0.1)'
                : 'rgba(100, 116, 139, 0.1)',
              color: picker.lifelines > 0 ? '#fb923c' : '#6b7280',
              cursor: picker.lifelines > 0 ? 'pointer' : 'default',
              fontSize: '0.9rem',
              fontWeight: 600,
              fontFamily: 'system-ui, sans-serif',
              transition: 'all 0.15s ease',
            }}
          >
            Give me a suggestion
          </button>
          <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.4rem' }}>
            {picker.lifelines > 0
              ? `${picker.lifelines} lifeline${picker.lifelines !== 1 ? 's' : ''} remaining`
              : 'No lifelines left!'}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{
            fontSize: '0.8rem',
            color: '#9ca3af',
            textAlign: 'center',
            marginBottom: '0.75rem',
            fontWeight: 600,
          }}>
            Pick one:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {suggestions.map((genre) => (
              <button
                key={genre}
                onClick={() => onGenrePicked(genre)}
                style={{
                  padding: '0.8rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(168, 139, 250, 0.2)',
                  background: 'rgba(168, 139, 250, 0.08)',
                  color: '#c084fc',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 600,
                  fontFamily: 'system-ui, sans-serif',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Browse genres */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => setShowBrowse(!showBrowse)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          {showBrowse ? 'Hide ideas' : 'Browse genre ideas'}
        </button>
      </div>

      {showBrowse && (
        <div style={{ marginTop: '1rem' }}>
          {GENRE_CATEGORIES.map((cat) => (
            <div key={cat.category} style={{ marginBottom: '1.25rem' }}>
              <div style={{
                fontSize: '0.7rem',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
                marginBottom: '0.4rem',
              }}>
                {cat.category}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {cat.genres.map((g) => (
                  <button
                    key={g}
                    onClick={() => onGenrePicked(g)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid rgba(168, 139, 250, 0.15)',
                      background: 'rgba(168, 139, 250, 0.05)',
                      color: '#a78bfa',
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      fontFamily: 'system-ui, sans-serif',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
