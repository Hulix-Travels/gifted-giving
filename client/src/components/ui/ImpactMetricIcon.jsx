import {
  VolunteerActivism,
  Public,
  School,
  Restaurant,
  LocalHospital
} from '@mui/icons-material';

const METRIC_ICONS = {
  children: VolunteerActivism,
  communities: Public,
  schools: School,
  meals: Restaurant,
  checkups: LocalHospital
};

export function getImpactMetricItems(impact = {}) {
  const items = [];
  if (impact.children > 0) items.push({ type: 'children', text: `${impact.children} children` });
  if (impact.communities > 0) items.push({ type: 'communities', text: `${impact.communities} communities` });
  if (impact.schools > 0) items.push({ type: 'schools', text: `${impact.schools} schools` });
  if (impact.meals > 0) items.push({ type: 'meals', text: `${impact.meals} meals` });
  if (impact.checkups > 0) items.push({ type: 'checkups', text: `${impact.checkups} checkups` });
  return items;
}

export default function ImpactMetricIcon({ type, sx = {} }) {
  const Icon = METRIC_ICONS[type] || VolunteerActivism;
  return (
    <Icon
      sx={{
        fontSize: '1.125rem',
        color: 'var(--accent-green)',
        flexShrink: 0,
        ...sx
      }}
    />
  );
}
