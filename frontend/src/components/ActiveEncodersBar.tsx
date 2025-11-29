import { Box, Typography, Tooltip } from '@mui/material';
import { Computer as ComputerIcon } from '@mui/icons-material';

interface EncoderInfo {
  did: string;
  name: string;
  hiveAccount?: string;
  jobCount: number;
}

interface ActiveEncodersBarProps {
  encoders: EncoderInfo[];
}

export function ActiveEncodersBar({ encoders }: ActiveEncodersBarProps) {
  if (encoders.length === 0) {
    return null;
  }

  const getEncoderInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const getEncoderColor = (name: string) => {
    const colors = ['#4C55F2', '#28DE89', '#FFB444', '#FF4D5E', '#5DC5CD', '#6B00FF', '#2A3BAE'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  return (
    <Box
      sx={{
        mb: 3,
        p: 2.5,
        borderRadius: '16px',
        background: 'rgba(18, 26, 58, 0.4)',
        border: '1px solid rgba(76, 85, 242, 0.15)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <ComputerIcon sx={{ fontSize: 20, color: '#4C55F2' }} />
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Active Encoders ({encoders.length})
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        {encoders.map((encoder) => {
          const color = getEncoderColor(encoder.name);
          const initials = getEncoderInitials(encoder.name);

          return (
            <Tooltip
              key={encoder.did}
              title={
                <Box sx={{ p: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {encoder.name}
                  </Typography>
                  {encoder.hiveAccount && (
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', display: 'block' }}>
                      @{encoder.hiveAccount}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mt: 0.5 }}>
                    {encoder.jobCount} active job{encoder.jobCount !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              }
              arrow
              placement="top"
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  borderRadius: '12px',
                  background: `${color}15`,
                  border: `1px solid ${color}40`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 16px ${color}30`,
                    borderColor: color,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: 8,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: '#28DE89',
                    boxShadow: '0 0 8px #28DE89',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    '@keyframes pulse': {
                      '0%, 100%': {
                        opacity: 1,
                      },
                      '50%': {
                        opacity: 0.5,
                      },
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    backgroundColor: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: '#fff',
                    ml: 1,
                  }}
                >
                  {initials}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: 'text.primary',
                  }}
                >
                  {encoder.name}
                </Typography>
                <Box
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: '6px',
                    backgroundColor: `${color}25`,
                    border: `1px solid ${color}50`,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: color,
                  }}
                >
                  {encoder.jobCount}
                </Box>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}
