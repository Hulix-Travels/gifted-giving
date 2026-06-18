import React, { useState } from 'react';
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import SectionHeader from './ui/SectionHeader';
import { sectionWhite } from '../theme/styles';

const faqs = [
  {
    question: 'How do I know my donation is being used effectively?',
    answer:
      'We maintain complete transparency through regular impact reports, detailed program updates, and financial audits. Every donation is tracked and reported on our platform.'
  },
  {
    question: 'What percentage of my donation goes directly to programs?',
    answer:
      'Over 90% of every donation goes directly to our programs. Administrative costs are kept minimal and reported openly.'
  },
  {
    question: 'Can I choose which program my donation supports?',
    answer:
      'Yes. You can donate to specific education, healthcare, or nutrition programs, or make a general gift we allocate to the most urgent needs.'
  },
  {
    question: 'How do you ensure donations reach the right communities?',
    answer:
      'We work directly with local partners, community leaders, and verified organizations. Our team conducts regular site visits and maintains close relationships with local stakeholders.'
  },
  {
    question: 'Is my personal information secure?',
    answer:
      'Yes. We use bank-level encryption for personal and payment information. We never share your data without your explicit consent.'
  },
  {
    question: 'Can I volunteer with your organization?',
    answer:
      'Yes. Visit our Volunteer page to apply for program coordination, fundraising, community outreach, and other roles.'
  },
  {
    question: 'How often do you update donors on program progress?',
    answer:
      'Donors receive monthly impact reports with photos, stories, and metrics. You also get updates when programs reach milestones.'
  },
  {
    question: 'What makes Gifted givings different from other charities?',
    answer:
      'We focus on sustainable, community-driven solutions with local input, transparent reporting, and long-term measurement of results.'
  }
];

export default function FAQ() {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box id="faq" sx={sectionWhite}>
      <Container maxWidth="md">
        <SectionHeader
          title="Frequently asked questions"
          subtitle="Clear answers about giving, programs, and how we work."
        />

        <Box sx={{ maxWidth: 720, mx: 'auto' }}>
          {faqs.map((faq, index) => (
            <Accordion
              key={faq.question}
              expanded={expanded === `panel${index}`}
              onChange={handleChange(`panel${index}`)}
              disableGutters
              elevation={0}
              sx={{
                mb: 1.5,
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--white)',
                '&:before': { display: 'none' },
                '&.Mui-expanded': {
                  borderColor: 'var(--accent-green)',
                  backgroundColor: 'var(--light-green)'
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: 'var(--primary-green)' }} />}
                sx={{
                  px: 2.5,
                  py: 0.5,
                  minHeight: 52,
                  '& .MuiAccordionSummary-content': { my: 1.25 }
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: 'var(--primary-green)',
                    fontSize: '1rem',
                    lineHeight: 1.45
                  }}
                >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2 }}>
                <Typography variant="body2" sx={{ color: 'var(--gray)', lineHeight: 1.7 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Typography
          variant="body2"
          sx={{ textAlign: 'center', mt: 5, color: 'var(--gray)' }}
        >
          Still have questions?{' '}
          <Box
            component="a"
            href="#contact"
            sx={{ color: 'var(--accent-green)', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Contact us
          </Box>
        </Typography>
      </Container>
    </Box>
  );
}
