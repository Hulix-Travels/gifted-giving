import React from 'react';
import { Box, Typography, Button, Stack, Container } from '@mui/material';
import { VolunteerActivism, School, Favorite } from '@mui/icons-material';
import useLiveStats from '../hooks/useLiveStats';
import formatShortNumber from '../utils/formatShortNumber';

export default function Hero() {
  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderHeroIcon = (iconType) => {
    switch (iconType) {
      case 'volunteer_activism':
        return <VolunteerActivism />;
      case 'school':
        return <School />;
      case 'favorite':
        return <Favorite />;
      default:
        return <VolunteerActivism />;
    }
  };

  const { stats: liveStats, loading: statsLoading } = useLiveStats();

  return (
    <Box
      sx={{
        minHeight: { xs: 'auto', sm: '100vh', md: '90vh' },
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        background: `linear-gradient(135deg, rgba(1,55,31,0.5), rgba(0,36,17,0.5)), url(/heroimge.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: { xs: 'scroll', md: 'fixed' }, // Prevent fixed attachment on mobile
        color: 'var(--white)',
        overflow: 'hidden',
        pb: { xs: 4, sm: 6, md: 0 }, // Add bottom padding on mobile to prevent overlap
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 50%, rgba(0,255,140,0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        <Box 
          sx={{ 
            textAlign: 'center',
            maxWidth: 900,
            mx: 'auto',
            py: { xs: 8, md: 12 }
          }}
        >
          {/* Main Heading */}
          <Typography 
            variant="h1" 
            sx={{ 
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              lineHeight: 1.1,
              background: 'linear-gradient(135deg, var(--white), var(--accent-green))',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 4px 20px rgba(0,255,140,0.3)'
            }}
          >
            Counting Source-Driven Things
            <Box component="span" sx={{ 
              display: 'block',
              color: 'var(--accent-green)',
              WebkitTextFillColor: 'var(--accent-green)'
            }}>
              Impacts the Future Negatively
            </Box>
            <Box component="span" sx={{ 
              display: 'block',
              fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
              mt: 2,
              color: 'rgba(255,255,255,0.95)',
              WebkitTextFillColor: 'rgba(255,255,255,0.95)'
            }}>
              Let's Join Gratitude and Behavior to Giving
            </Box>
          </Typography>

          {/* Subtitle */}
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 5, 
              color: 'rgba(255,255,255,0.9)',
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              lineHeight: 1.6,
              maxWidth: 700,
              mx: 'auto',
              fontWeight: 400
            }}
          >
            When we focus only on counting resources and outcomes, we miss the deeper meaning of giving. 
            True impact comes from gratitude-driven actions and behavior change. Join us in creating meaningful 
            connections through compassionate giving that transforms both donors and recipients.
          </Typography>

          {/* Action Buttons */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3} 
            justifyContent="center"
            sx={{ mb: { xs: 4, sm: 5, md: 6 } }}
          >
            <Button 
              onClick={() => scrollToSection('#donate')}
              variant="contained" 
              size="large" 
              startIcon={<Favorite />}
              sx={{
                background: 'linear-gradient(135deg, var(--accent-green), #00cc6a)',
                color: 'var(--primary-green)',
                fontWeight: 700,
                borderRadius: 4,
                px: 5,
                py: 2,
                fontSize: '1.1rem',
                boxShadow: '0 8px 25px rgba(0,255,140,0.3)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #00cc6a, var(--accent-green))',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 35px rgba(0,255,140,0.4)'
                }
              }}
            >
              Donate Now
            </Button>
            <Button 
              onClick={() => scrollToSection('#programs')}
              variant="outlined" 
              size="large"
              startIcon={<School />}
              sx={{
                color: 'var(--accent-green)',
                borderColor: 'var(--accent-green)',
                borderWidth: 2,
                fontWeight: 700,
                borderRadius: 4,
                px: 5,
                py: 2,
                fontSize: '1.1rem',
                '&:hover': { 
                  borderColor: 'var(--white)',
                  color: 'var(--white)',
                  background: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-3px)'
                }
              }}
            >
              Our Programs
            </Button>
          </Stack>

          {/* Stats Preview */}
          <Box 
            sx={{ 
              display: 'flex',
              justifyContent: 'center',
              gap: { xs: 1.5, sm: 2, md: 4 },
              flexWrap: 'wrap',
              mb: { xs: 2, md: 0 }
            }}
          >
            {statsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 80 }}>
                <span className="MuiCircularProgress-root MuiCircularProgress-colorPrimary" style={{ width: 40, height: 40, color: 'var(--accent-green)' }} />
              </Box>
            ) : ([
              { icon: 'volunteer_activism', number: formatShortNumber(liveStats?.childrenHelped), label: 'Children Helped' },
              { icon: 'school', number: formatShortNumber(liveStats?.communities), label: 'Communities' },
              { icon: 'favorite', number: '95%', label: 'Success Rate' }
            ].map((stat, index) => (
              <Box 
                key={index}
                sx={{ 
                  textAlign: 'center',
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  minWidth: { xs: 100, sm: 120 },
                  flex: { xs: '1 1 calc(33.333% - 12px)', sm: '0 1 auto' },
                  maxWidth: { xs: 'calc(33.333% - 12px)', sm: 'none' }
                }}
              >
                <Box sx={{ color: 'var(--accent-green)', mb: 1 }}>
                  {renderHeroIcon(stat.icon)}
                </Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    color: 'var(--accent-green)',
                    mb: 0.5,
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2.125rem' }
                  }}
                >
                  {stat.number}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.8)',
                    fontWeight: 500,
                    fontSize: { xs: '0.7rem', sm: '0.875rem' }
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            )))}
          </Box>
        </Box>
      </Container>

      {/* Scroll Indicator */}
      <Box 
        sx={{ 
          position: 'absolute',
          bottom: { xs: 10, sm: 20, md: 30 },
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'bounce 2s infinite',
          zIndex: 3
        }}
      >
        <Box 
          sx={{ 
            width: 30,
            height: 50,
            border: '2px solid var(--accent-green)',
            borderRadius: 15,
            display: 'flex',
            justifyContent: 'center',
            '&::after': {
              content: '""',
              width: 4,
              height: 8,
              background: 'var(--accent-green)',
              borderRadius: 2,
              mt: 2,
              animation: 'scroll 2s infinite'
            }
          }}
        />
      </Box>

      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          40% {
            transform: translateX(-50%) translateY(-10px);
          }
          60% {
            transform: translateX(-50%) translateY(-5px);
          }
        }
        @keyframes scroll {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(20px);
          }
        }
      `}</style>
    </Box>
  );
} 