import { createTheme } from '@mui/material/styles';
import { fontBody, fontHeading } from './typography';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1B4332',
      dark: '#081C15',
      light: '#2D6A4F',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#40916C',
      dark: '#2D6A4F',
      light: '#52B788',
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#FAF7F2',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#1D1D1D',
      secondary: '#5C5C5C'
    },
    divider: '#E5E0D8'
  },
  typography: {
    fontFamily: fontBody,
    fontSize: 16,
    htmlFontSize: 16,
    h1: {
      fontFamily: fontHeading,
      fontWeight: 600,
      fontSize: '2.375rem',
      lineHeight: 1.2
    },
    h2: {
      fontFamily: fontHeading,
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.25
    },
    h3: {
      fontFamily: fontHeading,
      fontWeight: 600,
      fontSize: '1.375rem',
      lineHeight: 1.3
    },
    h4: {
      fontFamily: fontHeading,
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.35
    },
    h5: {
      fontFamily: fontHeading,
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.4
    },
    h6: {
      fontFamily: fontHeading,
      fontWeight: 600,
      fontSize: '0.9375rem',
      lineHeight: 1.45
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6
    },
    body2: {
      fontSize: '0.9375rem',
      lineHeight: 1.55
    },
    button: {
      fontFamily: fontBody,
      fontWeight: 600,
      fontSize: '0.9375rem',
      textTransform: 'none'
    }
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none'
          }
        },
        containedPrimary: {
          backgroundColor: '#1B4332',
          '&:hover': {
            backgroundColor: '#081C15'
          }
        },
        containedSecondary: {
          backgroundColor: '#40916C',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#2D6A4F'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #E5E0D8',
          boxShadow: '0 1px 3px rgba(27, 67, 50, 0.06)'
        }
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: fontBody
        },
        h1: { fontFamily: fontHeading },
        h2: { fontFamily: fontHeading },
        h3: { fontFamily: fontHeading },
        h4: { fontFamily: fontHeading },
        h5: { fontFamily: fontHeading },
        h6: { fontFamily: fontHeading }
      }
    }
  }
});

export default theme;
