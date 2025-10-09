import { useEffect, useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { useAlertMessages, useSendAlertMessage } from '../../hooks/useAlert';

export default function ChatPanel({ alert, open, onClose }) {
  const { messages, loading } = useAlertMessages(alert?.id);
  const { send, sending, error } = useSendAlertMessage(alert?.id);
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const onSend = async () => {
    const t = text.trim();
    if (!t) return;
    await send(t);
    setText('');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chat — {alert ? (alert.type || 'Alert') : 'Alert'}</DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Stack alignItems="center" sx={{ my: 2 }}>
            <CircularProgress size={22} />
          </Stack>
        )}
        {!loading && (!messages || messages.length === 0) && (
          <Typography variant="body2" color="text.secondary">No messages yet. Start the conversation.</Typography>
        )}
        <Stack spacing={1.2} sx={{ mt: 1 }}>
          {(messages || []).map((m) => (
            <Stack key={m.id} sx={{ p: 1.2, borderRadius: 1, bgcolor: '#f6f6f6' }}>
              <Typography variant="caption" color="text.secondary">
                {m.sender?.name || m.sender?.email || 'Unknown'}
              </Typography>
              <Typography variant="body2">{m.text}</Typography>
            </Stack>
          ))}
          <div ref={endRef} />
        </Stack>
        {error && (
          <Typography variant="caption" color="error">Failed to send: {error.message || 'Unknown error'}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />
        <Button onClick={onSend} disabled={sending || !text.trim()} variant="contained">Send</Button>
      </DialogActions>
    </Dialog>
  );
}



