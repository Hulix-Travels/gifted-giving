import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import Hero from './Hero';
import About from './About';
import Programs from './Programs';
import Testimonials from './Testimonials';
// import Partners from './Partners';
import FAQ from './FAQ';
import Newsletter from './Newsletter';
import Volunteer from './Volunteer';
import Donate from './Donate';
import FeedbackForm from './FeedbackForm';

export default function Home() {
  useEffect(() => {
    // Handle hash scrolling when navigating from other pages
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    };

    // Check for hash on component mount
    handleHashScroll();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashScroll);
    
    return () => {
      window.removeEventListener('hashchange', handleHashScroll);
    };
  }, []);

  return (
    <Box component="main" sx={{ flex: 1, mt: 8 }}>
      <Hero />
      <About />
      <Programs />
      <Donate />
      <Testimonials />
      {/* <Partners /> */}
      <FAQ />
      <Newsletter />
      <Volunteer />
      <FeedbackForm />
    </Box>
  );
} 