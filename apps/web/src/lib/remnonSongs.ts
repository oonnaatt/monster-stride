export interface ThemeSong {
  title: string;
  artist: string;
  vibe: string;
  searchQuery: string;
}

/** Builds a YouTube search URL from a saved theme song. */
export function getYouTubeSearchUrl(song: ThemeSong): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(song.searchQuery)}`;
}
