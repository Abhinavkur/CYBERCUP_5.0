import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import SOSbutton from './SOSbutton';
import { useMyAlertsStream } from '../../hooks/useAlert';
import ChatPanel from '../shared/ChatPanel';

export default function CitizenDashboard() {
  const { alerts, loading } = useMyAlertsStream({ max: 25 });
  const [chatAlert, setChatAlert] = useState(null);

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <SOSbutton />
      </Box>


      <Card elevation={3}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={700}>Your recent SOS alerts</Typography>
            {loading && <CircularProgress size={20} />}
          </Stack>
          <Divider sx={{ my: 2 }} />

          {(!alerts || alerts.length === 0) && !loading && (
            <Typography variant="body2" color="text.secondary">No alerts yet. Press the SOS button to send one.</Typography>
          )}

          <Stack spacing={1.5}>
            {alerts?.map((a) => (
              <Stack key={a.id} direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ py: 0.5 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Chip size="small" label={(a.status || 'open').toUpperCase()} color={a.status === 'resolved' ? 'success' : a.status === 'claimed' ? 'warning' : 'default'} />
                  <Typography variant="body2">
                    {a.type || 'general'} · {a.location?.lat?.toFixed?.(4)}, {a.location?.lng?.toFixed?.(4)} {a.location?.lowAccuracy ? '(low accuracy)' : ''}
                  </Typography>
                </Stack>
                {a.status === 'claimed' && (
                  <Button variant="outlined" size="small" onClick={() => setChatAlert(a)}>Chat</Button>
                )}
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <ChatPanel alert={chatAlert} open={!!chatAlert} onClose={() => setChatAlert(null)} />
    </Stack>
  );
}






