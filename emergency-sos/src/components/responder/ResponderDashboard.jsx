import { useMemo, useState, useCallback } from 'react';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import { formatDistanceToNowStrict } from 'date-fns';
import { useAlertsStream, useClaimAlert, useResolveAlert, useMyClaimsStream } from '../../hooks/useAlert';
import AlertMap from './AlertMap';
import ChatPanel from '../shared/ChatPanel';
import VoiceMessageIndicator from './VoiceMessageIndicator';
import VoiceDemoResponder from './VoiceDemoResponder';

function formatTimestamp(ts) {
  try {
    const millis = ts?.toMillis ? ts.toMillis() : (typeof ts === 'number' ? ts : null);
    if (!millis) return null;
    return formatDistanceToNowStrict(new Date(millis), { addSuffix: true });
  } catch {
    return null;
  }
}

export default function ResponderDashboard() {
  const { alerts, loading, error } = useAlertsStream({ max: 100 });
  const { claim, loading: claiming, error: claimError } = useClaimAlert();
  const { resolve, loading: resolving } = useResolveAlert();
  const { claims, loading: loadingClaims } = useMyClaimsStream({ max: 100 });

  const [hiddenOpenIds, setHiddenOpenIds] = useState([]);
  const [chatAlert, setChatAlert] = useState(null);
  const myClaimIds = useMemo(() => new Set((claims || []).map((c) => c.id)), [claims]);
  const openAlerts = useMemo(() => (
    (alerts || [])
      .filter((a) => (
        (a?.status === 'open') &&
        !a?.claimedBy &&
        !hiddenOpenIds.includes(a.id) &&
        !myClaimIds.has(a.id)
      ))
  ), [alerts, hiddenOpenIds, myClaimIds]);
  const myClaims = useMemo(() => claims || [], [claims]);
  const busy = claiming || resolving;


  const handleClaim = useCallback(async (alertId) => {
    // Optimistically hide from open list
    setHiddenOpenIds((prev) => (prev.includes(alertId) ? prev : [...prev, alertId]));
    try {
      await claim(alertId);
    } catch (e) {
      // On error, unhide
      setHiddenOpenIds((prev) => prev.filter((id) => id !== alertId));
    }
  }, [claim]);

  return (
    <Stack spacing={2}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h6" fontWeight={700}>Map</Typography>
          <Divider sx={{ my: 2 }} />
          <AlertMap openAlerts={openAlerts} claimedAlerts={myClaims} height={360} />
        </CardContent>
      </Card>


      {/* My Claimed Alerts */}
      <Card elevation={3}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>My claimed alerts</Typography>
            {(loadingClaims || resolving) && <CircularProgress size={18} />}
          </Stack>
          <Divider sx={{ my: 2 }} />
          {(!myClaims || myClaims.length === 0) && !loadingClaims && (
            <Typography variant="body2" color="text.secondary">No claimed alerts yet.</Typography>
          )}
          {claimError && (
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              Failed to claim alert: {claimError.message || 'Unknown error'}
            </Typography>
          )}
          <Stack spacing={1.5}>
            {myClaims.map((a) => (
              <Card key={a.id} variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={700}>{(a.type || 'general').toUpperCase()}</Typography>
                        <Chip size="small" label={(a.status || 'claimed').toUpperCase()} color={a.status === 'resolved' ? 'success' : a.status === 'claimed' ? 'warning' : 'default'} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {a.location?.lat?.toFixed?.(4)}, {a.location?.lng?.toFixed?.(4)} {a.location?.lowAccuracy ? '(low accuracy)' : ''}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          Claimed {formatTimestamp(a.claimedAt)}
                        </Typography>
                        <VoiceMessageIndicator alertId={a.id} />
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" onClick={() => setChatAlert(a)}>Chat</Button>
                      {a.status === 'claimed' && (
                        <Button disabled={busy} variant="contained" color="success" onClick={() => resolve(a.id)}>Resolve</Button>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={3}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>Open alerts</Typography>
            {loading && <CircularProgress size={18} />}
          </Stack>
          <Divider sx={{ my: 2 }} />
          {/*error && (
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              Failed to load alerts: {error?.message || 'Unknown error'}
            </Typography>
          )*/}

          {(!openAlerts || openAlerts.length === 0) && !loading && (
            <Typography variant="body2" color="text.secondary">No open alerts.</Typography>
          )}

          <Stack spacing={1.5}>
            {openAlerts.map((a) => (
              <Card key={a.id} variant="outlined">
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={700}>{(a.type || 'general').toUpperCase()}</Typography>
                        <Chip size="small" label={(a.status || 'open').toUpperCase()} color={a.status === 'resolved' ? 'success' : a.status === 'claimed' ? 'warning' : 'default'} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {a.location?.lat?.toFixed?.(4)}, {a.location?.lng?.toFixed?.(4)} {a.location?.lowAccuracy ? '(low accuracy)' : ''}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(a.createdAt)}
                        </Typography>
                        <VoiceMessageIndicator alertId={a.id} />
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" onClick={() => setChatAlert(a)}>Chat</Button>
                      <Button variant="outlined" component="a" href={`https://www.google.com/maps/dir/?api=1&destination=${a.location?.lat},${a.location?.lng}`} target="_blank" rel="noreferrer">Directions</Button>
                      {a.status === 'open' && (
                        <Button disabled={busy} variant="contained" onClick={() => handleClaim(a.id)}>Claim</Button>
                      )}
                      {a.status === 'claimed' && (
                        <Button disabled={busy} variant="contained" color="success" onClick={() => resolve(a.id)}>Resolve</Button>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </CardContent>
      </Card>
      
      <VoiceDemoResponder />
      
      <ChatPanel alert={chatAlert} open={!!chatAlert} onClose={() => setChatAlert(null)} />
    </Stack>
  );
}


