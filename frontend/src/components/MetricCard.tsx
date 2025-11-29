import { Box, Card, CardContent, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
  sparklineData?: number[];
  trend?: 'up' | 'down' | 'neutral';
}

const colorMap = {
  primary: {
    bg: 'rgba(76, 85, 242, 0.15)',
    border: 'rgba(76, 85, 242, 0.3)',
    glow: 'rgba(76, 85, 242, 0.4)',
    line: '#4C55F2',
  },
  success: {
    bg: 'rgba(40, 222, 137, 0.15)',
    border: 'rgba(40, 222, 137, 0.3)',
    glow: 'rgba(40, 222, 137, 0.4)',
    line: '#28DE89',
  },
  warning: {
    bg: 'rgba(255, 180, 68, 0.15)',
    border: 'rgba(255, 180, 68, 0.3)',
    glow: 'rgba(255, 180, 68, 0.4)',
    line: '#FFB444',
  },
  error: {
    bg: 'rgba(255, 77, 94, 0.15)',
    border: 'rgba(255, 77, 94, 0.3)',
    glow: 'rgba(255, 77, 94, 0.4)',
    line: '#FF4D5E',
  },
  info: {
    bg: 'rgba(93, 197, 205, 0.15)',
    border: 'rgba(93, 197, 205, 0.3)',
    glow: 'rgba(93, 197, 205, 0.4)',
    line: '#5DC5CD',
  },
};

export function MetricCard({ title, value, icon, color, sparklineData, trend }: MetricCardProps) {
  const colors = colorMap[color];
  
  // Generate sparkline data if not provided
  const chartData = sparklineData
    ? sparklineData.map((value, index) => ({ x: index, y: value }))
    : Array.from({ length: 10 }, (_, i) => ({ x: i, y: Math.random() * 100 }));

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${colors.bg} 0%, rgba(18, 26, 58, 0.8) 100%)`,
        animation: 'fadeInUp 0.5s ease-out',
        '@keyframes fadeInUp': {
          from: {
            opacity: 0,
            transform: 'translateY(20px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                mb: 1,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '2.5rem' },
                lineHeight: 1,
                background: `linear-gradient(135deg, #EAF0FF 0%, ${colors.line} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: { xs: 48, sm: 56 },
              height: { xs: 48, sm: 56 },
              borderRadius: '16px',
              backgroundColor: colors.bg,
              border: `2px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 16px ${colors.glow}`,
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': {
                  boxShadow: `0 4px 16px ${colors.glow}`,
                },
                '50%': {
                  boxShadow: `0 8px 24px ${colors.glow}`,
                },
              },
              '& > svg': {
                fontSize: { xs: 24, sm: 28 },
                color: colors.line,
              },
            }}
          >
            {icon}
          </Box>
        </Box>

        {/* Sparkline Chart */}
        <Box sx={{ mt: 'auto', height: 40, width: '100%', opacity: 0.7 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="y"
                stroke={colors.line}
                strokeWidth={2}
                dot={false}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
