import React, { useState } from 'react';
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
  TextField,
  FormHelperText
} from '@mui/material';
import { CreditCard, CheckCircle } from '@mui/icons-material';
import { stripeAPI } from '../services/api';
import { stripePromise } from '../config/stripe';
import FormSection from './ui/FormSection';
import { fieldSx } from '../theme/styles';

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
      color: '#1D1D1D',
      fontFamily: '"IBM Plex Sans", system-ui, -apple-system, sans-serif',
      lineHeight: '24px',
      '::placeholder': {
        color: '#9CA3AF'
      }
    },
    invalid: {
      color: '#d32f2f',
      iconColor: '#d32f2f'
    }
  }
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
  const [guestEmail, setGuestEmail] = useState('');

  const isLoggedIn = Boolean(donationData?.isLoggedIn);

  const getBillingDetails = () => {
    if (isLoggedIn) {
      const billing = {
        name: donationData?.donorName?.trim() || undefined,
        email: donationData?.email?.trim() || undefined
      };
      const phone = donationData?.phone?.trim();
      if (phone) {
        billing.phone = phone;
      }
      return billing;
    }

    return {
      name: 'Anonymous Donor',
      email: guestEmail.trim()
    };
  };

  // Check if all required fields are complete
  const isFormComplete = () => {
    const contactReady = isLoggedIn || /\S+@\S+\.\S+/.test(guestEmail.trim());
    return (
      cardComplete.cardNumber &&
      cardComplete.cardExpiry &&
      cardComplete.cardCvc &&
      contactReady
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

  const handleGuestEmailChange = (event) => {
    setGuestEmail(event.target.value);

    if (validationErrors.email) {
      setValidationErrors((prev) => ({
        ...prev,
        email: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!isLoggedIn) {
      if (!guestEmail.trim()) {
        errors.email = 'Email is required for your receipt';
      } else if (!/\S+@\S+\.\S+/.test(guestEmail.trim())) {
        errors.email = 'Please enter a valid email address';
      }
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CircularProgress size={20} color="inherit" />
          Processing…
        </Box>
      );
    }

    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount && amount > 0 ? amount : 0);

    if (donationData.recurring?.isRecurring) {
      return `Donate ${formattedAmount} ${donationData.recurring.frequency}`;
    }

    return `Donate ${formattedAmount}`;
  };

  const cardNumberError = validationErrors.cardNumber || cardErrors.cardNumber;
  const cardExpiryError = validationErrors.cardExpiry || cardErrors.cardExpiry;
  const cardCvcError = validationErrors.cardCvc || cardErrors.cardCvc;
  const cardFieldError = cardNumberError || cardExpiryError || cardCvcError;
  const hasCardError = Boolean(cardFieldError);

  const stripeElementSx = {
    width: '100%',
    minWidth: 0,
    '& .StripeElement': {
      width: '100%'
    },
    '& iframe': {
      width: '100% !important',
      minHeight: '24px !important'
    }
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

      if (import.meta.env.DEV) {
        console.log('Creating payment intent with data:', {
          amount,
          currency,
          programId: donationData.programId,
          anonymous: donationData.anonymous,
          recurring: donationData.recurring
        });
      }

      // Create payment intent or subscription on the server
      // Backend will validate authentication for recurring donations
      const response = await stripeAPI.createPaymentIntent({
        amount: parseFloat(amount), // Ensure it's a number
        currency,
        programId: donationData.programId,
        anonymous: donationData.anonymous,
        message: donationData.message,
        recurring: donationData.recurring,
        email: getBillingDetails().email
      });

      if (import.meta.env.DEV) {
        console.log('Payment intent response:', response);
      }

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
        if (import.meta.env.DEV) {
          console.error('No client secret returned:', response);
        }
        setError(errorMsg);
        onError && onError(errorMsg);
        setLoading(false);
        return;
      }

      const billingDetails = getBillingDetails();

      // Confirm the payment with Stripe (works for both payment intents and subscription invoices)
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: billingDetails
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
          billingDetails,
          isSubscription: isSubscription || false,
          subscriptionId: subscriptionId || null
        });
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Payment intent creation error:', err);
      }
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
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <CheckCircle sx={{ fontSize: 48, color: 'var(--accent-green)', mb: 1.5 }} />
        <Typography variant="h6" sx={{ mb: 1, fontFamily: 'var(--font-heading)', color: 'var(--primary-green)' }}>
          Donation complete
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--gray)' }}>
          Thank you for your gift of{' '}
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount)}.
        </Typography>
        {donationData.recurring?.isRecurring && (
          <Typography variant="body2" sx={{ color: 'var(--accent-green)', mt: 1, fontWeight: 600 }}>
            Recurring donation confirmed
          </Typography>
        )}
      </Box>
    );
  }

  if (!stripe || !elements) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={32} sx={{ color: 'var(--accent-green)' }} />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {!isLoggedIn && (
        <FormSection title="Receipt email">
          <Typography variant="body2" sx={{ color: 'var(--gray)', mb: 2, lineHeight: 1.6 }}>
            Guest checkout is anonymous. We only use your email for your Stripe receipt.
          </Typography>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={guestEmail}
            onChange={handleGuestEmailChange}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            required
            sx={fieldSx}
          />
        </FormSection>
      )}

      <FormSection title="Card details" last>
        <Typography variant="body2" sx={{ color: 'var(--gray)', mb: 2, lineHeight: 1.6 }}>
          Secured by Stripe. We never store your full card number.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            minHeight: 48,
            border: '1px solid',
            borderColor: hasCardError ? 'error.main' : 'var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--white)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            '&:focus-within': {
              borderColor: hasCardError ? 'error.main' : 'var(--accent-green)',
              boxShadow: hasCardError ? 'none' : '0 0 0 1px var(--accent-green)'
            }
          }}
        >
          <Box
            sx={{
              pl: 1.5,
              pr: 1,
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0
            }}
          >
            {detectedCardBrand ? (
              renderCardBrandIcon(detectedCardBrand)
            ) : (
              <CreditCard sx={{ color: 'var(--gray)', fontSize: 22 }} />
            )}
          </Box>

          <Box
            sx={{
              flex: '1 1 auto',
              minWidth: 0,
              ...stripeElementSx,
              '& .StripeElement': {
                width: '100%',
                padding: '14px 12px 14px 0'
              }
            }}
          >
            <CardNumberElement
              options={{ ...CARD_ELEMENT_OPTIONS, showIcon: false }}
              onChange={handleCardChange('cardNumber')}
            />
          </Box>

          <Box
            sx={{
              width: '1px',
              alignSelf: 'stretch',
              my: 1,
              bgcolor: 'var(--color-border)',
              flexShrink: 0
            }}
          />

          <Box
            sx={{
              flex: '0 0 100px',
              minWidth: 0,
              ...stripeElementSx,
              '& .StripeElement': {
                width: '100%',
                padding: '14px 12px'
              }
            }}
          >
            <CardExpiryElement
              options={CARD_ELEMENT_OPTIONS}
              onChange={handleCardChange('cardExpiry')}
            />
          </Box>

          <Box
            sx={{
              width: '1px',
              alignSelf: 'stretch',
              my: 1,
              bgcolor: 'var(--color-border)',
              flexShrink: 0
            }}
          />

          <Box
            sx={{
              flex: '0 0 88px',
              minWidth: 0,
              ...stripeElementSx,
              '& .StripeElement': {
                width: '100%',
                padding: '14px 16px 14px 12px'
              }
            }}
          >
            <CardCvcElement
              options={CARD_ELEMENT_OPTIONS}
              onChange={handleCardChange('cardCvc')}
            />
          </Box>
        </Box>

        {cardFieldError && (
          <FormHelperText error sx={{ mt: 1.25, mx: 0 }}>
            {cardFieldError}
          </FormHelperText>
        )}
      </FormSection>

      <Box
        sx={{
          mt: 4,
          pt: 3,
          borderTop: '1px solid var(--color-border)'
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={!stripe || loading || !isFormComplete()}
          sx={{
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          {renderButtonContent()}
        </Button>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2, color: 'var(--gray)' }}>
          By donating, you agree to our terms of service.
        </Typography>
      </Box>
    </Box>
  );
}

export default function StripePayment({ amount, currency, onSuccess, onError, donationData }) {
  if (!stripePromise) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 2 }}>
        Stripe is not configured. Set <code>VITE_STRIPE_PUBLISHABLE_KEY</code> in{' '}
        <code>client/.env.local</code> (see <code>client/.env.example</code>).
      </Alert>
    );
  }

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