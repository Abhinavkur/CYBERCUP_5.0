import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';


export default function Login() {
  const [selectedRole, setSelectedRole] = useState('citizen');
  const [signingIn, setSigningIn] = useState(false);
  const { signInWithGoogle } = useAuth();

  const roles = [
    { id: 'citizen', label: 'Citizen' },
    { id: 'volunteer', label: 'Volunteer' },
    { id: 'ngo', label: 'NGO Worker' },
    { id: 'police', label: 'Police' }
  ];

  const handleSignIn = async () => {
    setSigningIn(true);
    await signInWithGoogle(selectedRole);
    setSigningIn(false);
  };

  
  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', alignItems: 'center', background: '#ffffff' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 3, md: 6 }} alignItems="center" justifyContent="center" sx={{ width: '100%', maxWidth: 1000, mx: 'auto', px: { xs: 2, md: 0 } }}>
          <Box component="img" src="/sos-login.png" alt="SOS" sx={{ width: { xs: 180, sm: 240, md: 300 }, height: 'auto' }} />

          <Card elevation={0} sx={{ width: { xs: '90%', md: 460 }, borderRadius: 2, border: '2px solid #000', background: '#ffffff' }}>
            <CardContent>
              <Stack spacing={3} alignItems="center">
                <Typography variant="h4" fontWeight={800} color="#000">Emergency SOS</Typography>

                <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight={600}>Select your role</Typography>
                  <RadioGroup
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    {roles.map((role) => (
                      <FormControlLabel
                        key={role.id}
                        value={role.id}
                        control={<Radio sx={{ '&.Mui-checked': { color: '#000' }, color: '#000' }} />}
                        label={role.label}
                        sx={{ mb: 0.5 }}
                      />
                    ))}
                  </RadioGroup>
                </Box>

                <Button
                  onClick={handleSignIn}
                  disabled={signingIn}
                  variant="contained"
                  size="large"
                  sx={{ px: 3, borderRadius: 2, background: '#000', color: '#fff', '&:hover': { background: '#111' } }}
                >
                  {signingIn ? 'Signing in…' : 'Sign in with Google'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Container>
  );
}
