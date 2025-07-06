import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  TextField, 
  Button, 
  Link,
  IconButton
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  LocationOn,
  Phone,
  Email,
  AccessTime
} from '@mui/icons-material';

export default function Footer() {
  return (
    <Box id="contact" sx={{ bgcolor: '#01371f', color: '#fff', py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Organization Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Gifted Giving
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
              Empowering children through education, health, and opportunity since 2020.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: '#fff' }}>
                <Facebook />
              </IconButton>
              <IconButton size="small" sx={{ color: '#fff' }}>
                <Twitter />
              </IconButton>
              <IconButton size="small" sx={{ color: '#fff' }}>
                <Instagram />
              </IconButton>
              <IconButton size="small" sx={{ color: '#fff' }}>
                <LinkedIn />
              </IconButton>
              <IconButton size="small" sx={{ color: '#fff' }}>
                <YouTube />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Quick Links
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {['About Us', 'Our Programs', 'Success Stories', 'Ways to Give', 'Volunteer'].map((link) => (
                <Box component="li" key={link} sx={{ mb: 1 }}>
                  <Link href="#" sx={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    textDecoration: 'none',
                    '&:hover': { color: '#00ff8c' }
                  }}>
                    {link}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  123 Buganda Road, Kampala, Uganda
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  +1(978)-382-3964
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  giftedhands1256@gmail.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  Mon-Fri: 9AM - 5PM EAT
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
              Subscribe to receive updates on our work and how you can help.
            </Typography>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Your email address"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#00ff8c' }
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: 'rgba(255,255,255,0.7)',
                    opacity: 1
                  }
                }}
              />
              <Button
                variant="contained"
                sx={{
                  background: '#00ff8c',
                  color: '#01371f',
                  fontWeight: 700,
                  '&:hover': { background: '#00e67a' }
                }}
              >
                Subscribe
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Footer Bottom */}
        <Box sx={{ 
          borderTop: '1px solid rgba(255,255,255,0.1)', 
          mt: 4, 
          pt: 3,
          textAlign: 'center'
        }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            © 2025 Gifted Giving. All rights reserved. | Registered NGO #12345 |
            <Link href="#" sx={{ color: 'rgba(255,255,255,0.7)', ml: 1 }}>
              Privacy Policy
            </Link>
            |
            <Link href="#" sx={{ color: 'rgba(255,255,255,0.7)', ml: 1 }}>
              Financial Reports
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
} 