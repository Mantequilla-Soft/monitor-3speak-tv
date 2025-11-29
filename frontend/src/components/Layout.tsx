import { ReactNode } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Work as WorkIcon,
  Computer as ComputerIcon,
  Analytics as AnalyticsIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ThreeSpeakLogo } from './ThreeSpeakLogo';

interface LayoutProps {
  children: ReactNode;
}

const drawerWidth = 240;

const navigationItems = [
  { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/jobs', label: 'Jobs', icon: <WorkIcon /> },
  { path: '/encoders', label: 'Encoders', icon: <ComputerIcon /> },
  { path: '/analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
];

export function Layout({ children }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: { xs: 2.5, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: { xs: 75, sm: 85 },
          borderBottom: '1px solid rgba(76, 85, 242, 0.1)',
          background: 'linear-gradient(180deg, rgba(76, 85, 242, 0.05) 0%, transparent 100%)',
        }}
      >
        <ThreeSpeakLogo size={{ xs: 32, sm: 40 }} showText={true} />
      </Box>

      {/* Section Header */}
      <Box sx={{ px: 2.5, pt: 3, pb: 1.5 }}>
        <Typography
          variant="overline"
          sx={{
            color: 'rgba(234, 240, 255, 0.5)',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Navigation
        </Typography>
      </Box>

      {/* Navigation Items */}
      <List sx={{ px: 2, flex: 1, overflow: 'auto' }}>
        {navigationItems.map((item, index) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={() => setMobileOpen(false)}
              sx={{
                py: 1.25,
                px: 2,
                animation: `fadeInLeft 0.3s ease-out ${index * 0.1}s backwards`,
                '@keyframes fadeInLeft': {
                  from: {
                    opacity: 0,
                    transform: 'translateX(-10px)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateX(0)',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: location.pathname === item.path ? '#fff' : 'rgba(76, 85, 242, 0.8)',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  sx: {
                    fontWeight: location.pathname === item.path ? 700 : 600,
                    fontSize: '0.95rem',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Footer Section */}
      <Box
        sx={{
          p: 2.5,
          borderTop: '1px solid rgba(76, 85, 242, 0.1)',
          background: 'linear-gradient(0deg, rgba(76, 85, 242, 0.05) 0%, transparent 100%)',
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            background: 'rgba(76, 85, 242, 0.1)',
            border: '1px solid rgba(76, 85, 242, 0.2)',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(234, 240, 255, 0.7)',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'block',
              mb: 0.5,
            }}
          >
            🎬 3Speak
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(234, 240, 255, 0.5)',
              fontSize: '0.7rem',
              display: 'block',
            }}
          >
            Encoding Infrastructure
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            3Speak Encoding Infrastructure
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        <Container maxWidth={false} sx={{ px: { xs: 0, sm: 2 } }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}