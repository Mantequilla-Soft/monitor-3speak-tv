import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { 
  CheckCircle as OnlineIcon,
  Error as OfflineIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';

interface GatewayHealthStatus {
  isOnline: boolean;
  responseTime: number;
  lastCheck: string;
  error?: string;
  stats?: any;
  statusCode?: number;
  gatewayUrl?: string;
}

export function GatewayHealth() {
  const [healthStatus, setHealthStatus] = useState<GatewayHealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch basic health status
  const fetchHealthStatus = async () => {
    try {
      setError(null);
      const response = await fetch('/api/statistics/gateway-health');
      const result = await response.json();
      
      if (result.success) {
        setHealthStatus(result.data);
        setLastUpdate(new Date());
      } else {
        setError(result.error || 'Failed to fetch gateway health');
      }
    } catch (err) {
      setError('Network error fetching gateway health');
      console.error('Gateway health fetch error:', err);
    }
  };

  // Auto-refresh health status
  useEffect(() => {
    fetchHealthStatus();
    const interval = setInterval(fetchHealthStatus, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (isOnline: boolean) => isOnline ? 'success' : 'error';
  const getStatusIcon = (isOnline: boolean) => isOnline ? <OnlineIcon /> : <OfflineIcon />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
          Gateway Health Monitor
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Basic Health Status */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
                Gateway Status
              </Typography>
              
              {healthStatus ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getStatusIcon(healthStatus.isOnline)}
                    <Chip
                      label={healthStatus.isOnline ? 'Online' : 'Offline'}
                      color={getStatusColor(healthStatus.isOnline)}
                      sx={{ ml: 1 }}
                    />
                  </Box>

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Gateway URL: {healthStatus.gatewayUrl || 'Unknown'}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SpeedIcon sx={{ mr: 1, fontSize: 'small' }} />
                    <Typography variant="body2">
                      Response Time: {healthStatus.responseTime}ms
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="textSecondary">
                    Last Check: {new Date(healthStatus.lastCheck).toLocaleString()}
                  </Typography>

                  {healthStatus.error && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      {healthStatus.error}
                    </Alert>
                  )}

                  {healthStatus.stats && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Gateway Stats:
                      </Typography>
                      <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>
                        {JSON.stringify(healthStatus.stats, null, 2)}
                      </pre>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Monitoring Information - 2 Cards */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom sx={{ mb: 2, textAlign: 'center', fontWeight: 700 }}>
            Monitoring Information
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ background: 'rgba(76,85,242,0.06)', borderRadius: 0 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">Auto Refresh</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Every 30s</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ background: 'rgba(255,180,68,0.06)', borderRadius: 0 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="textSecondary">WebSocket</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Real-time</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}