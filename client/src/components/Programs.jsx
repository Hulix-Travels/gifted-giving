import React, { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Chip, CircularProgress } from '@mui/material';
import ForwardArrowEndIcon from './ui/ForwardArrowEndIcon';
import CtaPanel from './ui/CtaPanel';
import { programsAPI } from '../services/api';
import ApiErrorState from './ApiErrorState';
import SectionHeader from './ui/SectionHeader';
import { sectionSurface, siteCard } from '../theme/styles';
import { getUploadUrl } from '../config/api';

const PROGRAMS_PER_ROW = 3;

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayedCount, setDisplayedCount] = useState(PROGRAMS_PER_ROW);

  const fetchPrograms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [activeResponse, upcomingResponse] = await Promise.all([
        programsAPI.getAll({ status: 'active', featured: 'true' }),
        programsAPI.getAll({ status: 'upcoming', featured: 'true' })
      ]);

      const activePrograms = activeResponse.programs || [];
      const upcomingPrograms = upcomingResponse.programs || [];
      setPrograms([...activePrograms, ...upcomingPrograms]);
      setDisplayedCount(PROGRAMS_PER_ROW);
    } catch {
      setError('Failed to load programs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();

    const refreshHandler = () => fetchPrograms();
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('programs:refresh', refreshHandler);
    }
    return () => {
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('programs:refresh', refreshHandler);
      }
    };
  }, [fetchPrograms]);

  const scrollToSection = (href, programId = null) => {
    // Store program ID in sessionStorage if provided
    if (programId) {
      sessionStorage.setItem('selectedProgramId', programId);
      // Dispatch custom event to notify Donate component
      window.dispatchEvent(new CustomEvent('program-selected', { detail: { programId } }));
    }
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoadMore = () => {
    setDisplayedCount((prev) => prev + PROGRAMS_PER_ROW);
  };

  const handleShowLess = () => {
    setDisplayedCount(PROGRAMS_PER_ROW);
    document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const displayedPrograms = programs.slice(0, displayedCount);
  const hasMorePrograms = programs.length > displayedCount;
  const canShowLess = displayedCount > PROGRAMS_PER_ROW;

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <Box 
        id="programs" 
        sx={{ 
          py: { xs: 8, md: 12 },
          background: 'var(--white)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}
      >
        <CircularProgress size={60} sx={{ color: 'var(--primary-green)' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        id="programs" 
        sx={{ 
          py: { xs: 8, md: 12 },
          background: 'var(--white)'
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontWeight: 800,
              color: 'var(--primary-green)',
              textAlign: 'center',
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Our Programs
          </Typography>
          <ApiErrorState
            title="Programs unavailable"
            message="We couldn't load our programs right now. Your connection may be down, or our servers may be temporarily unavailable."
            onRetry={fetchPrograms}
          />
        </Container>
      </Box>
    );
  }

  return (
    <Box id="programs" sx={sectionSurface}>
      <Container maxWidth="lg">
        <SectionHeader
          title="Our Programs"
          subtitle="Choose how you want to make a difference in a child's life"
        />

        <Grid container spacing={3} justifyContent="center" alignItems="stretch">
          {displayedPrograms.map((program, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={program._id || index}>
              <Card sx={{ ...siteCard, maxWidth: 380, mx: 'auto' }}>
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={getUploadUrl(program.image)}
                    alt={program.name}
                    loading="lazy"
                    decoding="async"
                    sx={{ objectFit: 'cover', display: 'block' }}
                  />
                  <Chip
                    label={program.status === 'upcoming' ? 'Coming Soon' : 'Active'}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      background: program.status === 'upcoming' ? '#C9A227' : 'var(--white)',
                      color: program.status === 'upcoming' ? 'var(--white)' : 'var(--primary-green)',
                      fontWeight: 600,
                      border: '1px solid var(--color-border)'
                    }}
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 600,
                      color: 'var(--primary-green)',
                      mb: 1
                    }}
                  >
                    {program.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.65, color: 'var(--gray)', minHeight: 48 }}>
                    {program.description}
                  </Typography>
                  {/* Progress Bar */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Math.round((program.currentAmount / program.targetAmount) * 100)}%
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        width: '100%', 
                        height: 8, 
                        backgroundColor: 'var(--light-green)',
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}
                    >
                      <Box 
                        sx={{ 
                          height: '100%', 
                          backgroundColor: 'var(--primary-green)',
                          width: `${Math.min((program.currentAmount / program.targetAmount) * 100, 100)}%`,
                          transition: 'width 0.3s ease'
                        }} 
                      />
                    </Box>
                  </Box>
                  {/* Impact and Cost Chips */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {(program.impactMetrics?.childrenHelped > 0 || 
                      program.impactMetrics?.communitiesReached > 0 || 
                      program.impactMetrics?.schoolsBuilt > 0 || 
                      program.impactMetrics?.mealsProvided > 0 || 
                      program.impactMetrics?.medicalCheckups > 0) && (
                      <Chip 
                        label={`${program.impactMetrics?.childrenHelped || 0}+ Children`}
                        size="small"
                        sx={{
                          background: 'var(--light-green)',
                          color: 'var(--primary-green)',
                          fontWeight: 600,
                          fontSize: '0.8rem'
                        }}
                      />
                    )}
                    <Chip 
                      label={`${formatCurrency(program.currentAmount, program.currency)} raised`}
                      size="small"
                      sx={{
                        background: 'var(--light-green)',
                        color: 'var(--primary-green)',
                        fontWeight: 600,
                        fontSize: '0.8rem'
                      }}
                    />
                  </Box>
                  {/* Display targetMetrics (Goals) only if there are meaningful values */}
                  {program.targetMetrics &&
                    (program.targetMetrics.childrenToHelp > 0 ||
                      program.targetMetrics.communitiesToReach > 0 ||
                      program.targetMetrics.schoolsToBuild > 0 ||
                      program.targetMetrics.mealsToProvide > 0 ||
                      program.targetMetrics.medicalCheckupsToProvide > 0) && (
                      <Typography variant="caption" sx={{ display: 'block', mb: 2, color: 'var(--gray)', lineHeight: 1.5 }}>
                        Goals:
                        {program.targetMetrics.childrenToHelp > 0 && ` ${program.targetMetrics.childrenToHelp} children`}
                        {program.targetMetrics.communitiesToReach > 0 &&
                          ` · ${program.targetMetrics.communitiesToReach} communities`}
                        {program.targetMetrics.schoolsToBuild > 0 && ` · ${program.targetMetrics.schoolsToBuild} schools`}
                        {program.targetMetrics.mealsToProvide > 0 && ` · ${program.targetMetrics.mealsToProvide} meals`}
                        {program.targetMetrics.medicalCheckupsToProvide > 0 &&
                          ` · ${program.targetMetrics.medicalCheckupsToProvide} checkups`}
                      </Typography>
                    )}
                  
                  {/* Spacer to push button to bottom */}
                  <Box sx={{ flexGrow: 1 }} />
                  
                  <Button
                    variant="contained"
                    color={program.status === 'upcoming' ? 'inherit' : 'secondary'}
                    fullWidth
                    endIcon={<ForwardArrowEndIcon />}
                    onClick={() => scrollToSection('#donate', program._id)}
                    sx={{
                      py: 1.25,
                      ...(program.status === 'upcoming' && {
                        backgroundColor: '#C9A227',
                        color: '#fff',
                        '&:hover': { backgroundColor: '#A67C00' }
                      })
                    }}
                  >
                    {program.status === 'upcoming' ? 'Learn More' : 'Support'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Load More / Show Less */}
        {(hasMorePrograms || canShowLess) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mt: 6 }}>
            {hasMorePrograms && (
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                sx={{
                  px: 3,
                  py: 1.25,
                  borderColor: 'var(--primary-green)',
                  color: 'var(--primary-green)',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: 'var(--dark-green)',
                    backgroundColor: 'var(--light-green)'
                  }
                }}
              >
                Load more ({programs.length - displayedCount})
              </Button>
            )}
            {canShowLess && (
              <Button
                variant="text"
                onClick={handleShowLess}
                sx={{
                  px: 3,
                  py: 1.25,
                  color: 'var(--gray)',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { color: 'var(--primary-green)', backgroundColor: 'transparent' }
                }}
              >
                Show less
              </Button>
            )}
          </Box>
        )}
        
        <CtaPanel
          title="Ready to give?"
          description="Choose a program above or go straight to checkout."
        >
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => scrollToSection('#donate')}
            sx={{ textTransform: 'none', fontWeight: 600, px: 4 }}
          >
            Donate now
          </Button>
        </CtaPanel>
      </Container>
    </Box>
  );
} 