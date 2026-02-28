export interface GenreCategory {
  category: string;
  genres: string[];
}

export const GENRE_CATEGORIES: GenreCategory[] = [
  {
    category: 'Classic Genres',
    genres: [
      'Classic Rock', 'Glam Rock', 'Punk Rock', 'Indie Rock',
      'Heavy Metal', 'Grunge', 'Prog Rock', 'Psychedelic Rock',
      'Blues', 'Jazz', 'Soul', 'Funk',
      'Reggae', 'Ska', 'Country', 'Folk',
    ],
  },
  {
    category: 'Pop & Dance',
    genres: [
      '80s Pop', '90s Pop', '2000s Pop', 'Modern Pop',
      'Disco', 'House', 'Techno', 'Drum & Bass',
      'EDM Bangers', 'Trance', 'Garage', 'Grime',
      'K-Pop', 'Latin Pop', 'Eurodance', 'Synthwave',
    ],
  },
  {
    category: 'Hip Hop & R&B',
    genres: [
      'Old School Hip Hop', '90s Hip Hop', 'Modern Rap',
      'Trap', 'UK Rap', 'Conscious Hip Hop',
      '90s R&B', 'Modern R&B', 'Neo-Soul',
      'Afrobeats', 'Dancehall',
    ],
  },
  {
    category: 'Vibes & Moods',
    genres: [
      'Love Songs', 'Breakup Songs', 'Songs to Cry To',
      'Feel-Good Anthems', 'Road Trip Songs', 'Summer Vibes',
      'Late Night Chill', 'Pre-Game Hype', 'Morning Coffee Songs',
      'Rainy Day Music', 'Workout Bangers', 'Songs That Give Chills',
    ],
  },
  {
    category: 'Fun Themes',
    genres: [
      'One-Hit Wonders', 'Guilty Pleasures', 'Wedding Bangers',
      'Festival Anthems', 'Karaoke Classics', 'Songs Everyone Knows',
      'Movie Soundtracks', 'TV Theme Songs', 'Video Game Music',
      'Songs With a Name in the Title', 'Songs With a Colour in the Title',
      'Songs About Cities', 'Songs About Cars', 'Songs About Money',
    ],
  },
  {
    category: 'Decades',
    genres: [
      '60s Classics', '70s Legends', '80s Anthems',
      '90s Nostalgia', '2000s Throwbacks', '2010s Hits',
      'This Year\'s Best',
    ],
  },
  {
    category: 'Wild Cards',
    genres: [
      'Songs Your Parents Love', 'Songs That Make You Dance Alone',
      'Best Song From a One-Album Artist', 'Best Opening Track on an Album',
      'Songs That Changed Music', 'Most Underrated Song Ever',
      'Song You\'d Play to an Alien', 'Song for the End of the World',
      'Best Guitar Solo', 'Best Bass Line', 'Best Music Video',
      'Songs That Start Slow Then Explode',
    ],
  },
];

const ALL_GENRES = GENRE_CATEGORIES.flatMap((c) => c.genres);

export function getRandomGenres(count: number, exclude?: string): string[] {
  const available = exclude ? ALL_GENRES.filter((g) => g !== exclude) : [...ALL_GENRES];
  const result: string[] = [];
  for (let i = 0; i < count && available.length > 0; i++) {
    const idx = Math.floor(Math.random() * available.length);
    result.push(available.splice(idx, 1)[0]);
  }
  return result;
}
