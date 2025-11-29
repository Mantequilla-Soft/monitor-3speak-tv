import { createTheme } from '@mui/material/styles';

// 3Speak Modern Brand Colors (2025)
const BRAND_COLORS = {
  // Primary brand colors
  brandBlue: '#2C3FC7',
  brightBlue: '#4C55F2',
  navyDark: '#121A3A',
  navyBase: '#0C1231',
  // Accent gradient
  gradientStart: '#2A3BAE',
  gradientEnd: '#6B00FF',
  // Text colors
  lightText: '#EAF0FF',
  mutedText: '#B4C0F8',
  darkPanel: '#1A1F3D',
  // Status colors
  success: '#28DE89',
  warning: '#FFB444',
  danger: '#FF4D5E',
  // Legacy colors (for backward compatibility)
  red: '#FF4D5E',
  cyan: '#4C55F2',
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: BRAND_COLORS.brandBlue,
      light: BRAND_COLORS.brightBlue,
      dark: BRAND_COLORS.gradientStart,
      contrastText: '#fff',
    },
    secondary: {
      main: BRAND_COLORS.brightBlue,
      light: '#7DD4DB',
      dark: BRAND_COLORS.brandBlue,
      contrastText: '#fff',
    },
    background: {
      default: BRAND_COLORS.navyBase,
      paper: BRAND_COLORS.navyDark,
    },
    text: {
      primary: BRAND_COLORS.lightText,
      secondary: BRAND_COLORS.mutedText,
    },
    success: {
      main: BRAND_COLORS.success,
      contrastText: '#000',
    },
    warning: {
      main: BRAND_COLORS.warning,
      contrastText: '#000',
    },
    error: {
      main: BRAND_COLORS.danger,
      contrastText: '#fff',
    },
  },
  typography: {
    fontFamily: '"Manrope", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 800,
      color: BRAND_COLORS.lightText,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: BRAND_COLORS.lightText,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,
      color: BRAND_COLORS.lightText,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: BRAND_COLORS.lightText,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: BRAND_COLORS.lightText,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: BRAND_COLORS.lightText,
    },
    body1: {
      fontWeight: 400,
    },
    body2: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${BRAND_COLORS.gradientStart} 0%, ${BRAND_COLORS.gradientEnd} 100%)`,
          backgroundImage: 'none',
          boxShadow: '0 4px 24px rgba(42, 59, 174, 0.25)',
          borderBottom: 'none',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: BRAND_COLORS.navyBase,
          color: BRAND_COLORS.lightText,
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(76, 85, 242, 0.1) 0%, transparent 50%)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          marginBottom: 4,
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            background: `linear-gradient(90deg, ${BRAND_COLORS.gradientStart} 0%, ${BRAND_COLORS.gradientEnd} 100%)`,
            boxShadow: '0 4px 16px rgba(76, 85, 242, 0.3)',
            '&:hover': {
              background: `linear-gradient(90deg, ${BRAND_COLORS.gradientStart} 0%, ${BRAND_COLORS.gradientEnd} 100%)`,
              boxShadow: '0 6px 20px rgba(76, 85, 242, 0.4)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(76, 85, 242, 0.1)',
            boxShadow: '0 2px 8px rgba(76, 85, 242, 0.2)',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: BRAND_COLORS.brightBlue,
          minWidth: 40,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: BRAND_COLORS.lightText,
          fontWeight: 600,
          fontSize: '0.95rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: BRAND_COLORS.navyDark,
          backgroundImage: 'none',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(76, 85, 242, 0.2)',
          borderRadius: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, ${BRAND_COLORS.gradientStart}, ${BRAND_COLORS.gradientEnd})`,
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(76, 85, 242, 0.3)',
            borderColor: 'rgba(76, 85, 242, 0.4)',
            '&::before': {
              opacity: 1,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.95rem',
          transition: 'all 0.2s ease',
        },
        contained: {
          boxShadow: '0 4px 16px rgba(76, 85, 242, 0.25)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(76, 85, 242, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 10,
          fontSize: '0.85rem',
          padding: '4px 8px',
        },
        colorSuccess: {
          backgroundColor: 'rgba(40, 222, 137, 0.15)',
          color: BRAND_COLORS.success,
          border: '1px solid rgba(40, 222, 137, 0.3)',
        },
        colorWarning: {
          backgroundColor: 'rgba(255, 180, 68, 0.15)',
          color: BRAND_COLORS.warning,
          border: '1px solid rgba(255, 180, 68, 0.3)',
        },
        colorError: {
          backgroundColor: 'rgba(255, 77, 94, 0.15)',
          color: BRAND_COLORS.danger,
          border: '1px solid rgba(255, 77, 94, 0.3)',
        },
        colorPrimary: {
          backgroundColor: 'rgba(76, 85, 242, 0.15)',
          color: BRAND_COLORS.brightBlue,
          border: '1px solid rgba(76, 85, 242, 0.3)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(76, 85, 242, 0.1)',
          padding: '16px',
        },
        head: {
          fontWeight: 700,
          backgroundColor: 'rgba(76, 85, 242, 0.05)',
          color: BRAND_COLORS.lightText,
          fontSize: '0.9rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(76, 85, 242, 0.08)',
            boxShadow: '0 2px 8px rgba(76, 85, 242, 0.15)',
          },
          '&:nth-of-type(odd)': {
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        standardError: {
          backgroundColor: 'rgba(230, 57, 70, 0.15)',
          border: '1px solid rgba(230, 57, 70, 0.3)',
          color: '#FF5662',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 193, 7, 0.15)',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          color: '#FFD54F',
        },
        standardInfo: {
          backgroundColor: 'rgba(93, 197, 205, 0.15)',
          border: '1px solid rgba(93, 197, 205, 0.3)',
          color: '#7DD4DB',
        },
        standardSuccess: {
          backgroundColor: 'rgba(76, 175, 80, 0.15)',
          border: '1px solid rgba(76, 175, 80, 0.3)',
          color: '#81C784',
        },
      },
    },
  },
});

export { BRAND_COLORS };
