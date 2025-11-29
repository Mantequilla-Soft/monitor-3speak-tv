import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TablePagination,
} from '@mui/material';
import {
  VideoLibrary,
  PlayCircleOutline,
  Computer,
  TrendingUp,
  Refresh as RefreshIcon,
  AccountCircle,
} from '@mui/icons-material';
import { WorkloadGauge, WorkloadData } from '../components/WorkloadGauge';
import { GatewayHealthLED, GatewayHealthStatus } from '../components/GatewayHealthLED';
import { MetricCard, SystemStatusStrip } from '../components';

interface EncoderInfo {
  nodeName: string;
  hiveAccount?: string;
  didKey: string;
}

interface RecentJob {
  id: string;
  fullId: string;
  status: string;
  videoOwner: string;
  videoPermlink: string;
  videoSize: number;
  videoSizeFormatted: string;
  createdAt: string;
  createdAgo: string;
  assignedTo?: string;
  encoderInfo?: EncoderInfo;
  progress?: number;
}

interface DashboardData {
  availableJobs: number;
  jobsInProgress: number;
  activeEncoders: number;
  jobsCompletedToday: number;
  recentJobs: RecentJob[];
  workload: WorkloadData;
  gatewayHealth: GatewayHealthStatus;
}

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    availableJobs: 0,
    jobsInProgress: 0,
    activeEncoders: 0,
    jobsCompletedToday: 0,
    recentJobs: [],
    workload: {
      ratio: 0,
      zone: 'green',
      activeJobs: 0,
      activeEncoders: 0,
      oldJobsDetected: false
    },
    gatewayHealth: 'healthy'
  });
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Paginated jobs
  const paginatedJobs = dashboardData.recentJobs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);

      // Fetch dashboard data from the new endpoint
      const response = await fetch('/api/statistics/dashboard');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }

      const data = result.data;
      setDashboardData({
        availableJobs: data.availableJobs || 0,
        jobsInProgress: data.jobsInProgress || 0,
        activeEncoders: data.activeEncoders || 0,
        jobsCompletedToday: data.jobsCompletedToday || 0,
        recentJobs: data.recentJobs || [],
        workload: data.workload || {
          ratio: 0,
          zone: 'green',
          activeJobs: 0,
          activeEncoders: 0,
          oldJobsDetected: false
        },
        gatewayHealth: data.gatewayHealth || 'healthy'
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up polling every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Modern Header with Gradient Bar */}
      <Box
        sx={{
          mb: 4,
          p: { xs: 2.5, sm: 3 },
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #2A3BAE 0%, #6B00FF 100%)',
          boxShadow: '0 8px 32px rgba(42, 59, 174, 0.3)',
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
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                color: '#fff',
                mb: 0.5,
                letterSpacing: '-0.02em',
              }}
            >
              Gateway Monitor
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '0.95rem',
                fontWeight: 500,
              }}
            >
              Encoding Infrastructure — Real-time Status
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Refresh Button */}
            <IconButton
              onClick={fetchDashboardData}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                },
              }}
            >
              <RefreshIcon />
            </IconButton>

            {/* Profile Icon */}
            <IconButton
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.25)',
                },
              }}
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Box>

        {/* Gauges Row */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
          <WorkloadGauge data={dashboardData.workload} size={160} />
          <GatewayHealthLED status={dashboardData.gatewayHealth} size={160} />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Modern Metrics Cards with Sparklines */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Available Jobs"
            value={dashboardData.availableJobs}
            icon={<VideoLibrary />}
            color="primary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Jobs in Progress"
            value={dashboardData.jobsInProgress}
            icon={<PlayCircleOutline />}
            color="error"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Encoders"
            value={dashboardData.activeEncoders}
            icon={<Computer />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Jobs Today"
            value={dashboardData.jobsCompletedToday}
            icon={<TrendingUp />}
            color="info"
          />
        </Grid>

        {/* Recent Jobs Table - Full Width */}
        <Grid item xs={12}>
          <Card
            sx={{
              animation: 'fadeInUp 0.6s ease-out 0.2s backwards',
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
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  mb: 3,
                }}
              >
                Recent Jobs
              </Typography>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Job ID</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Video</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Size</TableCell>
                      <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Encoder</TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedJobs.map((job) => (
                      <TableRow
                        key={job.id}
                        sx={{
                          cursor: 'pointer',
                        }}
                      >
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'text.secondary' }}>
                            {job.fullId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={job.status}
                            size="small"
                            color={
                              job.status === 'complete' ? 'success' :
                              job.status === 'running' ? 'primary' :
                              job.status === 'unassigned' ? 'warning' : 'default'
                            }
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, fontWeight: 500 }}>
                            <a
                              href={`https://3speak.tv/watch?v=${job.videoOwner}/${job.videoPermlink}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#4C55F2', textDecoration: 'none' }}
                            >
                              {job.videoOwner}/{job.videoPermlink}
                            </a>
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                            {job.videoSizeFormatted}
                          </Typography>
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
                                  width: 32,
                                  height: 32,
                                  borderRadius: '8px',
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
                                  width: 32,
                                  height: 32,
                                  borderRadius: '8px',
                                  backgroundColor: 'rgba(76, 85, 242, 0.15)',
                                  border: '1px solid rgba(76, 85, 242, 0.3)',
                                  display: 'none',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  color: '#4C55F2',
                                }}
                              >
                                {job.encoderInfo.nodeName.substring(0, 2).toUpperCase()}
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.primary' }}>
                                  {job.encoderInfo.nodeName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                  @{job.encoderInfo.hiveAccount}
                                </Typography>
                              </Box>
                            </a>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              {job.assignedTo ? 'Unknown Encoder' : 'Unassigned'}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                            {job.createdAgo}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={dashboardData.recentJobs.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
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
            </CardContent>
          </Card>
        </Grid>

        {/* System Status Strip - Horizontal Layout */}
        <Grid item xs={12}>
          <Box
            sx={{
              animation: 'fadeInUp 0.6s ease-out 0.3s backwards',
            }}
          >
            <SystemStatusStrip
              systems={[
                { name: 'Gateway API', status: 'connected' },
                { name: 'MongoDB', status: 'connected' },
                { name: 'WebSocket', status: 'connected' },
              ]}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}