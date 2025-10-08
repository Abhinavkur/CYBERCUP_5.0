import { useAuth } from './hooks/useAuth';
import Login from './components/shared/login';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

function App() {
  const { user, userRole, loading, logout } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Login />;

  return (
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
            <Button variant="contained" color="error" onClick={logout}>
              Logout
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default App;
