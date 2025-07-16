import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Chip, CircularProgress } from '@mui/material';
import { School, Favorite, People, Public, TrendingUp, Star } from '@mui/icons-material';
import { programsAPI } from '../services/api';
import { volunteersAPI } from '../services/api';

function useLiveStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Fetch all programs
        const programsRes = await programsAPI.getAll({});
        const programs = programsRes.programs || [];
        // Aggregate children helped, communities, funds, countries
        let childrenHelped = 0;
        let communities = 0;
        let funds = 0;
        const countriesSet = new Set();
        programs.forEach(p => {
          childrenHelped += p.impactMetrics?.childrenHelped || 0;
          communities += p.impactMetrics?.communitiesReached || 0;
          funds += p.currentAmount || 0;
          if (p.location?.country) countriesSet.add(p.location.country);
        });
        // Fetch volunteers
        const volunteersRes = await volunteersAPI.getStats();
        const volunteers = volunteersRes.overall?.totalApplications || 0;
        setStats({
          childrenHelped,
          communities,
          funds,
          countries: countriesSet.size,
          volunteers
        });
      } catch (e) {
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);
  return { stats, loading };
}

export default function About() {
  const renderAboutIcon = (iconType) => {
    switch (iconType) {
      case 'favorite':
        return <Favorite />;
      case 'public':
        return <Public />;
      case 'people':
        return <People />;
      case 'school':
        return <School />;
      default:
        return <Favorite />;
    }
  };

  const { stats, loading } = useLiveStats();

  const liveStats = [
    {
      number: stats ? stats.childrenHelped.toLocaleString() : '—',
      label: 'Children Helped',
      description: 'Direct impact on children\'s lives through our programs',
      icon: 'favorite',
      color: '#00ff8c',
      gradient: 'linear-gradient(135deg, #00ff8c, #00cc6a)',
      trend: '',
      category: 'Education & Health'
    },
    {
      number: stats ? stats.communities.toLocaleString() : '—',
      label: 'Communities',
      description: 'Villages and neighborhoods transformed',
      icon: 'public',
      color: '#01371f',
      gradient: 'linear-gradient(135deg, #01371f, #00a854)',
      trend: '',
      category: 'Global Reach'
    },
    {
      number: stats ? stats.volunteers.toLocaleString() : '—',
      label: 'Volunteers',
      description: 'Dedicated individuals making change happen',
      icon: 'people',
      color: '#00cc6a',
      gradient: 'linear-gradient(135deg, #00cc6a, #00a854)',
      trend: '',
      category: 'Community Support'
    },
    {
      number: stats ? stats.countries.toLocaleString() : '—',
      label: 'Countries',
      description: 'International presence and impact',
      icon: 'school',
      color: '#00e67a',
      gradient: 'linear-gradient(135deg, #00e67a, #00cc6a)',
      trend: '',
      category: 'Global Expansion'
    },
    {
      number: stats ? `$${stats.funds.toLocaleString()}` : '—',
      label: 'Funds Collected',
      description: 'Total funds raised for all programs',
      icon: 'trending_up',
      color: '#4CAF50',
      gradient: 'linear-gradient(135deg, #4CAF50, #00cc6a)',
      trend: '',
      category: 'Financial Impact'
    }
  ];

  return (
    <Box 
      id="about" 
      sx={{ 
        py: { xs: 8, md: 12 }, 
        background: 'linear-gradient(135deg, var(--light-gray) 0%, var(--white) 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: 'radial-gradient(circle at 20% 80%, rgba(0,255,140,0.05) 0%, transparent 50%)',
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
            Our Mission
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
            Transforming lives through education, nutrition, and healthcare initiatives
          </Typography>
        </Box>
        
        {/* Mission Content */}
        <Grid container spacing={6} alignItems="center" sx={{ mb: 10 }}>
          <Grid xs={12} md={6}>
            <Box className="fade-in-up">
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 700,
                  color: 'var(--primary-green)',
                  fontSize: { xs: '1.5rem', md: '2rem' }
                }}
              >
                Every Child Deserves Opportunity
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 3, 
                  fontSize: '1.1rem', 
                  lineHeight: 1.8,
                  color: 'var(--gray)'
                }}
              >
                Founded in 2020, Gifted Giving is dedicated to transforming the lives of children 
                through education, nutrition, and healthcare initiatives. We believe every child 
                has the right to thrive, regardless of their circumstances.
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 4, 
                  fontSize: '1.1rem', 
                  lineHeight: 1.8,
                  color: 'var(--gray)'
                }}
              >
                Our team works directly with local communities to create sustainable solutions 
                that break the cycle of poverty. Through partnerships with schools, clinics, 
                and local leaders, we ensure your contributions make the maximum impact.
              </Typography>
              <Button 
                variant="contained"
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, var(--primary-green), var(--dark-green))',
                  color: 'var(--white)',
                  px: 4,
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
                Learn More About Us
              </Button>
            </Box>
          </Grid>
          <Grid xs={12} md={6}>
            <Box className="fade-in-up">
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
                alt="Children learning"
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  transform: 'rotate(2deg)',
                  transition: 'var(--transition)',
                  '&:hover': {
                    transform: 'rotate(0deg) scale(1.02)'
                  }
                }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Stats Section */}
        <Box className="fade-in-up">
          <Typography 
            variant="h3" 
            sx={{ 
              textAlign: 'center',
              mb: 2,
              fontWeight: 700,
              color: 'var(--primary-green)',
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            Our Impact
          </Typography>
          
          <Typography 
            variant="h6" 
            sx={{ 
              textAlign: 'center',
              mb: 6,
              color: 'var(--gray)',
              maxWidth: 600,
              mx: 'auto',
              fontSize: '1.1rem',
              lineHeight: 1.6
            }}
          >
            Real numbers, real impact. Every statistic represents a life changed for the better.
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
              <CircularProgress size={48} sx={{ color: 'var(--primary-green)' }} />
            </Box>
          ) : (
            <Grid container spacing={2} justifyContent="center">
              {liveStats.map((stat, index) => (
                <Grid item xs={6} sm={4} md={2.5} key={index}>
                  <Card 
                    className="card"
                    sx={{ 
                      textAlign: 'center', 
                      height: '100%',
                      background: 'var(--white)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 3,
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: stat.gradient,
                        transform: 'scaleX(0)',
                        transition: 'transform 0.4s ease',
                        transformOrigin: 'left'
                      },
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
                        '&::before': {
                          transform: 'scaleX(1)'
                        },
                        '& .stat-icon': {
                          transform: 'scale(1.1) rotate(5deg)',
                          filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))'
                        },
                        '& .stat-number': {
                          transform: 'scale(1.03)',
                          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        },
                        '& .trend-chip': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 3px 8px rgba(0,0,0,0.15)'
                        }
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2.5 }}>
                      {/* Category Badge */}
                      <Chip 
                        label={stat.category}
                        size="small"
                        sx={{
                          mb: 1.5,
                          background: 'rgba(0,255,140,0.1)',
                          color: 'var(--primary-green)',
                          fontWeight: 600,
                          fontSize: '0.65rem',
                          height: 20
                        }}
                      />
                      
                      {/* Icon */}
                      <Box 
                        className="stat-icon"
                        sx={{ 
                          color: stat.color,
                          mb: 2,
                          fontSize: '2.5rem',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}
                      >
                        {renderAboutIcon(stat.icon)}
                      </Box>
                      
                      {/* Number */}
                      <Typography 
                        className="stat-number"
                        variant="h3" 
                        sx={{ 
                          fontWeight: 900, 
                          color: 'var(--primary-green)', 
                          mb: 0.5,
                          fontSize: { xs: '1.8rem', md: '2.2rem' },
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          background: stat.gradient,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}
                      >
                        {stat.number}
                      </Typography>
                      
                      {/* Label */}
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: 'var(--gray)', 
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          mb: 1.5,
                          textTransform: 'uppercase',
                          letterSpacing: '0.3px'
                        }}
                      >
                        {stat.label}
                      </Typography>
                      
                      {/* Description */}
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#666', 
                          fontSize: '0.75rem',
                          lineHeight: 1.4,
                          mb: 2,
                          minHeight: '2.1rem',
                          display: 'block'
                        }}
                      >
                        {stat.description}
                      </Typography>
                      
                      {/* Trend */}
                      <Chip 
                        className="trend-chip"
                        icon={<TrendingUp />}
                        label={stat.trend}
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #00ff8c, #00cc6a)',
                          color: 'var(--primary-green)',
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          height: 20,
                          '& .MuiChip-icon': {
                            color: 'var(--primary-green)',
                            fontSize: '0.8rem'
                          }
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
          {/* Call to Action */}
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 3,
                fontWeight: 700,
                color: 'var(--primary-green)'
              }}
            >
              Be Part of Our Growing Impact
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4,
                color: 'var(--gray)',
                fontSize: '1.1rem',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              Join thousands of donors and volunteers who are making a real difference in children's lives around the world.
            </Typography>
            <Button 
              variant="contained"
              size="large"
              startIcon={<Star />}
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
              Join Our Mission
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
} 