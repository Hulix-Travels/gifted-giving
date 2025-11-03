import React, { useState } from 'react';
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
  FormHelperText,
  Paper
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
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RhMg2QR8d2LcBasSx0AiTAeNQFbOmavHh8q9LvE9OyAd8Y2MawJ0LMgWq6dppC3k1nEpLE50AznemCnWLC7MlLZ00Zumt7zZj');

// Card brand information with original colors
const CARD_BRANDS = {
  visa: { 
    name: 'Visa', 
    color: '#1434CB',
    bgGradient: 'linear-gradient(135deg, #1434CB 0%, #1A5FCC 100%)',
    textColor: '#FFFFFF'
  },
  mastercard: { 
    name: 'Mastercard', 
    color: '#EB001B',
    bgGradient: 'linear-gradient(135deg, #EB001B 0%, #F79E1B 100%)',
    textColor: '#FFFFFF'
  },
  amex: { 
    name: 'American Express', 
    color: '#006FCF',
    bgGradient: 'linear-gradient(135deg, #006FCF 0%, #009CDE 100%)',
    textColor: '#FFFFFF'
  },
  discover: { 
    name: 'Discover', 
    color: '#FF6000',
    bgGradient: 'linear-gradient(135deg, #FF6000 0%, #FF7900 100%)',
    textColor: '#FFFFFF'
  },
  diners: { 
    name: 'Diners Club', 
    color: '#0079BE',
    bgGradient: 'linear-gradient(135deg, #0079BE 0%, #0085CC 100%)',
    textColor: '#FFFFFF'
  },
  jcb: { 
    name: 'JCB', 
    color: '#0E4C96',
    bgGradient: 'linear-gradient(135deg, #0E4C96 0%, #1055A6 100%)',
    textColor: '#FFFFFF'
  },
  unionpay: { 
    name: 'UnionPay', 
    color: '#E21836',
    bgGradient: 'linear-gradient(135deg, #E21836 0%, #F52D4A 100%)',
    textColor: '#FFFFFF'
  },
  unknown: { 
    name: 'Card', 
    color: '#666',
    bgGradient: 'linear-gradient(135deg, #666 0%, #777 100%)',
    textColor: '#FFFFFF'
  }
};

