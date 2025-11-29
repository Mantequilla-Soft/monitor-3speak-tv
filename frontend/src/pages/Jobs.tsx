import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  TablePagination,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  HourglassEmpty,
  Refresh as RefreshIcon,
  VideoLibrary as VideoIcon,
  Search as SearchIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { SegmentedControl, ActiveEncodersBar, JobDetailsDrawer, MetricsSection } from '../components';

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

export function Jobs() {
  const [tabValue, setTabValue] = useState(0);
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination states for each tab
  const [availablePage, setAvailablePage] = useState(0);
  const [availableRowsPerPage, setAvailableRowsPerPage] = useState(10);
  const [activePage, setActivePage] = useState(0);
  const [activeRowsPerPage, setActiveRowsPerPage] = useState(10);
  const [completedPage, setCompletedPage] = useState(0);
  const [completedRowsPerPage, setCompletedRowsPerPage] = useState(10);

  // Available Jobs Pagination
  const handleAvailablePageChange = (_event: unknown, newPage: number) => {
    setAvailablePage(newPage);
  };

  const handleAvailableRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAvailableRowsPerPage(parseInt(event.target.value, 10));
    setAvailablePage(0);
  };

  const paginatedAvailableJobs = availableJobs.slice(
    availablePage * availableRowsPerPage,
    availablePage * availableRowsPerPage + availableRowsPerPage
  );

  // Active Jobs Pagination
  const handleActivePageChange = (_event: unknown, newPage: number) => {
    setActivePage(newPage);
  };

  const handleActiveRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActiveRowsPerPage(parseInt(event.target.value, 10));
    setActivePage(0);
  };

  const paginatedActiveJobs = activeJobs.slice(
    activePage * activeRowsPerPage,
    activePage * activeRowsPerPage + activeRowsPerPage
  );

  // Completed Jobs Pagination
  const handleCompletedPageChange = (_event: unknown, newPage: number) => {
    setCompletedPage(newPage);
  };

  const handleCompletedRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCompletedRowsPerPage(parseInt(event.target.value, 10));
    setCompletedPage(0);
  };

  const paginatedCompletedJobs = completedJobs.slice(
    completedPage * completedRowsPerPage,
    completedPage * completedRowsPerPage + completedRowsPerPage
  );

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format relative time
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

  // Format duration in seconds to readable string
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hours}h ${remainMins}m`;
  };

  // Fetch jobs data
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoints = [
        '/api/jobs/available',
        '/api/jobs/active',
        '/api/jobs/completed?limit=100'
      ];

      const responses = await Promise.all(
        endpoints.map(endpoint => fetch(endpoint))
      );

      const data = await Promise.all(
        responses.map(response => response.json())
      );

      if (data[0].success) setAvailableJobs(data[0].data || []);
      if (data[1].success) setActiveJobs(data[1].data || []);
      if (data[2].success) setCompletedJobs(data[2].data || []);

    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Auto-refresh based on active tab
    const intervals: NodeJS.Timeout[] = [];
    
    if (tabValue === 0) {
      // Available jobs - refresh every 10 seconds
      const interval = setInterval(fetchJobs, 10000);
      intervals.push(interval);
    } else if (tabValue === 1) {
      // Active jobs - refresh every 5 seconds
      const interval = setInterval(fetchJobs, 5000);
      intervals.push(interval);
    }

    return () => intervals.forEach(interval => clearInterval(interval));
  }, [tabValue]);

  // Calculate metrics
  const totalJobsToday = completedJobs.filter(job => {
    if (!job.completed_at) return false;
    const today = new Date();
    const jobDate = new Date(job.completed_at);
    return jobDate.toDateString() === today.toDateString();
  }).length;

  const avgEncodingTime = completedJobs.length > 0
    ? Math.round(completedJobs.reduce((sum, job) => sum + (job.encodingDuration || 0), 0) / completedJobs.length)
    : 0;

  const uniqueEncoders = new Set(activeJobs.map(j => j.assigned_to).filter(Boolean)).size;

  // All completed jobs are considered successful (including forced ones)
  const successRate = completedJobs.length > 0
    ? '100.0'
    : '100.0';

  if (loading && availableJobs.length === 0 && activeJobs.length === 0 && completedJobs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Modern Header with Gradient Bar */}
      <Box
        sx={{
          mb: 3,
          p: { xs: 2, sm: 2.5 },
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #2A3BAE 0%, #6B00FF 100%)',
          boxShadow: '0 6px 24px rgba(42, 59, 174, 0.35), 0 2px 8px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100%',
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255, 255, 255, 0.02) 10px,
                rgba(255, 255, 255, 0.02) 20px
              )
            `,
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                color: '#fff',
                mb: 0.25,
                letterSpacing: '-0.02em',
              }}
            >
              Job Management
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.80)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Real-time encoding activity
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: '100%', sm: 240 },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '0.875rem',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.1)',
                  },
                  '& input::placeholder': {
                    color: 'rgba(255, 255, 255, 0.6)',
                    opacity: 1,
                  },
                },
              }}
            />
            <Tooltip title="Refresh data" arrow>
              <IconButton
                onClick={fetchJobs}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    transform: 'rotate(90deg)',
                  },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Enhanced Metrics Section */}
      <MetricsSection
        totalJobsToday={totalJobsToday}
        avgEncodingTime={formatDuration(avgEncodingTime)}
        uniqueEncoders={uniqueEncoders}
        successRate={successRate}
      />

      {/* Active Encoders Bar - Only show on In Progress tab */}
      {tabValue === 1 && (
        <ActiveEncodersBar
          encoders={(() => {
            const encoderMap = new Map<string, { did: string; name: string; hiveAccount?: string; jobCount: number }>();
            
            activeJobs.forEach(job => {
              if (job.encoderInfo) {
                const key = job.encoderInfo.didKey;
                if (encoderMap.has(key)) {
                  encoderMap.get(key)!.jobCount++;
                } else {
                  encoderMap.set(key, {
                    did: job.encoderInfo.didKey,
                    name: job.encoderInfo.nodeName,
                    hiveAccount: job.encoderInfo.hiveAccount,
                    jobCount: 1,
                  });
                }
              }
            });
            
            return Array.from(encoderMap.values());
          })()}
        />
      )}

      {/* Segmented Control for Tabs */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <SegmentedControl
          value={tabValue}
          onChange={setTabValue}
          options={[
            { value: 0, label: 'Available', icon: <HourglassEmpty /> },
            { value: 1, label: 'In Progress', icon: <CircularProgress size={16} /> },
            { value: 2, label: 'Completed', icon: <CheckCircle /> },
          ]}
        />
      </Box>

      {/* Available Jobs Tab */}
      {tabValue === 0 && (
        availableJobs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No jobs waiting - all clear!
            </Typography>
          </Box>
        ) : (
          <Box>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Video</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Size</TableCell>
                    <TableCell>Waiting</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedAvailableJobs.map((job) => {
                  const age = new Date().getTime() - new Date(job.created_at).getTime();
                  const isOld = age > 20 * 60 * 1000; // 20 minutes
                  
                  return (
                    <TableRow 
                      key={job.id}
                      sx={{ backgroundColor: isOld ? 'warning.light' : 'inherit' }}
                    >
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        <a
                          href={`https://3speak.tv/watch?v=${job.metadata?.video_owner || job.owner}/${job.metadata?.video_permlink || job.permlink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#4C55F2', textDecoration: 'none' }}
                        >
                          {job.metadata?.video_owner || job.owner}/{job.metadata?.video_permlink || job.permlink}
                        </a>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{formatFileSize(job.input?.size || job.input_size || 0)}</TableCell>
                      <TableCell>{formatRelativeTime(job.created_at)}</TableCell>
                      <TableCell>
                        {isOld && (
                          <Chip 
                            icon={<Warning />} 
                            label="Stuck" 
                            size="small" 
                            color="warning"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={availableJobs.length}
            page={availablePage}
            onPageChange={handleAvailablePageChange}
            rowsPerPage={availableRowsPerPage}
            onRowsPerPageChange={handleAvailableRowsPerPageChange}
            rowsPerPageOptions={[10, 25, 50]}
            sx={{
              borderTop: '1px solid rgba(76, 85, 242, 0.1)',
              '.MuiTablePagination-toolbar': {
                color: 'text.secondary',
              },
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontSize: '0.875rem',
              },
            }}
          />
        </Box>
        )
      )}

      {/* In Progress Tab */}
      {tabValue === 1 && (
        activeJobs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(76, 85, 242, 0.1), rgba(107, 0, 255, 0.1))',
                border: '1px solid rgba(76, 85, 242, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <HourglassEmpty sx={{ fontSize: 40, color: '#4C55F2' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              No Active Jobs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All jobs are currently idle or completed
            </Typography>
          </Box>
        ) : (
          <Box>
            <TableContainer
              sx={{
                overflowX: 'auto',
                background: 'rgba(18, 26, 58, 0.3)',
                borderRadius: '16px',
                border: '1px solid rgba(76, 85, 242, 0.15)',
              }}
            >
              <Table size="medium">
                <TableHead>
                  <TableRow
                    sx={{
                      background: 'rgba(76, 85, 242, 0.08)',
                      '& th': {
                        borderBottom: '2px solid rgba(76, 85, 242, 0.2)',
                        py: 2,
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Video</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, fontWeight: 700, color: 'text.primary' }}>Encoder</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Progress</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontWeight: 700, color: 'text.primary' }}>ETA</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, fontWeight: 700, color: 'text.primary' }}>Elapsed</TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' }, fontWeight: 700, color: 'text.primary' }}>Size</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedActiveJobs.filter(job => {
                    if (!searchQuery) return true;
                    const query = searchQuery.toLowerCase();
                    const owner = (job.metadata?.video_owner || job.owner || '').toLowerCase();
                    const permlink = (job.metadata?.video_permlink || job.permlink || '').toLowerCase();
                    const encoder = (job.encoderInfo?.nodeName || job.assigned_to || '').toLowerCase();
                    return owner.includes(query) || permlink.includes(query) || encoder.includes(query);
                  }).map((job, index) => {
                    const progress = job.progress?.pct || 0;
                    const calculateETA = () => {
                      if (!job.assigned_date || progress === 0) return 'Calculating...';
                      if (progress >= 100) return 'Complete';
                      const elapsed = new Date().getTime() - new Date(job.assigned_date).getTime();
                      const totalEstimated = (elapsed / progress) * 100;
                      const remaining = totalEstimated - elapsed;
                      return formatDuration(Math.floor(remaining / 1000));
                    };

                    return (
                  <TableRow
                    key={job.id}
                    onClick={() => {
                      setSelectedJob(job);
                      setDrawerOpen(true);
                    }}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderBottom: '1px solid rgba(76, 85, 242, 0.08)',
                      animation: `fadeIn 0.3s ease ${index * 0.05}s both`,
                      '@keyframes fadeIn': {
                        from: {
                          opacity: 0,
                          transform: 'translateY(10px)',
                        },
                        to: {
                          opacity: 1,
                          transform: 'translateY(0)',
                        },
                      },
                      '&:nth-of-type(even)': {
                        backgroundColor: 'rgba(255, 255, 255, 0.01)',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(76, 85, 242, 0.12)',
                        transform: 'translateX(4px)',
                        boxShadow: '0 4px 16px rgba(76, 85, 242, 0.2)',
                      },
                      '&:active': {
                        transform: 'translateX(2px) scale(0.99)',
                      },
                    }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <VideoIcon sx={{ fontSize: 20, color: '#4C55F2', opacity: 0.7 }} />
                        <Box>
                          <Typography
                            component="a"
                            href={`https://3speak.tv/watch?v=${job.metadata?.video_owner || job.owner}/${job.metadata?.video_permlink || job.permlink}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              display: 'block',
                              fontWeight: 600,
                              color: '#4C55F2',
                              fontSize: '0.875rem',
                              mb: 0.25,
                              textDecoration: 'none',
                              '&:hover': {
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            {job.metadata?.video_owner || job.owner}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              fontSize: '0.75rem',
                              display: 'block',
                            }}
                          >
                            {job.metadata?.video_permlink || job.permlink}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {job.encoderInfo ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: '11px',
                              background: 'linear-gradient(135deg, #4C55F2 0%, #6B00FF 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              color: '#fff',
                              boxShadow: '0 2px 12px rgba(76, 85, 242, 0.35)',
                            }}
                          >
                            {job.encoderInfo.nodeName.substring(0, 2).toUpperCase()}
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 0.25 }}>
                              {job.encoderInfo.nodeName}
                            </Typography>
                            {job.encoderInfo.hiveAccount && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                @{job.encoderInfo.hiveAccount}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {job.assigned_to ? job.assigned_to.substring(0, 20) + '...' : 'N/A'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, minWidth: '160px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.9rem',
                              color: progress >= 75 ? '#28DE89' : progress >= 50 ? '#4C55F2' : '#FFB444',
                            }}
                          >
                            {progress.toFixed(1)}%
                          </Typography>
                        </Box>
                        <Box sx={{ position: 'relative' }}>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                              height: 12,
                              borderRadius: 6,
                              backgroundColor: 'rgba(76, 85, 242, 0.1)',
                              border: '1px solid rgba(76, 85, 242, 0.15)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 6,
                                background:
                                  progress >= 75
                                    ? 'linear-gradient(90deg, #28DE89 0%, #20C77A 100%)'
                                    : progress >= 50
                                    ? 'linear-gradient(90deg, #4C55F2 0%, #6B00FF 100%)'
                                    : 'linear-gradient(90deg, #FFB444 0%, #FF9500 100%)',
                                boxShadow:
                                  progress >= 75
                                    ? '0 2px 8px rgba(40, 222, 137, 0.4)'
                                    : progress >= 50
                                    ? '0 2px 8px rgba(76, 85, 242, 0.4)'
                                    : '0 2px 8px rgba(255, 180, 68, 0.4)',
                                position: 'relative',
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  right: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: '25px',
                                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5))',
                                  animation: 'pulse 2s ease-in-out infinite',
                                  '@keyframes pulse': {
                                    '0%, 100%': { opacity: 0.3 },
                                    '50%': { opacity: 0.9 },
                                  },
                                },
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Chip
                        label={calculateETA()}
                        size="small"
                        icon={<ScheduleIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          backgroundColor: 'rgba(255, 180, 68, 0.15)',
                          color: '#FFB444',
                          border: '1px solid rgba(255, 180, 68, 0.35)',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem', fontWeight: 500 }}>
                        {job.assigned_date ? formatRelativeTime(job.assigned_date) : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                      <Chip
                        label={formatFileSize(job.input?.size || job.input_size || 0)}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(93, 197, 205, 0.15)',
                          color: '#5DC5CD',
                          border: '1px solid rgba(93, 197, 205, 0.35)',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={activeJobs.length}
            page={activePage}
            onPageChange={handleActivePageChange}
            rowsPerPage={activeRowsPerPage}
            onRowsPerPageChange={handleActiveRowsPerPageChange}
            rowsPerPageOptions={[10, 25, 50]}
            sx={{
              borderTop: '1px solid rgba(76, 85, 242, 0.1)',
              '.MuiTablePagination-toolbar': {
                color: 'text.secondary',
              },
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontSize: '0.875rem',
              },
            }}
          />
        </Box>
        )
      )}

      {/* Completed Jobs Tab */}
      {tabValue === 2 && (
        completedJobs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No completed jobs yet
            </Typography>
          </Box>
        ) : (
          <Box>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Video</TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Encoder</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Completed</TableCell>
                    <TableCell>Total Duration</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Encoding Time</TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Size</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedCompletedJobs.map((job) => {
                  const isForced = job.result?.message?.includes('Force processed');
                  const totalDur = job.totalDuration || 0;
                  const durColor = totalDur < 300 ? 'success' : totalDur < 1800 ? 'warning' : 'error';
                  
                  return (
                    <TableRow key={job.id}>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        <a
                          href={`https://3speak.tv/watch?v=${job.metadata?.video_owner || job.owner}/${job.metadata?.video_permlink || job.permlink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#4C55F2', textDecoration: 'none' }}
                        >
                          {job.metadata?.video_owner || job.owner}/{job.metadata?.video_permlink || job.permlink}
                        </a>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                        {job.encoderInfo && job.encoderInfo.hiveAccount ? (
                          <a
                            href={`https://ecency.com/@${job.encoderInfo.hiveAccount}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                          >
                            <Box
                              component="img"
                              src={`https://images.hive.blog/u/${job.encoderInfo.hiveAccount}/avatar/large`}
                              alt={job.encoderInfo.hiveAccount}
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '6px',
                                border: '1px solid rgba(76, 85, 242, 0.3)',
                                objectFit: 'cover',
                              }}
                              onError={(e: any) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '6px',
                                backgroundColor: 'rgba(76, 85, 242, 0.15)',
                                border: '1px solid rgba(76, 85, 242, 0.3)',
                                display: 'none',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                color: '#4C55F2',
                              }}
                            >
                              {job.encoderInfo.nodeName.substring(0, 2).toUpperCase()}
                            </Box>
                            <Typography variant="caption" sx={{ color: 'text.primary' }}>
                              {job.encoderInfo.nodeName}
                            </Typography>
                          </a>
                        ) : (
                          <Typography variant="caption">
                            {job.encoderInfo?.nodeName || (job.assigned_to ? job.assigned_to.substring(0, 20) + '...' : 'N/A')}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        {job.completed_at ? formatRelativeTime(job.completed_at) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={formatDuration(totalDur)} 
                          size="small" 
                          color={durColor}
                        />
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {job.encodingDuration ? formatDuration(job.encodingDuration) : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{formatFileSize(job.input?.size || job.input_size || 0)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={isForced ? 'Forced' : 'Success'} 
                          size="small" 
                          color={isForced ? 'warning' : 'success'}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={completedJobs.length}
            page={completedPage}
            onPageChange={handleCompletedPageChange}
            rowsPerPage={completedRowsPerPage}
            onRowsPerPageChange={handleCompletedRowsPerPageChange}
            rowsPerPageOptions={[10, 25, 50, 100]}
            sx={{
              borderTop: '1px solid rgba(76, 85, 242, 0.1)',
              '.MuiTablePagination-toolbar': {
                color: 'text.secondary',
              },
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                fontSize: '0.875rem',
              },
            }}
          />
        </Box>
        )
      )}

      {/* Job Details Drawer */}
      <JobDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        job={selectedJob}
      />
    </Box>
  );
}
