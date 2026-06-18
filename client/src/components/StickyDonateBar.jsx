import React, { useEffect, useState } from 'react';
import { Box, Button, Slide } from '@mui/material';
import { Favorite } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function StickyDonateBar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isMobile || pathname !== '/') {
      setVisible(false);
      return;
    }

    const onScroll = () => {
      const donateEl = document.querySelector('#donate');
      const pastHero = window.scrollY > 320;
      const donateInView = donateEl
        ? donateEl.getBoundingClientRect().top < window.innerHeight * 0.85
        : false;
      setVisible(pastHero && !donateInView);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobile, pathname]);

  const scrollToDonate = () => {
    document.querySelector('#donate')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isMobile || pathname !== '/') return null;

  return (
    <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          px: 2,
          py: 1.5,
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          startIcon={<Favorite />}
          onClick={scrollToDonate}
          sx={{ py: 1.25, fontWeight: 600 }}
        >
          Donate Now
        </Button>
      </Box>
    </Slide>
  );
}
