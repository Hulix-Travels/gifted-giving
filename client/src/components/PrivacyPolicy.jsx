import React from 'react';
import { Box, Container, Typography, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CONTACT_EMAIL, CONTACT_ADDRESS } from '../constants/contact';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: { xs: 10, md: 12 }, mt: 8, background: 'var(--light-gray)', minHeight: '60vh' }}>
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'var(--primary-green)', mb: 3 }}>
              Privacy Policy
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Last updated: June 2025
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Information we collect</Typography>
            <Typography paragraph>
              When you donate, register, volunteer, or subscribe to our newsletter, we may collect your name,
              email address, payment details (processed securely by Stripe), and any information you choose to provide.
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>How we use your information</Typography>
            <Typography paragraph>
              We use your information to process donations, send receipts and updates, manage your account,
              respond to inquiries, and improve our programs. We do not sell your personal data to third parties.
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Payment security</Typography>
            <Typography paragraph>
              All card payments are handled by Stripe. Gifted givings does not store full credit card numbers on our servers.
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Your choices</Typography>
            <Typography paragraph>
              You may update your profile, unsubscribe from emails, or contact us to request deletion of your account data,
              subject to legal and financial record-keeping requirements.
            </Typography>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Contact</Typography>
            <Typography paragraph>
              Questions about this policy? Email us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or write to {CONTACT_ADDRESS}.
            </Typography>

            <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2, background: 'var(--primary-green)' }}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
