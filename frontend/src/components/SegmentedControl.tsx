import { Box, IconButton } from '@mui/material';
import { ReactNode } from 'react';

interface SegmentOption {
  value: number;
  label: string;
  icon: ReactNode;
  count?: number;
}

interface SegmentedControlProps {
  options: SegmentOption[];
  value: number;
  onChange: (value: number) => void;
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        gap: 1,
        p: 0.75,
        borderRadius: '16px',
        background: 'rgba(18, 26, 58, 0.6)',
        border: '1px solid rgba(76, 85, 242, 0.2)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {options.map((option) => (
        <Box
          key={option.value}
          onClick={() => onChange(option.value)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 3,
            py: 1.5,
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            ...(value === option.value
              ? {
                  background: 'linear-gradient(135deg, #2A3BAE 0%, #6B00FF 100%)',
                  boxShadow: '0 4px 20px rgba(76, 85, 242, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.02)',
                }
              : {
                  background: 'transparent',
                  '&:hover': {
                    background: 'rgba(76, 85, 242, 0.1)',
                    boxShadow: '0 2px 8px rgba(76, 85, 242, 0.2)',
                  },
                }),
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: value === option.value ? '#fff' : 'rgba(76, 85, 242, 0.8)',
              '& > svg': {
                fontSize: 20,
              },
            }}
          >
            {option.icon}
          </Box>
          <Box
            sx={{
              fontWeight: value === option.value ? 700 : 600,
              fontSize: '0.95rem',
              color: value === option.value ? '#fff' : 'text.secondary',
              whiteSpace: 'nowrap',
            }}
          >
            {option.label}
          </Box>
          {option.count !== undefined && (
            <Box
              sx={{
                px: 1.25,
                py: 0.25,
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                background:
                  value === option.value
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(76, 85, 242, 0.15)',
                color: value === option.value ? '#fff' : 'rgba(76, 85, 242, 0.9)',
                border: `1px solid ${
                  value === option.value ? 'rgba(255, 255, 255, 0.3)' : 'rgba(76, 85, 242, 0.3)'
                }`,
              }}
            >
              {option.count}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}
