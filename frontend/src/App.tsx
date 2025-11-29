import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { Layout } from './components';
import { Dashboard, Jobs, Encoders, Analytics } from './pages';

function App() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default',
        position: 'relative',
      }}
    >
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/encoders" element={<Encoders />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
    </Box>
  );
}

export default App;