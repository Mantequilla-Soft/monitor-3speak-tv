import { Drawer, Box, Typography, IconButton, Chip, LinearProgress, Divider } from '@mui/material';
import {
  Close as CloseIcon,
  VideoLibrary as VideoIcon,
  Computer as ComputerIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

interface Job {
  id: string;
  _id?: string;
  created_at: string;
  status: string;
  metadata?: {
    video_owner: string;
    video_permlink: string;
  };
  owner?: string;
  permlink?: string;
  input?: {
    size: number;
  };
  input_size?: number;
  assigned_to?: string;
  assigned_date?: string;
  completed_at?: string;
  progress?: {
    pct: number;
  };
  result?: {
    message?: string;
  };
  totalDuration?: number;
  encodingDuration?: number;
  encoderInfo?: {
    nodeName: string;
    hiveAccount?: string;
    didKey: string;
  };
}

interface JobDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  job: Job | null;
  onRetry?: (jobId: string) => void;
}

export function JobDetailsDrawer({ open, onClose, job, onRetry: _onRetry }: JobDetailsDrawerProps) {
  if (!job) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hours}h ${remainMins}m`;
  };

  const formatRelativeTime = (date: string): string => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const calculateETA = (startDate: string, progress: number): string => {
    if (progress === 0) return 'Calculating...';
    if (progress >= 100) return 'Complete';
    
    const elapsed = new Date().getTime() - new Date(startDate).getTime();
    const totalEstimated = (elapsed / progress) * 100;
    const remaining = totalEstimated - elapsed;
    
    return formatDuration(Math.floor(remaining / 1000));
  };

  const videoOwner = job.metadata?.video_owner || job.owner || 'Unknown';
  const videoPermlink = job.metadata?.video_permlink || job.permlink || 'Unknown';
  const progress = job.progress?.pct || 0;
  const fileSize = job.input?.size || job.input_size || 0;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480 },
          background: 'linear-gradient(180deg, #121A3A 0%, #0C1231 100%)',
          borderLeft: '1px solid rgba(76, 85, 242, 0.2)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #2A3BAE 0%, #6B00FF 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
              }}
            >
              <VideoIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#fff' }}>
              Job Details
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: '#fff',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
        {/* Video Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            Video
          </Typography>
          <Box sx={{ mt: 1, p: 2, background: 'rgba(76, 85, 242, 0.08)', borderRadius: '12px', border: '1px solid rgba(76, 85, 242, 0.15)' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              {videoOwner}/{videoPermlink}
            </Typography>
            <a
              href={`https://3speak.tv/watch?v=${videoOwner}/${videoPermlink}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#4C55F2', textDecoration: 'none', fontSize: '0.875rem' }}
            >
              View on 3Speak →
            </a>
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(76, 85, 242, 0.1)' }} />

        {/* Encoder Information */}
        {job.encoderInfo && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                Encoder
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #4C55F2 0%, #6B00FF 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  {job.encoderInfo.nodeName.substring(0, 2).toUpperCase()}
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {job.encoderInfo.nodeName}
                  </Typography>
                  {job.encoderInfo.hiveAccount && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      @{job.encoderInfo.hiveAccount}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3, borderColor: 'rgba(76, 85, 242, 0.1)' }} />
          </>
        )}

        {/* Progress */}
        {job.status === 'assigned' || job.status === 'running' ? (
          <>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                  Progress
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: progress >= 75 ? '#28DE89' : progress >= 50 ? '#4C55F2' : '#FFB444' }}>
                  {progress.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: 'rgba(76, 85, 242, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 6,
                    background:
                      progress >= 75
                        ? 'linear-gradient(90deg, #28DE89 0%, #20C77A 100%)'
                        : progress >= 50
                        ? 'linear-gradient(90deg, #4C55F2 0%, #6B00FF 100%)'
                        : 'linear-gradient(90deg, #FFB444 0%, #FF9500 100%)',
                    boxShadow: `0 2px 8px ${progress >= 75 ? '#28DE8950' : progress >= 50 ? '#4C55F250' : '#FFB44450'}`,
                  },
                }}
              />
            </Box>

            <Divider sx={{ my: 3, borderColor: 'rgba(76, 85, 242, 0.1)' }} />
          </>
        ) : null}

        {/* Timeline */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', mb: 2, display: 'block' }}>
            Timeline
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Created */}
            <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: 'rgba(76, 85, 242, 0.1)',
                  border: '1px solid rgba(76, 85, 242, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TimelineIcon sx={{ color: '#4C55F2', fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Created
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {new Date(job.created_at).toLocaleString()} ({formatRelativeTime(job.created_at)})
                </Typography>
              </Box>
            </Box>

            {/* Assigned */}
            {job.assigned_date && (
              <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: 'rgba(76, 85, 242, 0.1)',
                    border: '1px solid rgba(76, 85, 242, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ComputerIcon sx={{ color: '#4C55F2', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Assigned
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {new Date(job.assigned_date).toLocaleString()} ({formatRelativeTime(job.assigned_date)})
                  </Typography>
                </Box>
              </Box>
            )}

            {/* ETA */}
            {job.assigned_date && progress > 0 && progress < 100 && (
              <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: 'rgba(255, 180, 68, 0.1)',
                    border: '1px solid rgba(255, 180, 68, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ScheduleIcon sx={{ color: '#FFB444', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Estimated Completion
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {calculateETA(job.assigned_date, progress)} remaining
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Elapsed */}
            {job.assigned_date && (
              <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    background: 'rgba(93, 197, 205, 0.1)',
                    border: '1px solid rgba(93, 197, 205, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SpeedIcon sx={{ color: '#5DC5CD', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Elapsed Time
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {formatRelativeTime(job.assigned_date)}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(76, 85, 242, 0.1)' }} />

        {/* File Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em', mb: 2, display: 'block' }}>
            File Information
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'rgba(40, 222, 137, 0.1)',
                border: '1px solid rgba(40, 222, 137, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <StorageIcon sx={{ color: '#28DE89', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                File Size
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {formatFileSize(fileSize)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Status Badge */}
        <Box sx={{ mt: 4, p: 2, background: 'rgba(76, 85, 242, 0.05)', borderRadius: '12px', border: '1px solid rgba(76, 85, 242, 0.1)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Status
            </Typography>
            <Chip
              label={job.status}
              color={job.status === 'completed' ? 'success' : job.status === 'failed' ? 'error' : 'primary'}
              sx={{ fontWeight: 700, textTransform: 'capitalize' }}
            />
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
