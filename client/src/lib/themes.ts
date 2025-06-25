export interface Theme {
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

export const themes: Record<string, Theme> = {
  cyberpunk: {
    name: 'Cyberpunk',
    description: 'Purple & Pink neon vibes',
    colors: {
      primary: 'hsl(256, 87%, 66%)',
      secondary: 'hsl(0, 79%, 70%)',
      accent: 'hsl(151, 100%, 50%)',
      background: 'hsl(240, 50%, 7%)',
    },
  },
  ocean: {
    name: 'Ocean',
    description: 'Blue & Teal depths',
    colors: {
      primary: 'hsl(220, 87%, 66%)',
      secondary: 'hsl(195, 79%, 70%)',
      accent: 'hsl(180, 100%, 50%)',
      background: 'hsl(220, 50%, 7%)',
    },
  },
  fire: {
    name: 'Fire',
    description: 'Red & Orange flames',
    colors: {
      primary: 'hsl(20, 87%, 66%)',
      secondary: 'hsl(15, 79%, 70%)',
      accent: 'hsl(60, 100%, 50%)',
      background: 'hsl(20, 50%, 7%)',
    },
  },
  matrix: {
    name: 'Matrix',
    description: 'Green & Lime code',
    colors: {
      primary: 'hsl(100, 87%, 66%)',
      secondary: 'hsl(135, 79%, 70%)',
      accent: 'hsl(120, 100%, 50%)',
      background: 'hsl(120, 50%, 7%)',
    },
  },
};
