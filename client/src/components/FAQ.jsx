import React, { useState } from 'react';
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails, Grid } from '@mui/material';
import { ExpandMore, HelpOutline, Payment, Security, Public, School } from '@mui/icons-material';

const faqs = [
  {
    question: "How do I know my donation is being used effectively?",
    answer: "We maintain complete transparency through regular impact reports, detailed program updates, and financial audits. Every donation is tracked and reported on our platform, showing exactly how your contribution is making a difference in children's lives.",
    icon: <Security />
  },
  {
    question: "What percentage of my donation goes directly to programs?",
    answer: "Over 90% of every donation goes directly to our programs. We keep administrative costs minimal and transparent, with only 8-10% used for essential operations like platform maintenance, staff, and program oversight.",
    icon: <Payment />
  },
  {
    question: "Can I choose which program my donation supports?",
    answer: "Yes! You can donate to specific programs like education, healthcare, or nutrition initiatives. You can also make a general donation that we'll allocate to the most urgent needs across all our programs.",
    icon: <School />
  },
  {
    question: "How do you ensure donations reach the right communities?",
    answer: "We work directly with local partners, community leaders, and verified organizations in each region. Our team conducts regular site visits and maintains close relationships with local stakeholders to ensure funds are used effectively.",
    icon: <Public />
  },
  {
    question: "Is my personal information secure?",
    answer: "Absolutely. We use bank-level encryption to protect your personal and payment information. We never share your data with third parties without your explicit consent, and you can update or delete your information at any time.",
    icon: <Security />
  },
  {
    question: "Can I volunteer with your organization?",
    answer: "Yes! We welcome volunteers for various roles including program coordination, fundraising, and community outreach. Visit our volunteer section to learn about current opportunities and how to get involved.",
    icon: <HelpOutline />
  },
  {
    question: "How often do you update donors on program progress?",
    answer: "We provide monthly impact reports to all donors, including photos, stories, and detailed metrics. You'll also receive real-time updates when your specific donations reach their targets or when programs achieve major milestones.",
    icon: <School />
  },
  {
    question: "What makes Gifted Giving different from other charities?",
    answer: "We focus on sustainable, community-driven solutions rather than short-term aid. Our programs are designed with local input, use technology for transparency, and prioritize long-term impact over quick fixes. Every program is measured for effectiveness and adjusted based on results.",
    icon: <Public />
  }
];

export default function FAQ() {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box 
      id="faq"
      sx={{ 
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(135deg, var(--light-gray) 0%, var(--white) 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 80% 20%, rgba(0,255,140,0.05) 0%, transparent 50%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Section Title */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 800,
              color: 'var(--primary-green)',
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'var(--gray)',
              maxWidth: 600,
              mx: 'auto',
              fontSize: '1.2rem',
              lineHeight: 1.6
            }}
          >
            Everything you need to know about donating and making a difference
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8} sx={{ mx: 'auto' }}>
            {faqs.map((faq, index) => (
              <Accordion
                key={index}
                expanded={expanded === `panel${index}`}
                onChange={handleChange(`panel${index}`)}
                sx={{
                  mb: 2,
                  borderRadius: 3,
                  boxShadow: '0 2px 12px rgba(0,255,140,0.08)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  '&:before': {
                    display: 'none',
                  },
                  '&.Mui-expanded': {
                    margin: '0 0 16px 0',
                    boxShadow: '0 4px 20px rgba(0,255,140,0.12)',
                    border: '1px solid var(--primary-green)',
                  },
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(0,255,140,0.12)',
                  }
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: 'var(--primary-green)' }} />}
                  sx={{
                    py: 2,
                    px: 3,
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center',
                      gap: 2
                    },
                    '&.Mui-expanded': {
                      backgroundColor: 'rgba(0,255,140,0.05)',
                    }
                  }}
                >
                  <Box sx={{ color: 'var(--primary-green)', display: 'flex', alignItems: 'center' }}>
                    {faq.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'var(--primary-green)',
                      fontSize: '1.1rem'
                    }}
                  >
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 3 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'var(--gray)',
                      lineHeight: 1.7,
                      fontSize: '1rem'
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Grid>
        </Grid>

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
            Still have questions?
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4,
              color: 'var(--gray)',
              fontSize: '1.1rem',
              maxWidth: 500,
              mx: 'auto'
            }}
          >
            Our team is here to help. Reach out to us directly for personalized assistance.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
