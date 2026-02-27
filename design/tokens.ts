export interface ThemeTokens {
  bg: {
    canvas: string;
    surface: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  border: {
    soft: string;
    strong: string;
  };
  accent: {
    primary: string;
    primaryHover: string;
    secondary: string;
  };
  feedback: {
    success: string;
    warning: string;
    danger: string;
  };
}

export const lightThemeTokens: ThemeTokens = {
  bg: {
    canvas: '#F6F4EF',
    surface: '#FFFFFF',
    elevated: '#FBF9F4',
  },
  text: {
    primary: '#171717',
    secondary: '#4A4A4A',
    muted: '#6E6E6E',
  },
  border: {
    soft: '#E7E3DA',
    strong: '#D5CFC1',
  },
  accent: {
    primary: '#D84E1F',
    primaryHover: '#BC431A',
    secondary: '#0F766E',
  },
  feedback: {
    success: '#177245',
    warning: '#A16207',
    danger: '#B42318',
  },
};

export const darkThemeTokens: ThemeTokens = {
  bg: {
    canvas: '#111315',
    surface: '#171A1D',
    elevated: '#1F2428',
  },
  text: {
    primary: '#F3F4F6',
    secondary: '#D1D5DB',
    muted: '#9CA3AF',
  },
  border: {
    soft: '#2B3137',
    strong: '#3A434C',
  },
  accent: {
    primary: '#F26A3D',
    primaryHover: '#FF7B52',
    secondary: '#2CB1A5',
  },
  feedback: {
    success: '#22A861',
    warning: '#D19C2B',
    danger: '#E14B45',
  },
};
