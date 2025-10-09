import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';

export default function RoleSelector({ value, onChange, options }) {
  const roles = useMemo(() => options || [
    { id: 'citizen', label: 'Citizen' },
    { id: 'volunteer', label: 'Volunteer' },
    { id: 'ngo', label: 'NGO Worker' },
    { id: 'police', label: 'Police' },
  ], [options]);

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="subtitle1" gutterBottom fontWeight={600}>Select your role</Typography>
      <RadioGroup value={value} onChange={(e) => onChange?.(e.target.value)}>
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
  );
}



