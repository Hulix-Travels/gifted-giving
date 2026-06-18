import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CONTACT_EMAIL } from '../constants/contact';
import { donationsAPI, programsAPI } from '../services/api';
import formatStatValue from '../utils/formatStatValue';

export default function FinancialReports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [donationStats, setDonationStats] = useState(null);
  const [programStats, setProgramStats] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [donationsRes, programsRes] = await Promise.all([
        donationsAPI.getStats(),
        programsAPI.getStats()
      ]);
      setDonationStats(donationsRes.stats || null);
      setProgramStats(programsRes || null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    fetchReports();
  }, [fetchReports]);

  const categoryBreakdown = programStats?.byCategory || [];

  return (
    <Box
      component="main"
      sx={{
        py: { xs: 10, md: 12 },
        mt: 8,
        background: 'var(--light-gray)',
        minHeight: { xs: 'calc(100vh - 70px)', md: 'calc(100vh - 90px)' },
        boxSizing: 'border-box'
      }}
    >
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'var(--primary-green)', mb: 3 }}>
              Financial Transparency
            </Typography>
            <Typography paragraph>
              Gifted givings is committed to responsible stewardship of every donation. Over 90% of funds raised
              go directly to our education, health, and nutrition programs. The remainder supports essential
              operations such as payment processing, platform maintenance, and program oversight.
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Live impact summary
            </Typography>

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={36} sx={{ color: 'var(--primary-green)' }} />
              </Box>
            )}

            {error && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Live figures are temporarily unavailable. Contact us for the latest report.
              </Alert>
            )}

            {!loading && !error && (
              <>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--primary-green)' }}>
                        {formatStatValue(donationStats?.totalAmount, { prefix: '$' })}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total raised (completed gifts)
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--primary-green)' }}>
                        {formatStatValue(donationStats?.completedDonations)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completed donations
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'var(--primary-green)' }}>
                        {formatStatValue(programStats?.overall?.totalPrograms)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active programs tracked
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                {categoryBreakdown.length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                      Funds by program category
                    </Typography>
                    <List dense sx={{ mb: 2 }}>
                      {categoryBreakdown.map((row) => (
                        <ListItem key={row._id} disableGutters>
                          <ListItemText
                            primary={row._id ? row._id.charAt(0).toUpperCase() + row._id.slice(1) : 'Other'}
                            secondary={`${formatStatValue(row.totalAmount, { prefix: '$' })} raised across ${row.count} program${row.count === 1 ? '' : 's'}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </>
            )}

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              How we report impact
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText primary="Program-level tracking of funds raised and impact metrics on this website" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Donation receipts emailed after each completed gift" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Monthly impact summaries for registered donors who opt in" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Annual summary of program spending available on request" />
              </ListItem>
            </List>

            <Typography variant="h6" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>
              Request a report
            </Typography>
            <Typography paragraph>
              For a detailed breakdown of how funds are allocated, contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </Typography>

            <Button variant="contained" onClick={() => navigate('/#donate')} sx={{ mt: 2, background: 'var(--primary-green)' }}>
              Make a Donation
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
