import React from 'react';
import { Box } from '@mui/material';
import Hero from './Hero';
import About from './About';
import Programs from './Programs';
import Testimonials from './Testimonials';
import Volunteer from './Volunteer';
import Donate from './Donate';
import FeedbackForm from './FeedbackForm';

export default function Home() {
  return (
    <Box component="main" sx={{ flex: 1, mt: 8 }}>
      <Hero />
      <About />
      <Programs />
      <Testimonials />
      <Volunteer />
      <Donate />
      <FeedbackForm />
    </Box>
  );
} 