import React, { useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Button, 
  Link
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  AccessTime
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_TEL,
  CONTACT_ADDRESS,
  CONTACT_HOURS
} from '../constants/contact';

export default function Footer() {
  const navigate = useNavigate();

  // Handle smooth scrolling to sections
  const scrollToSection = (sectionId) => {
    // Check if we're on the home page
    if (window.location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home page with hash
      navigate(`/#${sectionId}`);
    }
  };

  const handleQuickLink = (link) => {
    if (link.path) {
      navigate(link.path);
      return;
    }
    scrollToSection(link.sectionId);
  };

  // Quick links configuration
  const quickLinks = [
    { name: 'About Us', sectionId: 'about' },
    { name: 'Our Programs', sectionId: 'programs' },
    { name: 'Success Stories', sectionId: 'stories' },
    { name: 'Ways to Give', sectionId: 'donate' },
    { name: 'Volunteer', path: '/volunteer' },
    { name: 'FAQ', sectionId: 'faq' }
  ];

  return (
    <Box 
      id="contact" 
      sx={{ 
        backgroundColor: 'var(--primary-green)',
        color: '#fff', 
        py: 6
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Organization Info */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#fff', fontSize: '1.2rem' }}>
              Gifted givings
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
              Empowering children through education, health, and opportunity since 2020.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#fff', fontSize: '1.2rem' }}>
              Quick Links
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {quickLinks.map((link) => (
                <Box component="li" key={link.name} sx={{ mb: 1.5 }}>
                  <Link 
                    component="button"
                    onClick={() => handleQuickLink(link)}
                    sx={{ 
                      color: 'rgba(255,255,255,0.85)', 
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontFamily: 'inherit',
                      fontWeight: 500,
                      display: 'block',
                      textAlign: 'left',
                      width: '100%',
                      '&:hover': { 
                        color: 'var(--accent-sage)',
                        transform: 'translateX(4px)',
                        transition: 'all 0.2s ease'
                      }
                    }}
                  >
                    {link.name}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#fff', fontSize: '1.2rem' }}>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <LocationOn sx={{ fontSize: 20, color: 'var(--accent-sage)', mt: 0.2 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  {CONTACT_ADDRESS}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Phone sx={{ fontSize: 20, color: 'var(--accent-sage)' }} />
                <Link 
                  href={`tel:${CONTACT_PHONE_TEL}`}
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    '&:hover': { 
                      color: 'var(--accent-sage)',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {CONTACT_PHONE_DISPLAY}
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Email sx={{ fontSize: 20, color: 'var(--accent-sage)', mt: 0.2 }} />
                <Link 
                  href={`mailto:${CONTACT_EMAIL}`}
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    lineHeight: 1.4,
                    '&:hover': { 
                      color: 'var(--accent-sage)',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {CONTACT_EMAIL}
                </Link>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AccessTime sx={{ fontSize: 20, color: 'var(--accent-sage)' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
                  {CONTACT_HOURS}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Newsletter */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#fff', fontSize: '1.2rem' }}>
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6, color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
              Subscribe on our homepage to receive updates on our work and how you can help.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => scrollToSection('newsletter')}
              sx={{ fontWeight: 600, py: 1.25, px: 3 }}
            >
              Subscribe to Newsletter
            </Button>
          </Grid>
        </Grid>

        {/* Footer Bottom */}
        <Box sx={{ 
          borderTop: '1px solid rgba(255,255,255,0.2)', 
          mt: 4, 
          pt: 3,
          textAlign: 'center'
        }}>
          <Typography variant="body2" sx={{ 
            color: 'rgba(255,255,255,0.85)', 
            fontSize: '0.9rem',
            lineHeight: 1.6
          }}>
            © 2025 Gifted givings. All rights reserved. |
            <Link component={RouterLink} to="/privacy" sx={{
              color: 'rgba(255,255,255,0.85)', 
              ml: 1,
              textDecoration: 'none',
              '&:hover': { 
                color: 'var(--accent-sage)',
                textDecoration: 'underline'
              }
            }}>
              Privacy Policy
            </Link>
            |
            <Link
              component={RouterLink}
              to="/financial-reports"
              onClick={() => {
                window.scrollTo(0, 0);
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
              }}
              sx={{
              color: 'rgba(255,255,255,0.85)', 
              ml: 1,
              textDecoration: 'none',
              '&:hover': { 
                color: 'var(--accent-sage)',
                textDecoration: 'underline'
              }
            }}>
              Financial Reports
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
} 