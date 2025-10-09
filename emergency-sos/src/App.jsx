import { useAuth } from './hooks/useAuth';
import Login from './components/shared/login';
import SOSbutton from './components/citizen/SOSbutton';
import CitizenDashboard from './components/citizen/CitizenDashboard';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import ResponderDashboard from './components/responder/ResponderDashboard';
import VoiceStatusIndicator from './components/shared/VoiceStatusIndicator';

function App() {
  const { user, userRole, loading, logout } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Login />;

  return (
    <>
      <VoiceStatusIndicator />
      <Container maxWidth="sm">
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card elevation={4} sx={{ width: '100%', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Welcome, {user.displayName}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Assigned role: <b style={{ textTransform: 'capitalize' }}>{userRole || 'not assigned'}</b>
              </Typography>

              {userRole === 'citizen' && (
                <Box sx={{ my: 1 }}>
                  <CitizenDashboard />
                </Box>
              )}

              {(userRole === 'volunteer' || userRole === 'ngo' || userRole === 'police') && (
                <Box sx={{ my: 1 }}>
                  <ResponderDashboard />
                </Box>
              )}

              <Button variant="contained" color="error" onClick={logout}>
                Logout
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </>
  );
}

export default App;
