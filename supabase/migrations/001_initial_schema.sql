-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  distance_km DECIMAL(10,3) NOT NULL,
  pace VARCHAR(20) NOT NULL CHECK (pace IN ('walk', 'jog', 'run', 'sprint')),
  biome VARCHAR(30) NOT NULL CHECK (biome IN ('urban', 'forest', 'mountain', 'coastal', 'desert', 'suburban')),
  weather VARCHAR(30) NOT NULL CHECK (weather IN ('sunny', 'cloudy', 'rain', 'storm', 'thunderstorm', 'snow', 'fog')),
  time_of_day VARCHAR(20) NOT NULL CHECK (time_of_day IN ('dawn', 'morning', 'noon', 'afternoon', 'dusk', 'night', 'midnight')),
  season VARCHAR(10) NOT NULL CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
  elevation_gain_m INTEGER DEFAULT 0,
  logged_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Player stats table
CREATE TABLE IF NOT EXISTS player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_km DECIMAL(10,3) DEFAULT 0,
  current_egg_km DECIMAL(10,3) DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Monsters table
CREATE TABLE IF NOT EXISTS monsters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100),
  primary_type VARCHAR(20) NOT NULL,
  secondary_type VARCHAR(20),
  tertiary_type VARCHAR(20),
  traits TEXT[] DEFAULT '{}',
  evolution_tier VARCHAR(20) DEFAULT 'Hatchling',
  current_exp INTEGER DEFAULT 0,
  total_exp INTEGER DEFAULT 0,
  birth_pace VARCHAR(20) NOT NULL,
  birth_biome VARCHAR(30) NOT NULL,
  birth_weather VARCHAR(30) NOT NULL,
  birth_time_of_day VARCHAR(20) NOT NULL,
  birth_season VARCHAR(10) NOT NULL,
  attack_power INTEGER DEFAULT 10,
  defense_power INTEGER DEFAULT 10,
  speed_power INTEGER DEFAULT 10,
  hatched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE monsters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own activities" ON activities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own stats" ON player_stats FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own monsters" ON monsters FOR ALL USING (auth.uid() = user_id);
