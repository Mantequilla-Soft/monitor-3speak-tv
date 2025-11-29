import { Box, SxProps, Theme } from '@mui/material';

interface ThreeSpeakLogoProps {
  size?: number | { xs?: number; sm?: number; md?: number };
  showText?: boolean;
}

export function ThreeSpeakLogo({ size = 40, showText = true }: ThreeSpeakLogoProps) {
  const logoHeight = typeof size === 'number' ? size : { xs: size.xs || 40, sm: size.sm || 40, md: size.md || 40 };
  
  // Calculate font size responsively
  const fontSize: SxProps<Theme> = typeof size === 'number' 
    ? { fontSize: size * 0.5 }
    : { 
        fontSize: { 
          xs: (size.xs || 40) * 0.5, 
          sm: (size.sm || 40) * 0.5,
          md: (size.md || 40) * 0.5
        }
      };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {/* 3Speak Logo - Using 3SpeakLogoM.png */}
      <Box
        component="img"
        src="/3SpeakLogoM.png"
        alt="3Speak Logo"
        sx={{
          height: logoHeight,
          width: 'auto',
        }}
      />
      
      {showText && (
        <Box
          component="span"
          sx={{
            ...fontSize,
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.02em',
          }}
        >
          3Speak
        </Box>
      )}
    </Box>
  );
}
