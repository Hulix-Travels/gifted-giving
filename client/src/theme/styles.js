/** Shared layout + card styles for public pages */
import { typeScale } from './typography';

export const sectionPadding = { py: { xs: 8, md: 11 } };

export const sectionSurface = {
  ...sectionPadding,
  backgroundColor: 'var(--cream)'
};

export const sectionWhite = {
  ...sectionPadding,
  backgroundColor: 'var(--white)'
};

export const siteCard = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'var(--white)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden',
  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
  '&:hover': {
    boxShadow: 'var(--shadow-md)',
    borderColor: 'var(--accent-green)'
  }
};

export const sectionTitleSx = {
  fontFamily: 'var(--font-heading)',
  fontWeight: 600,
  color: 'var(--primary-green)',
  textAlign: 'center',
  mb: 1.5,
  fontSize: typeScale.sectionTitle,
  lineHeight: 1.25
};

export const sectionSubtitleSx = {
  textAlign: 'center',
  color: 'var(--gray)',
  maxWidth: 560,
  mx: 'auto',
  fontSize: typeScale.sectionSubtitle,
  lineHeight: 1.6,
  mb: 6
};

export const panelCard = {
  backgroundColor: 'var(--white)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-sm)'
};

export const fieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'var(--white)'
  }
};

export const chipSelectedSx = {
  backgroundColor: 'var(--light-green)',
  color: 'var(--primary-green)',
  borderColor: 'var(--accent-green)',
  fontWeight: 500
};
