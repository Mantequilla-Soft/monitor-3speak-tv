import { Box, Typography, Card, CardContent } from '@mui/material';
import { CheckCircle, Cancel, Warning as WarningIcon } from '@mui/icons-material';

interface SystemStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'warning';
}

interface SystemStatusStripProps {
  systems: SystemStatus[];
}

const statusConfig = {
  connected: {
    icon: CheckCircle,
    color: '#28DE89',
    bg: 'rgba(40, 222, 137, 0.15)',
    border: 'rgba(40, 222, 137, 0.3)',
    glow: 'rgba(40, 222, 137, 0.4)',
    label: 'Connected',
  },
  disconnected: {
    icon: Cancel,
    color: '#FF4D5E',
    bg: 'rgba(255, 77, 94, 0.15)',
    border: 'rgba(255, 77, 94, 0.3)',
    glow: 'rgba(255, 77, 94, 0.4)',
    label: 'Disconnected',
  },
  warning: {
    icon: WarningIcon,
    color: '#FFB444',
    bg: 'rgba(255, 180, 68, 0.15)',
    border: 'rgba(255, 180, 68, 0.3)',
    glow: 'rgba(255, 180, 68, 0.4)',
    label: 'Warning',
  },
};

export function SystemStatusStrip({ systems }: SystemStatusStripProps) {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 700,
            fontSize: '1.1rem',
          }}
        >
          System Status
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          {systems.map((system) => {
            const config = statusConfig[system.status];
            const StatusIcon = config.icon;

            return (
              <Box
                key={system.name}
                sx={{
                  flex: { xs: '1 1 100%', sm: '1 1 0' },
                  minWidth: { sm: '180px' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2.5,
                  py: 1.5,
                  borderRadius: '12px',
                  backgroundColor: config.bg,
                  border: `1px solid ${config.border}`,
                  boxShadow: `0 2px 8px ${config.glow}`,
                  transition: 'all 0.2s ease',
                  animation: system.status === 'connected' ? 'pulse 3s ease-in-out infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      boxShadow: `0 2px 8px ${config.glow}`,
                    },
                    '50%': {
                      boxShadow: `0 4px 16px ${config.glow}`,
                    },
                  },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 16px ${config.glow}`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    backgroundColor: config.bg,
                    border: `1px solid ${config.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <StatusIcon sx={{ fontSize: 18, color: config.color }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: 'text.primary',
                      lineHeight: 1.2,
                      mb: 0.25,
                    }}
                  >
                    {system.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.75rem',
                      color: config.color,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {config.label}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