// Supported card types to display
const SUPPORTED_CARDS = ['visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unionpay'];

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#333',
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#d32f2f',
      iconColor: '#d32f2f',
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
  const [detectedCardBrand, setDetectedCardBrand] = useState(null);
  const [cardErrors, setCardErrors] = useState({
    cardNumber: null,
    cardExpiry: null,
    cardCvc: null
  });
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

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
    setCardComplete(prev => ({
      ...prev,
      [field]: event.complete
    }));

    // Detect card brand for card number field
    if (field === 'cardNumber') {
      if (event.brand && event.brand !== 'unknown') {
        setDetectedCardBrand(event.brand);
      } else if (event.empty) {
        setDetectedCardBrand(null);
      }
    }

    // Handle errors
    if (event.error) {
      setCardErrors(prev => ({
        ...prev,
        [field]: event.error.message
      }));
      setValidationErrors(prev => ({
        ...prev,
        [field]: event.error.message
      }));
    } else {
      setCardErrors(prev => ({
        ...prev,
        [field]: null
      }));
      if (validationErrors[field]) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const getCardBrandInfo = (brand) => {
    if (!brand) return CARD_BRANDS.unknown;
    return CARD_BRANDS[brand] || CARD_BRANDS.unknown;
  };

  const renderCardBrandIcon = (brand) => {
    const brandInfo = getCardBrandInfo(brand);
    
    // Mastercard has a special two-circle design
    if (brand === 'mastercard') {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 28,
            borderRadius: 1.5,
            position: 'relative',
            overflow: 'hidden',
            bgcolor: '#000',
          }}
          title={brandInfo.name}
        >
          <Box
            sx={{
              position: 'absolute',
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: '#EB001B',
              left: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: '#F79E1B',
              right: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 0,
            }}
          />
        </Box>
      );
    }
    
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 28,
          borderRadius: 1.5,
          background: brandInfo.bgGradient,
          color: brandInfo.textColor,
          fontSize: brand === 'amex' ? '8px' : brand === 'discover' ? '9px' : '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
        title={brandInfo.name}
      >
        {brand === 'visa' ? 'VISA' : 
         brand === 'amex' ? 'AMEX' :
         brand === 'discover' ? 'DISC' :
         brand === 'diners' ? 'DC' :
         brand === 'jcb' ? 'JCB' :
         brand === 'unionpay' ? 'UP' : 'CARD'}
      </Box>
    );
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
          Pay {amount && amount > 0 ? new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase()
          }).format(amount) : '$0.00'}
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
      // Validate amount before making request
      if (!amount || amount < 0.5) {
        setError('Minimum donation amount is $0.50');
        setLoading(false);
        return;
      }

      // Validate program ID
      if (!donationData.programId) {
        setError('Please select a program before making a donation');
        setLoading(false);
        return;
      }

      console.log('Creating payment intent with data:', {
        amount,
        currency,
        programId: donationData.programId,
        anonymous: donationData.anonymous,
        recurring: donationData.recurring
      });

      // Create payment intent or subscription on the server
      // Backend will validate authentication for recurring donations
      const response = await stripeAPI.createPaymentIntent({
        amount: parseFloat(amount), // Ensure it's a number
        currency,
        programId: donationData.programId,
        anonymous: donationData.anonymous,
        message: donationData.message,
        recurring: donationData.recurring,
        email: donorInfo.email // Pass email for customer creation in recurring donations
      });

      console.log('Payment intent response:', response);

      // Check for authentication error for recurring donations
      if (response.message && response.message.includes('Authentication required')) {
        setError(response.message);
        onError && onError(response.message);
        setLoading(false);
        return;
      }

      // Check for validation errors
      if (response.errors && response.errors.length > 0) {
        const errorMessages = response.errors.map(err => err.msg || err.message).join(', ');
        setError(`Validation error: ${errorMessages}`);
        onError && onError(errorMessages);
        setLoading(false);
        return;
      }

      const { clientSecret, paymentIntentId, donationId, isSubscription, subscriptionId } = response;
      
      if (!clientSecret) {
        const errorMsg = response.message || response.error || 'Failed to create payment intent. Please check your Stripe configuration.';
        console.error('No client secret returned:', response);
        setError(errorMsg);
        onError && onError(errorMsg);
        setLoading(false);
        return;
      }

      // Confirm the payment with Stripe (works for both payment intents and subscription invoices)
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
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setSuccess(true);
        onSuccess && onSuccess({
          paymentIntentId,
          donationId,
          amount,
          currency,
          status: 'completed',
          donorInfo,
          isSubscription: isSubscription || false,
          subscriptionId: subscriptionId || null
        });
      }
    } catch (err) {
      console.error('Payment intent creation error:', err);
      let errorMessage = 'Payment failed. Please try again.';
      
      // Provide more specific error messages
      if (err.message) {
        errorMessage = err.message;
      } else if (err.responseData) {
        errorMessage = err.responseData.message || err.responseData.error || errorMessage;
        if (err.responseData.errors && Array.isArray(err.responseData.errors)) {
          const validationErrors = err.responseData.errors.map(e => e.msg || e.message).join(', ');
          errorMessage = `Validation error: ${validationErrors}`;
        }
      } else if (err.status === 400) {
        errorMessage = 'Invalid payment information. Please check your details and try again.';
      } else if (err.status === 500) {
        errorMessage = 'Server error. Please try again later or contact support if the problem persists.';
      }
      
      setError(errorMessage);
      onError && onError(errorMessage);
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
        {donationData.recurring?.isRecurring && (
          <Typography variant="body2" sx={{ color: '#4CAF50', mb: 1, fontWeight: 600 }}>
            ✓ Recurring donation set up successfully
          </Typography>
        )}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#fff',
                    '& fieldset': {
                      borderColor: validationErrors.name ? '#d32f2f' : '#e0e0e0',
                      borderWidth: '1px',
                    },
                    '&:hover fieldset': {
                      borderColor: validationErrors.name ? '#d32f2f' : '#bdbdbd',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: validationErrors.name ? '#d32f2f' : '#333',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.95rem',
                  },
                  '& .MuiInputBase-input': {
                    padding: '14px 16px',
                    fontSize: '16px',
                  },
                }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#fff',
                    '& fieldset': {
                      borderColor: validationErrors.email ? '#d32f2f' : '#e0e0e0',
                      borderWidth: '1px',
                    },
                    '&:hover fieldset': {
                      borderColor: validationErrors.email ? '#d32f2f' : '#bdbdbd',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: validationErrors.email ? '#d32f2f' : '#333',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.95rem',
                  },
                  '& .MuiInputBase-input': {
                    padding: '14px 16px',
                    fontSize: '16px',
                  },
                }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#fff',
                    '& fieldset': {
                      borderColor: validationErrors.phone ? '#d32f2f' : '#e0e0e0',
                      borderWidth: '1px',
                    },
                    '&:hover fieldset': {
                      borderColor: validationErrors.phone ? '#d32f2f' : '#bdbdbd',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: validationErrors.phone ? '#d32f2f' : '#333',
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.95rem',
                  },
                  '& .MuiInputBase-input': {
                    padding: '14px 16px',
                    fontSize: '16px',
                  },
                }}
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
          
          {/* Unified Card Input Container */}
              <Box sx={{ position: 'relative' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 0,
                  width: '100%',
                  border: (cardErrors.cardNumber || cardErrors.cardExpiry || cardErrors.cardCvc) 
                    ? '2px solid #d32f2f' 
                    : '1px solid #e0e0e0',
                  borderRadius: 3,
                  bgcolor: '#fff',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#bdbdbd',
                  },
                  '&:focus-within': {
                    borderColor: '#333',
                    borderWidth: '2px',
                  },
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  width: '100%',
                  gap: 0,
                }}>
                  {/* Card Icon/Brand Logo */}
                  <Box sx={{ 
                    pl: 2, 
                    pr: 1.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {detectedCardBrand ? (
                      renderCardBrandIcon(detectedCardBrand)
                    ) : (
                      <CreditCard sx={{ color: '#999', fontSize: 24 }} />
                    )}
                  </Box>
                  
                  {/* Card Number Field */}
                  <Box sx={{ flex: '1 1 auto', minWidth: 0, position: 'relative' }}>
                    <Box
                      sx={{
                        width: '100%',
                        '& .StripeElement': {
                          width: '100%',
                          padding: '14px 12px 14px 0',
                        },
                        '& .StripeElement input': {
                          width: '100%',
                          fontSize: '16px',
                        },
                        '& iframe': {
                          width: '100% !important',
                        },
                      }}
                    >
                <CardNumberElement 
                  options={CARD_ELEMENT_OPTIONS}
                  onChange={handleCardChange('cardNumber')}
                />
                    </Box>
              </Box>
                  
                  {/* Divider */}
                  <Box sx={{ 
                    width: '1px', 
                    height: '32px', 
                    bgcolor: '#e0e0e0',
                    flexShrink: 0,
                  }} />
                  
                  {/* Expiry Date Field */}
                  <Box sx={{ 
                    flex: '0 0 100px',
                    minWidth: 0,
                    position: 'relative',
                  }}>
                    <Box
                      sx={{
                        width: '100%',
                        '& .StripeElement': {
                          width: '100%',
                          padding: '14px 12px',
                        },
                        '& .StripeElement input': {
                          width: '100%',
                          fontSize: '16px',
                        },
                        '& iframe': {
                          width: '100% !important',
                        },
                      }}
                    >
                <CardExpiryElement 
                  options={CARD_ELEMENT_OPTIONS}
                  onChange={handleCardChange('cardExpiry')}
                />
                    </Box>
              </Box>
                  
                  {/* Divider */}
                  <Box sx={{ 
                    width: '1px', 
                    height: '32px', 
                    bgcolor: '#e0e0e0',
                    flexShrink: 0,
                  }} />
                  
                  {/* CVC Field */}
                  <Box sx={{ 
                    flex: '0 0 80px',
                    minWidth: 0,
                    position: 'relative',
                  }}>
                    <Box
                      sx={{
                        width: '100%',
                        '& .StripeElement': {
                          width: '100%',
                          padding: '14px 16px 14px 12px',
                        },
                        '& .StripeElement input': {
                          width: '100%',
                          fontSize: '16px',
                        },
                        '& iframe': {
                          width: '100% !important',
                        },
                      }}
                    >
                <CardCvcElement 
                  options={CARD_ELEMENT_OPTIONS}
                  onChange={handleCardChange('cardCvc')}
                />
                    </Box>
                  </Box>
                </Box>
              </Paper>
              
              {/* Error Messages */}
              {(validationErrors.cardNumber || cardErrors.cardNumber) && (
                <FormHelperText error sx={{ mt: 1, ml: 0 }}>
                  {validationErrors.cardNumber || cardErrors.cardNumber}
                </FormHelperText>
              )}
              {(validationErrors.cardExpiry || cardErrors.cardExpiry) && (
                <FormHelperText error sx={{ mt: 1, ml: 0 }}>
                  {validationErrors.cardExpiry || cardErrors.cardExpiry}
                </FormHelperText>
              )}
              {(validationErrors.cardCvc || cardErrors.cardCvc) && (
                <FormHelperText error sx={{ mt: 1, ml: 0 }}>
                  {validationErrors.cardCvc || cardErrors.cardCvc}
                  </FormHelperText>
                )}
              </Box>
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