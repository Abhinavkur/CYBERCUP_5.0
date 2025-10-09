import React from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MicIcon from '@mui/icons-material/Mic';
import MessageIcon from '@mui/icons-material/Message';
import { useAlertMessagesCount } from '../../hooks/useAlertMessagesCount';

export default function VoiceMessageIndicator({ alertId }) {
  const { messageCount, hasVoiceMessages, loading } = useAlertMessagesCount(alertId);

  if (loading || messageCount === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      {hasVoiceMessages && (
        <Chip
          icon={<MicIcon />}
          label="Voice"
          size="small"
          color="primary"
          variant="filled"
          sx={{ 
            fontSize: '0.7rem',
            height: 20,
            '& .MuiChip-icon': { fontSize: '0.8rem' }
          }}
        />
      )}
      <Chip
        icon={<MessageIcon />}
        label={messageCount}
        size="small"
        color="default"
        variant="outlined"
        sx={{ 
          fontSize: '0.7rem',
          height: 20,
          '& .MuiChip-icon': { fontSize: '0.8rem' }
        }}
      />
    </Box>
  );
}
