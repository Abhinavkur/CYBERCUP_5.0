import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

const GUIDES = {
  earthquake: [
    'Drop, cover, and hold on under sturdy furniture.',
    'Stay away from windows, shelves, and heavy objects.',
    'If outdoors, move to an open area away from buildings and power lines.',
    'After shaking stops, check for injuries and hazards like gas leaks.'
  ],
  flood: [
    'Move to higher ground immediately; avoid low-lying areas.',
    'Do not walk or drive through flood waters.',
    'Disconnect electrical appliances if safe to do so.',
    'Prepare to evacuate; keep important items and meds in a waterproof bag.'
  ],
  fire: [
    'Stay low under smoke; cover nose and mouth with a cloth.',
    'If clothing catches fire: Stop, Drop, and Roll.',
    'Use stairs, not elevators, when evacuating.',
    'Feel doors with the back of your hand before opening; if hot, use another route.'
  ],
  medical: [
    'Check responsiveness and breathing; call for help.',
    'Apply direct pressure to bleeding; elevate if possible.',
    'Do not move the person if a spinal injury is suspected.',
    'Note allergies/medications; keep the person warm and calm.'
  ],
  accident: [
    'Ensure scene safety before approaching.',
    'Turn off vehicle ignition if safe; use hazard lights.',
    'Do not move injured persons unless there is immediate danger.',
    'Apply basic first aid and wait for responders.'
  ],
  other: [
    'Move to a safe location.',
    'Avoid crowds and potential hazards.',
    'Keep your phone charged and accessible.',
    'Follow instructions from local authorities.'
  ]
};

export default function SurvivalGuide({ type = 'other', status }) {
  const tips = GUIDES[type] || GUIDES.other;
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            Survival guide — {type.charAt(0).toUpperCase() + type.slice(1)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Follow these steps while help is on the way.
          </Typography>
          <List dense sx={{ listStyleType: 'disc', pl: 3 }}>
            {tips.map((t, idx) => (
              <ListItem key={idx} sx={{ display: 'list-item', py: 0 }}>
                <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={t} />
              </ListItem>
            ))}
          </List>
          {status === 'success' && (
            <Typography variant="body2" color="success.main">
              Your SOS has been sent. Stay safe and follow the steps above.
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}



