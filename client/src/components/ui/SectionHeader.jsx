import React from 'react';
import { Box, Typography } from '@mui/material';
import { sectionSubtitleSx, sectionTitleSx } from '../../theme/styles';

export default function SectionHeader({ title, subtitle, id }) {
  return (
    <Box component="header" id={id} sx={{ mb: subtitle ? 0 : 4 }}>
      <Typography variant="h2" component="h2" sx={sectionTitleSx}>
        {title}
      </Typography>
      {subtitle && (
        <Typography component="p" sx={sectionSubtitleSx}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
