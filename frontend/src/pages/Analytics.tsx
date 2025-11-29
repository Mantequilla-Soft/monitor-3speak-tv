import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Refresh as RefreshIcon, Close as CloseIcon } from '@mui/icons-material';
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import { GatewayHealth } from '../components/GatewayHealth';

interface DailyStatistics {
  date: string;
  videos_encoded: number;
  by_encoder: Record<string, number>;
  by_quality: Record<string, number>;
  average_encoding_time: number;
  success_rate: number;
  total_encoding_time: number;
}

interface EncoderStats {
  encoder_id: string;
  encoder_name?: string;
  jobs_completed: number;
  average_encoding_time: number;
  total_encoding_time: number;
  success_rate: number;
}

interface EncoderRegistry {
  did_key: string;
  node_name: string;
  hive_account?: string;
  is_active: boolean;
}

interface EncoderJobRow {
  id: string;
  videoOwner: string;
  videoPermlink: string;
  status: string;
  createdAt?: string | Date;
  completedAt?: string | Date;
  encodingTime?: number;
  videoSize?: number;
  quality?: string;
}

interface HiveRanking {
  username: string;
  total_videos: number;
  avg_time?: number;
  success_rate?: number; // 0-1
}

const QUALITY_COLORS: Record<string, string> = {
  '240p': '#8884d8',
  '360p': '#7aaef7',
  '480p': '#82ca9d',
  '720p': '#ffc658',
  '1080p': '#ff8042',
  'hls': '#4fc3f7',
  'source': '#0088fe',
};

