import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface CompactMetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'primary' | 'success' | 'warning' | 'info';
  sparklineData?: number[];
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

export function CompactMetricCard({ title, value, icon, color, sparklineData }: CompactMetricCardProps) {
  const colors = colorMap[color];
  
  const chartData = sparklineData
    ? sparklineData.map((value, index) => ({ x: index, y: value }))
    : Array.from({ length: 8 }, (_, i) => ({ x: i, y: Math.random() * 100 }));

  return (
    <Box
      sx={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${colors.glow}`,
          borderColor: colors.line,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          {title}
        </Typography>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            backgroundColor: colors.iconBg,
            border: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 2px 8px ${colors.glow}`,
            '& > svg': {
              fontSize: 18,
              color: colors.line,
            },
          }}
        >
          {icon}
        </Box>
      </Box>

      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          fontSize: '2rem',
          lineHeight: 1,
          color: 'text.primary',
        }}
      >
        {value}
      </Typography>

      <Box sx={{ height: 32, width: '100%', opacity: 0.6, mt: 'auto' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="y"
              stroke={colors.line}
              strokeWidth={2}
              dot={false}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
