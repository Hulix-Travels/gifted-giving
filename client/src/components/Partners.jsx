import React from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import { Business, Verified, Star, Public } from '@mui/icons-material';

const partners = [
  {
    name: "Global Education Foundation",
    type: "Education Partner",
    description: "Supporting educational initiatives in underserved communities worldwide",
    icon: <Business />,
    verified: true,
    category: "Education"
  },
  {
    name: "Health for All Initiative",
    type: "Healthcare Partner", 
    description: "Providing medical supplies and healthcare access to children in need",
    icon: <Business />,
    verified: true,
    category: "Healthcare"
  },
  {
    name: "United Nations Children's Fund",
    type: "International Partner",
    description: "Collaborating on global child welfare and development programs",
    icon: <Public />,
    verified: true,
    category: "International"
  },
  {
    name: "Tech for Good Foundation",
    type: "Technology Partner",
    description: "Supporting digital literacy and technology access programs",
    icon: <Business />,
    verified: true,
    category: "Technology"
  }
];

const certifications = [
  {
    name: "Charity Navigator 4-Star Rating",
    description: "Highest rating for financial accountability and transparency",
    icon: <Star />
  },
  {
    name: "Better Business Bureau Accredited",
    description: "Meeting high standards for trust and transparency",
    icon: <Verified />
  },
  {
    name: "GuideStar Platinum Seal",
    description: "Demonstrating commitment to transparency and accountability",
    icon: <Verified />
  }
];

export default function Partners() {
  return (
    <Box 
      sx={{ 
        py: { xs: 8, md: 12 },
        background: 'var(--white)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 80%, rgba(0,255,140,0.03) 0%, transparent 50%)',
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
            Trusted Partners & Certifications
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
            Working with leading organizations to maximize our impact
          </Typography>
        </Box>

        {/* Partners Section */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: 'var(--primary-green)',
              mb: 4,
              textAlign: 'center'
            }}
          >
            Our Partners
          </Typography>
          <Grid container spacing={4}>
            {partners.map((partner, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'var(--white)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    borderRadius: 3,
                    boxShadow: '0 2px 12px rgba(0,255,140,0.04)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,255,140,0.12)',
                      border: '1px solid var(--primary-green)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ color: 'var(--primary-green)', fontSize: '2rem' }}>
                        {partner.icon}
                      </Box>
                      {partner.verified && (
                        <Verified sx={{ color: 'var(--accent-green)', fontSize: '1.2rem' }} />
                      )}
                    </Box>
                    
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: 'var(--primary-green)',
                        mb: 1,
                        fontSize: '1.1rem'
                      }}
                    >
                      {partner.name}
                    </Typography>
                    
                    <Chip 
                      label={partner.type}
                      size="small"
                      sx={{
                        background: 'var(--light-green)',
                        color: 'var(--primary-green)',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        mb: 2,
                        alignSelf: 'flex-start'
                      }}
                    />
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'var(--gray)',
                        lineHeight: 1.6,
                        flexGrow: 1
                      }}
                    >
                      {partner.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Certifications Section */}
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: 'var(--primary-green)',
              mb: 4,
              textAlign: 'center'
            }}
          >
            Certifications & Recognition
          </Typography>
          <Grid container spacing={4}>
            {certifications.map((cert, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, var(--light-green), var(--white))',
                    border: '1px solid rgba(0,255,140,0.1)',
                    borderRadius: 3,
                    boxShadow: '0 2px 12px rgba(0,255,140,0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,255,140,0.15)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Box sx={{ color: 'var(--accent-green)', mb: 2, fontSize: '3rem' }}>
                      {cert.icon}
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: 'var(--primary-green)',
                        mb: 2,
                        fontSize: '1.2rem'
                      }}
                    >
                      {cert.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'var(--gray)',
                        lineHeight: 1.6
                      }}
                    >
                      {cert.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Trust Statement */}
        <Box 
          sx={{ 
            mt: 8,
            p: 4,
            background: 'linear-gradient(135deg, var(--light-green), var(--white))',
            borderRadius: 4,
            border: '1px solid rgba(0,255,140,0.1)',
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 700,
              color: 'var(--primary-green)',
              mb: 2
            }}
          >
            Your Trust is Our Foundation
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'var(--gray)',
              fontSize: '1.1rem',
              lineHeight: 1.6,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            We are committed to maintaining the highest standards of transparency, accountability, and impact. 
            Every donation is tracked, every program is monitored, and every result is reported.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
