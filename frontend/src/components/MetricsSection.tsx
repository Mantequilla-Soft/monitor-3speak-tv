import { Box, Typography, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { ReactNode, useState } from 'react';
import {
  VideoLibrary as VideoIcon,
  Speed as SpeedIcon,
  Computer as ComputerIcon,
  CheckCircle,
} from '@mui/icons-material';

interface MetricData {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  color: 'primary' | 'success' | 'warning' | 'info';
}

interface MetricsSectionProps {
  totalJobsToday: number;
  avgEncodingTime: string;
  uniqueEncoders: number;
  successRate: string;
  onFilterChange?: (filter: 'today' | '7d' | '30d') => void;
}

const colorMap = {
  primary: {
    bg: 'rgba(76, 85, 242, 0.1)',
    border: 'rgba(76, 85, 242, 0.3)',
    iconBg: 'rgba(76, 85, 242, 0.15)',
    glow: 'rgba(76, 85, 242, 0.3)',
    line: '#4C55F2',
  },
  success: {
    bg: 'rgba(40, 222, 137, 0.1)',
    border: 'rgba(40, 222, 137, 0.3)',
    iconBg: 'rgba(40, 222, 137, 0.15)',
    glow: 'rgba(40, 222, 137, 0.3)',
    line: '#28DE89',
  },
  warning: {
    bg: 'rgba(255, 180, 68, 0.1)',
    border: 'rgba(255, 180, 68, 0.3)',
    iconBg: 'rgba(255, 180, 68, 0.15)',
    glow: 'rgba(255, 180, 68, 0.3)',
    line: '#FFB444',
  },
  info: {
    bg: 'rgba(93, 197, 205, 0.1)',
    border: 'rgba(93, 197, 205, 0.3)',
    iconBg: 'rgba(93, 197, 205, 0.15)',
    glow: 'rgba(93, 197, 205, 0.3)',
    line: '#5DC5CD',
  },
};

export function MetricsSection({
  totalJobsToday,
  avgEncodingTime,
  uniqueEncoders,
  successRate,
  onFilterChange,
}: MetricsSectionProps) {
  const [timeFilter, setTimeFilter] = useState<'today' | '7d' | '30d'>('today');

  const handleFilterChange = (_event: React.MouseEvent<HTMLElement>, newFilter: 'today' | '7d' | '30d' | null) => {
    if (newFilter) {
      setTimeFilter(newFilter);
      onFilterChange?.(newFilter);
    }
  };

  const metrics: MetricData[] = [
    {
      title: 'Total Jobs',
      value: totalJobsToday,
      subtitle: 'Last 24 hours',
      icon: <VideoIcon />,
      color: 'primary',
    },
    {
      title: 'Avg Encoding',
      value: avgEncodingTime,
      subtitle: 'per video',
      icon: <SpeedIcon />,
      color: 'warning',
    },
    {
      title: 'Active Encoders',
      value: uniqueEncoders,
      subtitle: 'currently encoding',
      icon: <ComputerIcon />,
      color: 'success',
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      subtitle: 'completion rate',
      icon: <CheckCircle />,
      color: 'info',
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      {/* Time Period Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <ToggleButtonGroup
          value={timeFilter}
          exclusive
          onChange={handleFilterChange}
          size="small"
          sx={{
            background: 'rgba(18, 26, 58, 0.6)',
            border: '1px solid rgba(76, 85, 242, 0.2)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            '& .MuiToggleButton-root': {
              border: 'none',
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.85rem',
              px: 2.5,
              py: 0.75,
              borderRadius: '10px',
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, #2A3BAE 0%, #6B00FF 100%)',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(76, 85, 242, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2A3BAE 0%, #6B00FF 100%)',
                },
              },
              '&:hover': {
                background: 'rgba(76, 85, 242, 0.1)',
              },
            },
          }}
        >
          <ToggleButton value="today">Today</ToggleButton>
          <ToggleButton value="7d">7 Days</ToggleButton>
          <ToggleButton value="30d">30 Days</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Metrics Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 3,
        }}
      >
        {metrics.map((metric) => {
          const colors = colorMap[metric.color];

          return (
            <Box
              key={metric.title}
              sx={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '18px',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: `linear-gradient(90deg, ${colors.line}, transparent)`,
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 32px ${colors.glow}`,
                  borderColor: colors.line,
                  '&::before': {
                    opacity: 1,
                  },
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {metric.title}
                </Typography>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    backgroundColor: colors.iconBg,
                    border: `1px solid ${colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 12px ${colors.glow}`,
                    '& > svg': {
                      fontSize: 22,
                      color: colors.line,
                    },
                  }}
                >
                  {metric.icon}
                </Box>
              </Box>

              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '2rem', sm: '2.25rem' },
                    lineHeight: 1,
                    color: 'text.primary',
                    mb: 0.5,
                  }}
                >
                  {metric.value}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  {metric.subtitle}
                </Typography>
              </Box>

              {/* Small sparkline-like decoration */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '50%',
                  height: '30%',
                  background: `radial-gradient(ellipse at bottom right, ${colors.glow}, transparent)`,
                  opacity: 0.3,
                  pointerEvents: 'none',
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
