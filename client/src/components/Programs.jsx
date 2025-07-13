import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Chip, CircularProgress } from '@mui/material';
import { School, Favorite, Restaurant, ArrowForward } from '@mui/icons-material';
import { programsAPI } from '../services/api';

// Icon mapping for different program categories
const getCategoryIcon = (category) => {
  switch (category) {
    case 'education':
      return <School />;
    case 'health':
      return <Favorite />;
    case 'nutrition':
      return <Restaurant />;
    default:
      return <School />;
  }
};

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        // Fetch both active and upcoming programs separately
        const [activeResponse, upcomingResponse] = await Promise.all([
          programsAPI.getAll({ status: 'active', featured: 'true' }),
          programsAPI.getAll({ status: 'upcoming', featured: 'true' })
        ]);
        
        // Combine the results, prioritizing active programs first
        const activePrograms = activeResponse.programs || [];
        const upcomingPrograms = upcomingResponse.programs || [];
        const combinedPrograms = [...activePrograms, ...upcomingPrograms];
        
        setPrograms(combinedPrograms);
      } catch (err) {
        console.error('Error fetching programs:', err);
        setError('Failed to load programs');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
          background: 'var(--white)',
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      id="programs" 
      sx={{ 
        py: { xs: 8, md: 12 },
        background: 'var(--white)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: 'radial-gradient(circle at 80% 20%, rgba(0,255,140,0.03) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Section Title */}
        <Box className="section-title" sx={{ mb: 8 }}>
          <Typography 
            variant="h2" 
            component="h2" 
            sx={{ 
              fontWeight: 800,
              color: 'var(--primary-green)',
              textAlign: 'center',
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Our Programs
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              textAlign: 'center',
              color: 'var(--gray)',
              maxWidth: 600,
              mx: 'auto',
              fontSize: '1.2rem',
              lineHeight: 1.6
            }}
          >
            Choose how you want to make a difference in a child's life
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {programs.map((program, index) => (
            <Grid item xs={12} md={4} key={program._id || index}>
              <Card 
                className="card"
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--white)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  transition: 'var(--transition)',
                  '&:hover': { 
                    transform: 'translateY(-12px)',
                    boxShadow: 'var(--shadow-lg)',
                    '& .MuiCardMedia-root': {
                      transform: 'scale(1.1)'
                    },
                    '& .program-icon': {
                      transform: 'scale(1.1) rotate(5deg)'
                    }
                  }
                }}
              >
                <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="250"
                    image={program.image}
                    alt={program.name}
                    sx={{
                      transition: 'transform 0.6s ease',
                      background: 'linear-gradient(135deg, var(--primary-green), var(--dark-green))'
                    }}
                  />
                  <Box 
                    className="program-icon"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      background: 'rgba(255,255,255,0.9)',
                      borderRadius: '50%',
                      width: 50,
                      height: 50,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-green)',
                      fontSize: '1.5rem',
                      transition: 'var(--transition)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {getCategoryIcon(program.category)}
                  </Box>
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      height: '60px'
                    }}
                  />
                </Box>
                
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 700, 
                      color: 'var(--primary-green)',
                      fontSize: { xs: '1.3rem', md: '1.5rem' }
                    }}
                  >
                    {program.name}
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 3, 
                      lineHeight: 1.7,
                      color: 'var(--gray)',
                      fontSize: '1rem'
                    }}
                  >
                    {program.description}
                  </Typography>
                  
                  {/* Progress Bar */}
                  <Box sx={{ mb: 3 }}>
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
                  
                  {/* Impact Progress Bars */}
                  {program.targetMetrics && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Impact Progress
                      </Typography>
                      
                      {/* Children Progress */}
                      {program.targetMetrics.childrenToHelp > 0 && (
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Children Helped
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {program.impactMetrics?.childrenHelped || 0} / {program.targetMetrics.childrenToHelp}
                            </Typography>
                          </Box>
                          <Box 
                            sx={{ 
                              width: '100%', 
                              height: 4, 
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              borderRadius: 2,
                              overflow: 'hidden'
                            }}
                          >
                            <Box 
                              sx={{ 
                                height: '100%', 
                                backgroundColor: '#4CAF50',
                                width: `${Math.min(((program.impactMetrics?.childrenHelped || 0) / program.targetMetrics.childrenToHelp) * 100, 100)}%`,
                                transition: 'width 0.3s ease'
                              }} 
                            />
                          </Box>
                        </Box>
                      )}
                      
                      {/* Communities Progress */}
                      {program.targetMetrics.communitiesToReach > 0 && (
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Communities Reached
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {program.impactMetrics?.communitiesReached || 0} / {program.targetMetrics.communitiesToReach}
                            </Typography>
                          </Box>
                          <Box 
                            sx={{ 
                              width: '100%', 
                              height: 4, 
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              borderRadius: 2,
                              overflow: 'hidden'
                            }}
                          >
                            <Box 
                              sx={{ 
                                height: '100%', 
                                backgroundColor: '#2196F3',
                                width: `${Math.min(((program.impactMetrics?.communitiesReached || 0) / program.targetMetrics.communitiesToReach) * 100, 100)}%`,
                                transition: 'width 0.3s ease'
                              }} 
                            />
                          </Box>
                        </Box>
                      )}
                      
                      {/* Schools Progress */}
                      {program.targetMetrics.schoolsToBuild > 0 && (
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Schools Built
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {program.impactMetrics?.schoolsBuilt || 0} / {program.targetMetrics.schoolsToBuild}
                            </Typography>
                          </Box>
                          <Box 
                            sx={{ 
                              width: '100%', 
                              height: 4, 
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              borderRadius: 2,
                              overflow: 'hidden'
                            }}
                          >
                            <Box 
                              sx={{ 
                                height: '100%', 
                                backgroundColor: '#FF9800',
                                width: `${Math.min(((program.impactMetrics?.schoolsBuilt || 0) / program.targetMetrics.schoolsToBuild) * 100, 100)}%`,
                                transition: 'width 0.3s ease'
                              }} 
                            />
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}
                  
                  {/* Impact and Cost Chips */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                    <Chip 
                      label={program.status === 'upcoming' ? 'Coming Soon' : 'Active'}
                      size="small"
                      sx={{
                        background: program.status === 'upcoming' ? '#FF9800' : 'var(--light-green)',
                        color: program.status === 'upcoming' ? 'white' : 'var(--primary-green)',
                        fontWeight: 600,
                        fontSize: '0.8rem'
                      }}
                    />
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
                    <Chip 
                      label={`${formatCurrency(program.currentAmount, program.currency)} raised`}
                      size="small"
                      sx={{
                        background: 'var(--accent-green)',
                        color: 'var(--primary-green)',
                        fontWeight: 700,
                        fontSize: '0.8rem'
                      }}
                    />
                  </Box>
                  
                  <Button 
                    variant="contained" 
                    fullWidth
                    endIcon={<ArrowForward />}
                    onClick={() => scrollToSection('#donate')}
                    sx={{
                      background: program.status === 'upcoming' 
                        ? 'linear-gradient(135deg, #FF9800, #F57C00)' 
                        : 'linear-gradient(135deg, var(--accent-green), #00cc6a)',
                      color: 'var(--primary-green)',
                      fontWeight: 700,
                      borderRadius: 3,
                      py: 1.5,
                      fontSize: '1rem',
                      boxShadow: 'var(--shadow-sm)',
                      '&:hover': { 
                        background: program.status === 'upcoming'
                          ? 'linear-gradient(135deg, #F57C00, #FF9800)'
                          : 'linear-gradient(135deg, #00cc6a, var(--accent-green))',
                        transform: 'translateY(-2px)',
                        boxShadow: 'var(--shadow-md)'
                      }
                    }}
                  >
                    {program.status === 'upcoming' ? 'Learn More' : `Support ${program.name}`}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Call to Action */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            mt: 8,
            p: 4,
            background: 'linear-gradient(135deg, var(--light-green), var(--white))',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(0,255,140,0.1)'
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 2,
              fontWeight: 700,
              color: 'var(--primary-green)'
            }}
          >
            Ready to Make a Difference?
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3,
              color: 'var(--gray)',
              fontSize: '1.1rem'
            }}
          >
            Every donation, no matter the size, creates a lasting impact on a child's life.
          </Typography>
          <Button 
            variant="contained"
            size="large"
            onClick={() => scrollToSection('#donate')}
            sx={{
              background: 'linear-gradient(135deg, var(--primary-green), var(--dark-green))',
              color: 'var(--white)',
              px: 5,
              py: 2,
              borderRadius: 3,
              fontWeight: 700,
              fontSize: '1.1rem',
              boxShadow: 'var(--shadow-md)',
              '&:hover': { 
                background: 'linear-gradient(135deg, var(--dark-green), var(--primary-green))',
                transform: 'translateY(-2px)',
                boxShadow: 'var(--shadow-lg)'
              }
            }}
          >
            Start Donating Today
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 