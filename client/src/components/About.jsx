import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, Chip, CircularProgress } from '@mui/material';
import { School, Favorite, People, Public, TrendingUp, Star } from '@mui/icons-material';
import useLiveStats from '../hooks/useLiveStats';
import formatShortNumber from '../utils/formatShortNumber';

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
      number: stats ? formatShortNumber(stats.childrenHelped) : '—',
      label: 'Children Helped',
      description: 'Direct impact on children\'s lives through our programs',
      icon: 'favorite',
      color: '#00ff8c',
      gradient: 'linear-gradient(135deg, #00ff8c, #00cc6a)',
      trend: '',
      category: 'Education & Health'
    },
    {
      number: stats ? formatShortNumber(stats.communities) : '—',
      label: 'Communities',
      description: 'Villages and neighborhoods transformed',
      icon: 'public',
      color: '#01371f',
      gradient: 'linear-gradient(135deg, #01371f, #00a854)',
      trend: '',
      category: 'Global Reach'
    },
    {
      number: stats ? formatShortNumber(stats.volunteers) : '—',
      label: 'Volunteers',
      description: 'Dedicated individuals making change happen',
      icon: 'people',
      color: '#00cc6a',
      gradient: 'linear-gradient(135deg, #00cc6a, #00a854)',
      trend: '',
      category: 'Community Support'
    },
    {
      number: stats ? formatShortNumber(stats.countries) : '—',
      label: 'Countries',
      description: 'International presence and impact',
      icon: 'school',
      color: '#00e67a',
      gradient: 'linear-gradient(135deg, #00e67a, #00cc6a)',
      trend: '',
      category: 'Global Expansion'
    },
    {
      number: stats ? `$${formatShortNumber(stats.funds)}` : '—',
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
                Gratitude-Driven Giving Creates Lasting Impact
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
                Founded in 2020, Gifted givings transforms lives through education, nutrition, and healthcare 
                by combining gratitude with meaningful action. We believe that when we move beyond counting resources 
                and focus on behavior change and compassionate connections, every child 
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
            <Box
              component="img"
              src="/aboutimage.jpg"
              alt="Children learning"
              sx={{
                width: '100%',
                height: 'auto',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)'
              }}
            />
          </Grid>
        </Grid>

        {/* Impact Section Title and Subtitle */}
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

        {/* Impact Stats */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
            <CircularProgress size={48} sx={{ color: 'var(--primary-green)' }} />
          </Box>
        ) : (
          <Box
            sx={{
              background: 'linear-gradient(135deg, #f8f9fa 60%, #e0f7ef 100%)',
              borderRadius: 4,
              boxShadow: '0 4px 24px rgba(0,255,140,0.06)',
              px: { xs: 1, md: 4 },
              py: { xs: 2, md: 4 },
              mb: 6
            }}
          >
            <Grid container spacing={4} justifyContent="center" alignItems="stretch">
              {liveStats.map((stat, idx) => (
                <Grid item xs={12} sm={6} md={3} key={idx}>
                  <Card
                    sx={{
                      height: '100%',
                      background: 'var(--white)',
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 3,
                      overflow: 'hidden',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 12px rgba(0,255,140,0.04)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-6px) scale(1.03)',
                        boxShadow: '0 8px 32px rgba(0,255,140,0.10)',
                        borderColor: 'var(--primary-green)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3, width: '100%', textAlign: 'center' }}>
                      {/* Icon */}
                      <Box
                        className="stat-icon"
                        sx={{
                          color: stat.color,
                          mb: 2,
                          fontSize: '2.7rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))'
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
                          fontSize: { xs: '1.7rem', md: '2.1rem' },
                          background: stat.gradient,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {stat.number}
                      </Typography>
                      {/* Label */}
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'var(--gray)',
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          mb: 1,
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
                          fontSize: '0.8rem',
                          lineHeight: 1.5,
                          mb: 2,
                          minHeight: '2.1rem',
                          display: 'block'
                        }}
                      >
                        {stat.description}
                      </Typography>
                      {/* Category Badge */}
                      <Chip
                        label={stat.category}
                        size="small"
                        sx={{
                          mb: 1.5,
                          background: 'rgba(0,255,140,0.08)',
                          color: 'var(--primary-green)',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 22
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
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
      </Container>
    </Box>
  );
} 