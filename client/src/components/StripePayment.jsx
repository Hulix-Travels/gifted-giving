import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import {
  CreditCard,
  CheckCircle,
  Error,
  Security,
  Lock,
  Payment
} from '@mui/icons-material';
import { stripeAPI } from '../services/api';

// Load Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51RhMg2QR8d2LcBasSx0AiTAeNQFbOmavHh8q9LvE9OyAd8Y2MawJ0LMgWq6dppC3k1nEpLE50AznemCnWLC7MlLZ00Zumt7zZj');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

function CheckoutForm({ amount, currency = 'usd', onSuccess, onError, donationData }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [cardComplete, setCardComplete] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false
  });
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Debug logging
  useEffect(() => {
    console.log('Stripe loaded:', !!stripe);
    console.log('Elements loaded:', !!elements);
    console.log('Amount:', amount);
    console.log('Currency:', currency);
  }, [stripe, elements, amount, currency]);

  // Check if all required fields are complete
  const isFormComplete = () => {
    return (
      cardComplete.cardNumber &&
      cardComplete.cardExpiry &&
      cardComplete.cardCvc &&
      donorInfo.name.trim() &&
      donorInfo.email.trim() &&
      donorInfo.phone.trim()
    );
  };

  const handleCardChange = (field) => (event) => {
    console.log(`Card ${field} changed:`, event.complete);
    setCardComplete(prev => ({
      ...prev,
      [field]: event.complete
    }));
  };

  const handleDonorInfoChange = (field) => (event) => {
    setDonorInfo(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!donorInfo.name.trim()) {
      errors.name = 'Full name is required';
    }
    
    if (!donorInfo.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(donorInfo.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!donorInfo.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(donorInfo.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!cardComplete.cardNumber) {
      errors.cardNumber = 'Please enter your card number';
    }
    
    if (!cardComplete.cardExpiry) {
      errors.cardExpiry = 'Please enter card expiry date';
    }
    
    if (!cardComplete.cardCvc) {
      errors.cardCvc = 'Please enter CVC';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const renderButtonContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} color="inherit" />
          Processing Payment...
        </Box>
      );
    } else {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Lock />
          Pay {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase()
          }).format(amount)}
        </Box>
      );
    }
  };

  const _renderButtonIcon = () => {
    return <Lock />;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe is not loaded. Please refresh the page.');
      return;
    }

    // Validate form before proceeding
    if (!validateForm()) {
      setError('Please fill in all required fields correctly.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create payment intent on the server
      const { clientSecret, paymentIntentId, donationId } = await stripeAPI.createPaymentIntent({
        amount,
        currency,
        programId: donationData.programId,
        anonymous: donationData.anonymous,
        message: donationData.message,
        recurring: donationData.recurring
      });

      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: donorInfo.name,
            email: donorInfo.email,
            phone: donorInfo.phone
          },
        }
      });

      if (stripeError) {
        setError(stripeError.message);
        onError && onError(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        setSuccess(true);
        onSuccess && onSuccess({
          paymentIntentId,
          donationId,
          amount,
          currency,
          status: 'completed',
          donorInfo
        });
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      onError && onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box textAlign="center" py={4}>
        <CheckCircle sx={{ fontSize: 60, color: '#4CAF50', mb: 2 }} />
        <Typography variant="h5" sx={{ mb: 2, color: '#4CAF50' }}>
          Payment Successful!
        </Typography>
        <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
          Thank you for your donation of {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase()
          }).format(amount)}.
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          You will receive a confirmation email shortly.
        </Typography>
      </Box>
    );
  }

  // Show loading if Stripe is not ready
  if (!stripe || !elements) {
    return (
      <Box textAlign="center" py={4}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>
          Loading Payment Form...
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Please wait while we load the secure payment form.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 3, background: '#f8f9fa' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security />
            Secure Payment
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            Your payment information is encrypted and secure. All transactions are protected by bank-level security.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip label="SSL Encrypted" size="small" color="success" />
            <Chip label="PCI Compliant" size="small" color="success" />
            <Chip label="3D Secure" size="small" color="success" />
            <Chip label="Stripe Powered" size="small" color="primary" />
          </Box>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        {/* Donor Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Payment />
            Donor Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name *"
                value={donorInfo.name}
                onChange={handleDonorInfoChange('name')}
                error={!!validationErrors.name}
                helperText={validationErrors.name}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address *"
                type="email"
                value={donorInfo.email}
                onChange={handleDonorInfoChange('email')}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number *"
                value={donorInfo.phone}
                onChange={handleDonorInfoChange('phone')}
                error={!!validationErrors.phone}
                helperText={validationErrors.phone || 'Include country code (e.g., +1234567890)'}
                required
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Card Information */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CreditCard />
            Card Information
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
            Please enter your card details. Your bank may require additional verification.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ position: 'relative' }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Card Number *
                </Typography>
                <CardNumberElement 
                  options={CARD_ELEMENT_OPTIONS}
                  onChange={handleCardChange('cardNumber')}
                />
                {validationErrors.cardNumber && (
                  <FormHelperText error sx={{ mt: 1 }}>
                    {validationErrors.cardNumber}
                  </FormHelperText>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Expiry Date *
                </Typography>
                <CardExpiryElement 
                  options={CARD_ELEMENT_OPTIONS}
                  onChange={handleCardChange('cardExpiry')}
                />
                {validationErrors.cardExpiry && (
                  <FormHelperText error sx={{ mt: 1 }}>
                    {validationErrors.cardExpiry}
                  </FormHelperText>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative' }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  CVC *
                </Typography>
                <CardCvcElement 
                  options={CARD_ELEMENT_OPTIONS}
                  onChange={handleCardChange('cardCvc')}
                />
                {validationErrors.cardCvc && (
                  <FormHelperText error sx={{ mt: 1 }}>
                    {validationErrors.cardCvc}
                  </FormHelperText>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={!stripe || loading || !isFormComplete()}
          sx={{
            background: 'var(--primary-green)',
            color: 'white',
            fontWeight: 700,
            borderRadius: 3,
            py: 2,
            fontSize: '1.1rem',
            '&:hover': { background: '#00e67a' },
            '&:disabled': { background: '#ccc' }
          }}
        >
          {renderButtonContent()}
        </Button>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: '#666' }}>
          By clicking "Pay", you authorize this transaction and agree to our terms of service.
        </Typography>

        {/* Test Card Information */}
        <Card sx={{ mt: 3, background: '#fff3cd', border: '1px solid #ffeaa7' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: '#856404', display: 'flex', alignItems: 'center', gap: 1 }}>
              <CreditCard />
              Test Card Information
            </Typography>
            <Typography variant="body2" sx={{ color: '#856404', mb: 2 }}>
              Use these test card details to simulate payments (no real charges will be made):
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#856404' }}>
                  Successful Payment:
                </Typography>
                <Typography variant="caption" sx={{ color: '#856404' }}>
                  Card: 4242 4242 4242 4242<br/>
                  Expiry: Any future date<br/>
                  CVC: Any 3 digits
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#856404' }}>
                  Requires Authentication:
                </Typography>
                <Typography variant="caption" sx={{ color: '#856404' }}>
                  Card: 4000 0025 0000 3155<br/>
                  Expiry: Any future date<br/>
                  CVC: Any 3 digits
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </form>
    </Box>
  );
}

export default function StripePayment({ amount, currency, onSuccess, onError, donationData }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        amount={amount}
        currency={currency}
        onSuccess={onSuccess}
        onError={onError}
        donationData={donationData}
      />
    </Elements>
  );
} 