export function Analytics() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [dailyStats, setDailyStats] = useState<DailyStatistics[]>([]);
  const [encoderStats, setEncoderStats] = useState<EncoderStats[]>([]);
  const [completedJobsData, setCompletedJobsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(30);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Hive rankings
  const [hiveRankings, setHiveRankings] = useState<HiveRanking[]>([]);

  // Encoder jobs dialog state
  const [jobsOpen, setJobsOpen] = useState(false);
  const [selectedEncoderId, setSelectedEncoderId] = useState<string | null>(null);
  const [selectedEncoderName, setSelectedEncoderName] = useState<string>('');
  const [encoderJobs, setEncoderJobs] = useState<EncoderJobRow[]>([]);
  const [encoderJobsTotal, setEncoderJobsTotal] = useState(0);
  const [encoderJobsLoading, setEncoderJobsLoading] = useState(false);
  const [encoderJobsError, setEncoderJobsError] = useState<string | null>(null);
  const [jobsOffset, setJobsOffset] = useState(0);
  const JOBS_PAGE_SIZE = 20;

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate date range for filtering
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - timeRange);
      
      const [dailyResponse, encoderResponse, completedJobsResponse, hiveResponse] = await Promise.all([
        fetch(`/api/statistics/daily?days=${timeRange}`),
        fetch(`/api/statistics/encoders?days=${timeRange}`),
        fetch('/api/jobs/completed?limit=10000').catch(() => new Response(JSON.stringify({ success: false }))),
        // Optional endpoint; ignore failure gracefully
        fetch(`/api/statistics/hive-accounts?days=${timeRange}`).catch(() => new Response(JSON.stringify({ success: false }))),
      ]);

      const dailyData = await dailyResponse.json();
      const encoderData = await encoderResponse.json();
      let completedJobsData: any = {};
      try {
        completedJobsData = await completedJobsResponse.json();
      } catch (e) {
        console.log('Completed jobs not available');
      }
      let hiveData: any = {};
      try { 
        hiveData = await hiveResponse.json(); 
      } catch (e) {
        console.log('Hive rankings endpoint not available');
      }

      if (dailyData.success) {
        setDailyStats(dailyData.data);
      }

      if (encoderData.success) {
        console.log(`Encoder stats for last ${timeRange} days:`, encoderData.data);
        setEncoderStats(encoderData.data);
      } else {
        console.error('Failed to fetch encoder stats:', encoderData);
      }

      if (completedJobsData && completedJobsData.success && Array.isArray(completedJobsData.data)) {
        // Filter jobs by time range
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - timeRange);
        const filteredJobs = completedJobsData.data.filter((job: any) => {
          const completedDate = job.completed_at ? new Date(job.completed_at) : null;
          return completedDate && completedDate >= cutoffDate;
        });
        console.log(`Filtered ${filteredJobs.length} completed jobs from last ${timeRange} days`);
        setCompletedJobsData(filteredJobs);
      } else {
        setCompletedJobsData([]);
      }

      if (hiveData && hiveData.success && Array.isArray(hiveData.data)) {
        setHiveRankings(hiveData.data as HiveRanking[]);
      } else {
        setHiveRankings([]);
      }

      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEncoderJobs = async (encoderId: string, offset = 0) => {
    try {
      setEncoderJobsLoading(true);
      setEncoderJobsError(null);
      const res = await fetch(`/api/statistics/encoder-jobs/${encodeURIComponent(encoderId)}?limit=${JOBS_PAGE_SIZE}&offset=${offset}`);
      const data = await res.json();
      if (data.success) {
        if (offset === 0) {
          setEncoderJobs(data.data.jobs);
        } else {
          setEncoderJobs(prev => [...prev, ...data.data.jobs]);
        }
        setEncoderJobsTotal(data.data.total || 0);
        setJobsOffset(offset);
      } else {
        setEncoderJobsError(data.error || 'Failed to load encoder jobs');
      }
    } catch (e) {
      setEncoderJobsError('Failed to load encoder jobs');
      console.error(e);
    } finally {
      setEncoderJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  // Calculate KPIs
  const totalVideos = dailyStats.reduce((sum, day) => sum + day.videos_encoded, 0);
  const avgEncodingTime = dailyStats.length > 0
    ? Math.round(dailyStats.reduce((sum, day) => sum + day.average_encoding_time, 0) / dailyStats.length)
    : 0;
  const totalEncodingHours = Math.round(
    dailyStats.reduce((sum, day) => sum + day.total_encoding_time, 0) / 3600
  );
  const avgSuccessRate = dailyStats.length > 0
    ? (dailyStats.reduce((sum, day) => sum + day.success_rate, 0) / dailyStats.length * 100).toFixed(1)
    : '0.0';

  const activeEncodersCount = encoderStats.filter(e => (e.jobs_completed || 0) > 0).length;

  // Prepare quality distribution data
  const qualityDistribution: Record<string, number> = {};
  dailyStats.forEach(day => {
    Object.entries(day.by_quality).forEach(([quality, count]) => {
      qualityDistribution[quality] = (qualityDistribution[quality] || 0) + count;
    });
  });

  const qualityChartData = Object.entries(qualityDistribution).map(([quality, count]) => ({
    name: quality,
    value: count,
  }));

  // Format daily stats for line chart
  const dailyChartData = [...dailyStats].reverse().map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    videos: day.videos_encoded,
    avgTime: Math.round(day.average_encoding_time / 60), // Convert to minutes
  }));

  const Sparkline = ({ data, color }: { data: any[]; color: string }) => (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="videos" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );

  // Format encoder stats for bar chart
  const encoderChartData = encoderStats
    .sort((a, b) => b.jobs_completed - a.jobs_completed)
    .slice(0, 10)
    .map(encoder => ({
      id: encoder.encoder_id,
      name: encoder.encoder_name || encoder.encoder_id.substring(0, 12),
      jobs: encoder.jobs_completed,
      avgTime: Math.round(encoder.average_encoding_time / 60), // Convert to minutes
    }));

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        mb: 3,
        gap: 2
      }}>
        <Typography variant="h4" sx={{ mb: { xs: 1, sm: 0 }, fontWeight: 800 }}>
          Analytics & Insights
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 2 }, 
          alignItems: { xs: 'stretch', sm: 'center' },
        }}>
          {lastUpdated && !isMobile && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {formatRelativeTime(lastUpdated)}
            </Typography>
          )}
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(_, value) => value && setTimeRange(value)}
            size="small"
            sx={{ 
              justifyContent: { xs: 'center', sm: 'flex-start' },
              background: 'rgba(76,85,242,0.08)',
              borderRadius: '999px',
              p: '3px',
              '.MuiToggleButton-root': {
                border: 'none',
                color: 'rgba(255,255,255,0.8)'
              },
              '.Mui-selected': {
                background: 'linear-gradient(135deg, #2A3BAE, #6B00FF)',
                color: '#fff',
                boxShadow: '0 0 0 3px rgba(107,0,255,0.25) inset',
              }
            }}
          >
            <ToggleButton value={7}>7D</ToggleButton>
            <ToggleButton value={30}>30D</ToggleButton>
            <ToggleButton value={90}>90D</ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAnalytics}
            disabled={loading}
            fullWidth={isMobile}
            sx={{
              borderColor: 'rgba(255,255,255,0.25)',
              ':hover': { borderColor: '#6B00FF', boxShadow: '0 0 0 3px rgba(107,0,255,0.25)' }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Gateway Health Monitor */}
      <GatewayHealth />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* KPI Cards */}
          <Grid container spacing={2} sx={{ mt: 2, mb: 4 }}>
            <Grid item xs={12} sm={6} md={12/5}>
              <Card sx={{ p: 1.5, background: 'rgba(76,85,242,0.06)', borderRadius: 3 }}>
                <CardContent>
                  <Typography color="textSecondary" variant="caption">Total Videos (last {timeRange}d)</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{totalVideos.toLocaleString()}</Typography>
                  <Sparkline data={dailyChartData} color="#6B00FF" />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={12/5}>
              <Card sx={{ p: 1.5, background: 'rgba(255,180,68,0.08)', borderRadius: 3 }}>
                <CardContent>
                  <Typography color="textSecondary" variant="caption">Avg Encoding Time</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{Math.round(avgEncodingTime / 60)}m</Typography>
                  <Sparkline data={dailyChartData} color="#FFB444" />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={12/5}>
              <Card sx={{ p: 1.5, background: 'rgba(40,222,137,0.06)', borderRadius: 3 }}>
                <CardContent>
                  <Typography color="textSecondary" variant="caption">Success Rate</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main' }}>{avgSuccessRate}%</Typography>
                  <Sparkline data={dailyChartData} color="#28DE89" />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={12/5}>
              <Card sx={{ p: 1.5, background: 'rgba(111, 134, 214, 0.08)', borderRadius: 3 }}>
                <CardContent>
                  <Typography color="textSecondary" variant="caption">Total Encoding Time</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{totalEncodingHours}h</Typography>
                  <Sparkline data={dailyChartData} color="#4C55F2" />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={12/5}>
              <Card sx={{ p: 1.5, background: 'rgba(107,0,255,0.08)', borderRadius: 3 }}>
                <CardContent>
                  <Typography color="textSecondary" variant="caption">Active Encoders</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{activeEncodersCount}</Typography>
                  <Sparkline data={encoderChartData.map(e=>({ videos:e.jobs, date:e.name }))} color="#6B00FF" />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Encoders List */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', fontWeight: 700, mb: 3 }}>All Encoders</Typography>
            <Paper sx={{ p: 3 }}>
              {encoderStats && encoderStats.length > 0 ? (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Encoder Node</TableCell>
                      <TableCell>Hive Account</TableCell>
                      <TableCell>Jobs Completed</TableCell>
                      <TableCell>Success Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {encoderStats.map((encoder) => {
                      // Find encoder info from completed jobs
                      const jobWithEncoder = completedJobsData.find((job: any) => 
                        job.assigned_to === encoder.encoder_id || job.encoderInfo?.didKey === encoder.encoder_id
                      );
                      const encoderInfo = jobWithEncoder?.encoderInfo;
                      const nodeName = encoderInfo?.nodeName || encoder.encoder_name || encoder.encoder_id.substring(0, 20) + '...';
                      const hiveAccount = encoderInfo?.hiveAccount;
                      
                      return (
                      <TableRow key={encoder.encoder_id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {nodeName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {hiveAccount ? (
                            <a
                              href={`https://ecency.com/@${hiveAccount}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                              <Box
                                component="img"
                                src={`https://images.hive.blog/u/${hiveAccount}/avatar/large`}
                                alt={hiveAccount}
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
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  color: '#4C55F2',
                                }}
                              >
                                {hiveAccount.substring(0, 2).toUpperCase()}
                              </Box>
                              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                @{hiveAccount}
                              </Typography>
                            </a>
                          ) : (
                            <Typography variant="body2" color="text.secondary">N/A</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip label={encoder.jobs_completed} size="small" sx={{ background: 'rgba(76,85,242,0.15)', fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${(encoder.success_rate * 100).toFixed(1)}%`} 
                            size="small" 
                            color={encoder.success_rate >= 0.95 ? 'success' : encoder.success_rate >= 0.8 ? 'warning' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    )})}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">No encoder data available for the last {timeRange} days.</Typography>
              )}
            </Paper>
          </Box>

        </>
      )}

      {/* Encoder Jobs Dialog - on demand */}
      <Dialog open={jobsOpen} onClose={() => setJobsOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Jobs by Encoder — {selectedEncoderName}
          <IconButton onClick={() => setJobsOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {encoderJobsError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setEncoderJobsError(null)}>
              {encoderJobsError}
            </Alert>
          )}
          <Table size={isMobile ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                <TableCell>Job ID</TableCell>
                <TableCell>Video</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Status</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Created</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Completed</TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Quality</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {encoderJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{String(job.id).slice(0, 8)}...</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {job.videoOwner}/{job.videoPermlink}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    <Chip size="small" label={job.status} color={job.status === 'complete' || job.status === 'completed' ? 'success' : job.status === 'failed' ? 'error' : 'default'} />
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {job.createdAt ? new Date(job.createdAt).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    {job.completedAt ? new Date(job.completedAt).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{job.quality || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {encoderJobsLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Typography variant="caption" sx={{ flexGrow: 1, pl: 2 }}>
            Showing {encoderJobs.length} of {encoderJobsTotal}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => selectedEncoderId && fetchEncoderJobs(selectedEncoderId, jobsOffset + JOBS_PAGE_SIZE)}
            disabled={encoderJobsLoading || encoderJobs.length >= encoderJobsTotal}
          >
            {encoderJobs.length >= encoderJobsTotal ? 'No more' : 'Load more'}
          </Button>
          <Button variant="contained" onClick={() => setJobsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
