export interface ThemeSong {
  title: string;
  artist: string;
  vibe: string;
  searchQuery: string;
}

const SONG_POOL: Record<string, ThemeSong[]> = {
  Fire: [
    { title: 'Centuries',          artist: 'Fall Out Boy',      vibe: 'Blazing triumph — this remnon burns to be remembered',       searchQuery: 'Fall Out Boy Centuries' },
    { title: 'Eye of the Tiger',   artist: 'Survivor',          vibe: 'Unstoppable fire — forged in the heat of every challenge',    searchQuery: 'Survivor Eye of the Tiger' },
    { title: 'Radioactive',        artist: 'Imagine Dragons',   vibe: 'Smoldering power — the world ignites at its touch',          searchQuery: 'Imagine Dragons Radioactive' },
  ],
  Water: [
    { title: 'River',              artist: 'Leon Bridges',      vibe: 'Flowing soul — calm on the surface, deep underneath',        searchQuery: 'Leon Bridges River' },
    { title: 'Ocean',              artist: 'Frank Ocean',       vibe: 'Endless depth — every wave carries a forgotten memory',      searchQuery: 'Frank Ocean Ocean' },
    { title: 'Tidal Wave',         artist: 'Trivium',           vibe: 'Restless surge — still waters that shatter everything',      searchQuery: 'Trivium Tidal Wave' },
  ],
  Earth: [
    { title: 'Roots',              artist: 'Imagine Dragons',   vibe: 'Grounded power — steady, ancient, unshakeable',             searchQuery: 'Imagine Dragons Roots' },
    { title: 'Heavy',              artist: 'Birdtalker',        vibe: 'Anchored and wise — carries the weight of the world lightly',searchQuery: 'Birdtalker Heavy' },
    { title: 'Mountains',          artist: 'Message to Bears',  vibe: 'Silent giant — patience carved from stone and time',         searchQuery: 'Message to Bears Mountains' },
  ],
  Wind: [
    { title: "Free Fallin'",       artist: 'Tom Petty',         vibe: 'Breezy freedom — born to wander without a care',            searchQuery: 'Tom Petty Free Fallin' },
    { title: "Blowin' in the Wind",artist: 'Bob Dylan',         vibe: 'Gentle wanderer — carries answers nobody has found yet',    searchQuery: 'Bob Dylan Blowin in the Wind' },
    { title: 'Learn to Fly',       artist: 'Foo Fighters',      vibe: 'Rising thermals — always chasing the next horizon',         searchQuery: 'Foo Fighters Learn to Fly' },
  ],
  Electric: [
    { title: 'Thunderstruck',      artist: 'AC/DC',             vibe: 'Pure electricity — unstoppable surge of raw energy',        searchQuery: 'ACDC Thunderstruck' },
    { title: 'Mr. Brightside',     artist: 'The Killers',       vibe: 'Charged intensity — electric heart running at full voltage', searchQuery: 'The Killers Mr Brightside' },
    { title: 'Uprising',           artist: 'Muse',              vibe: 'Crackling revolt — the spark that sets everything off',     searchQuery: 'Muse Uprising' },
  ],
  Nature: [
    { title: 'Into the Wild',      artist: 'LP',                vibe: 'Wild and alive — every step is a new discovery',           searchQuery: 'LP Into the Wild' },
    { title: 'Wild Heart',         artist: 'Bleachers',         vibe: 'Untamed spirit — roots deep, branches reaching sky',        searchQuery: 'Bleachers Wild Heart' },
    { title: 'Jungle',             artist: 'X Ambassadors',     vibe: 'Primordial force — life erupts wherever it steps',          searchQuery: 'X Ambassadors Jungle' },
  ],
  Ice: [
    { title: 'Cold Little Heart',  artist: 'Michael Kiwanuka',  vibe: 'Icy serenity — cool exterior, warm fire within',           searchQuery: 'Michael Kiwanuka Cold Little Heart' },
    { title: 'Skinny Love',        artist: 'Bon Iver',          vibe: 'Frosted stillness — breathtaking in silence',              searchQuery: 'Bon Iver Skinny Love' },
    { title: 'Holocene',           artist: 'Bon Iver',          vibe: 'Glacial clarity — sees the world from a frozen peak',       searchQuery: 'Bon Iver Holocene' },
  ],
  Shadow: [
    { title: 'Fade to Black',      artist: 'Metallica',         vibe: 'Shadowy depth — haunted by the road behind',               searchQuery: 'Metallica Fade to Black' },
    { title: 'In the Shadows',     artist: 'The Rasmus',        vibe: 'Twilight hunter — thrives where light does not reach',     searchQuery: 'The Rasmus In the Shadows' },
    { title: 'Black',              artist: 'Pearl Jam',         vibe: 'Dark elegance — quiet power that swallows the light',      searchQuery: 'Pearl Jam Black' },
  ],
  Light: [
    { title: 'Here Comes the Sun', artist: 'The Beatles',       vibe: 'Radiant warmth — every dawn belongs to this one',         searchQuery: 'Beatles Here Comes the Sun' },
    { title: 'Yellow',             artist: 'Coldplay',          vibe: 'Gentle luminance — shines brightest for those it loves',  searchQuery: 'Coldplay Yellow' },
    { title: 'Dog Days Are Over',  artist: 'Florence + the Machine', vibe: 'Blinding hope — bursts through every shadow',        searchQuery: 'Florence and the Machine Dog Days Are Over' },
  ],
  Mecha: [
    { title: 'Harder, Better, Faster, Stronger', artist: 'Daft Punk', vibe: 'Mechanical drive — optimised and relentless',       searchQuery: 'Daft Punk Harder Better Faster Stronger' },
    { title: 'One More Time',      artist: 'Daft Punk',         vibe: 'Infinite loop — built to celebrate and never stop',        searchQuery: 'Daft Punk One More Time' },
    { title: 'Digital Love',       artist: 'Daft Punk',         vibe: 'Circuit heart — runs on logic but dreams in colour',      searchQuery: 'Daft Punk Digital Love' },
  ],
  Fog: [
    { title: 'The Sound of Silence', artist: 'Simon & Garfunkel', vibe: 'Misty mystery — speaks without words',                  searchQuery: 'Simon Garfunkel The Sound of Silence' },
    { title: 'Mad World',          artist: 'Gary Jules',        vibe: 'Grey haze — sees every truth others prefer to ignore',    searchQuery: 'Gary Jules Mad World' },
    { title: 'Breathe',           artist: 'Pink Floyd',         vibe: 'Drifting vapour — exists between moments, not in them',  searchQuery: 'Pink Floyd Breathe' },
  ],
  Nocturnal: [
    { title: 'Midnight City',      artist: 'M83',               vibe: 'Night wanderer — thrives when others sleep',              searchQuery: 'M83 Midnight City' },
    { title: 'Running Up That Hill', artist: 'Kate Bush',       vibe: 'Moonlit sprint — chases something just beyond darkness',  searchQuery: 'Kate Bush Running Up That Hill' },
    { title: 'Night Moves',        artist: 'Bob Seger',         vibe: 'After-dark spirit — born under a sky full of stars',     searchQuery: 'Bob Seger Night Moves' },
  ],
  Void: [
    { title: 'Space Oddity',       artist: 'David Bowie',       vibe: 'Cosmic drift — exists beyond the world you know',        searchQuery: 'David Bowie Space Oddity' },
    { title: 'Black Hole Sun',     artist: 'Soundgarden',       vibe: 'Infinite collapse — pulls everything toward its centre', searchQuery: 'Soundgarden Black Hole Sun' },
    { title: 'Wish You Were Here', artist: 'Pink Floyd',        vibe: 'Formless longing — haunts the space between worlds',     searchQuery: 'Pink Floyd Wish You Were Here' },
  ],
};

export function pickRandomSong(primaryType: string): ThemeSong {
  const pool = SONG_POOL[primaryType] ?? SONG_POOL['Void']!;
  return pool[Math.floor(Math.random() * pool.length)];
}
