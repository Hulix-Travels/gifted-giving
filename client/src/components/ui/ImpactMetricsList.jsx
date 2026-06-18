import { Box, Grid, Typography } from '@mui/material';
import ImpactMetricIcon, { getImpactMetricItems } from './ImpactMetricIcon';

export default function ImpactMetricsList({
  impact,
  emptyMessage = 'Impact will be calculated based on your donation amount'
}) {
  const items = getImpactMetricItems(impact);

  if (!items.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <Grid container spacing={1}>
      {items.map((item) => (
        <Grid size={6} key={item.type}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ImpactMetricIcon type={item.type} />
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {item.text}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}
