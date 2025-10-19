import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import {
  CreditCard,
  Payment,
  AccountBalance,
  CheckCircle,
  Security,
  Receipt
} from '@mui/icons-material';

const steps = ['Payment Details', 'Verification', 'Confirmation'];

const paymentMethods = [
  { 
    value: 'stripe', 
    label: 'Credit/Debit Card', 
    icon: 'credit_card',
    description: 'Secure payment via Stripe'
  },
  { 
    value: 'paypal', 
    label: 'PayPal', 
    icon: 'payment',
    description: 'Pay with your PayPal account'
  },
  { 
    value: 'bank_transfer', 
    label: 'Bank Transfer', 
    icon: 'account_balance',
    description: 'Direct bank transfer'
  }
];

export default function PaymentProcessor({ open, onClose, donationData, onSuccess }) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [error, setError] = useState('');

  const renderPaymentIcon = (iconType) => {
    switch (iconType) {
      case 'credit_card':
        return <CreditCard />;
      case 'payment':
        return <Payment />;
      case 'account_balance':
        return <AccountBalance />;
      default:
        return <CreditCard />;
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate payment details
      if (paymentMethod === 'stripe' && (!cardData.cardNumber || !cardData.expiryDate || !cardData.cvv || !cardData.cardholderName)) {
        setError('Please fill in all card details');
        return;
      }
      setError('');
    }
    
    if (activeStep === steps.length - 1) {
      handlePaymentComplete();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePaymentComplete = async () => {
    try {
      setLoading(true);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call success callback
      onSuccess({
        ...donationData,
        paymentStatus: 'completed',
        transactionId: `TXN-${Date.now()}`,
        processedAt: new Date().toISOString()
      });
      
      onClose();
      
    } catch {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setError('');
    setCardData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    });
    onClose();
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Receipt />
              Donation Summary
            </Typography>
            
            <Card sx={{ mb: 3, background: '#f8f9fa' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#666' }}>Amount:</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--primary-green)' }}>
                      ${donationData.amount}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" sx={{ color: '#666' }}>Program:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {donationData.programName || 'General Fund'}
                    </Typography>
                  </Grid>
                  {donationData.recurring?.isRecurring && (
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        Recurring: {donationData.recurring.frequency}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            <Typography variant="h6" sx={{ mb: 2 }}>Select Payment Method</Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                label="Payment Method"
              >
                {paymentMethods.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {renderPaymentIcon(method.icon)}
                      <Box>
                        <Typography variant="body1">{method.label}</Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {method.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {paymentMethod === 'stripe' && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Card Details</Typography>
                
                <TextField
                  fullWidth
                  label="Card Number"
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: formatCardNumber(e.target.value) })}
                  placeholder="1234 5678 9012 3456"
                  sx={{ mb: 2 }}
                  inputProps={{ maxLength: 19 }}
                />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      value={cardData.expiryDate}
                      onChange={(e) => setCardData({ ...cardData, expiryDate: formatExpiryDate(e.target.value) })}
                      placeholder="MM/YY"
                      sx={{ mb: 2 }}
                      inputProps={{ maxLength: 5 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                      placeholder="123"
                      sx={{ mb: 2 }}
                      inputProps={{ maxLength: 4 }}
                    />
                  </Grid>
                </Grid>
                
                <TextField
                  fullWidth
                  label="Cardholder Name"
                  value={cardData.cardholderName}
                  onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
                  placeholder="John Doe"
                />
              </Box>
            )}

            {paymentMethod === 'paypal' && (
              <Box textAlign="center" py={4}>
                <Payment sx={{ fontSize: 60, color: '#0070ba', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  PayPal Payment
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  You will be redirected to PayPal to complete your payment securely.
                </Typography>
              </Box>
            )}

            {paymentMethod === 'bank_transfer' && (
              <Box textAlign="center" py={4}>
                <AccountBalance sx={{ fontSize: 60, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Bank Transfer
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                  Please transfer ${donationData.amount} to our bank account.
                </Typography>
                <Card sx={{ background: '#f8f9fa', p: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Account: 1234-5678-9012-3456
                  </Typography>
                  <Typography variant="body2">
                    Bank: Gifted givings Bank
                  </Typography>
                  <Typography variant="body2">
                    Reference: DON-{Date.now()}
                  </Typography>
                </Card>
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box textAlign="center" py={4}>
            <Security sx={{ fontSize: 60, color: '#4CAF50', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Verifying Payment
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
              Please wait while we securely process your payment...
            </Typography>
            <CircularProgress size={40} sx={{ color: 'var(--primary-green)' }} />
          </Box>
        );

      case 2:
        return (
          <Box textAlign="center" py={4}>
            <CheckCircle sx={{ fontSize: 60, color: '#4CAF50', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Payment Successful!
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
              Thank you for your donation. You will receive a confirmation email shortly.
            </Typography>
            <Card sx={{ background: '#f8f9fa', p: 2, maxWidth: 300, mx: 'auto' }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Transaction ID: TXN-{Date.now()}
              </Typography>
              <Typography variant="body2">
                Amount: ${donationData.amount}
              </Typography>
              <Typography variant="body2">
                Date: {new Date().toLocaleDateString()}
              </Typography>
            </Card>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ 
        background: 'var(--primary-green)', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <Payment />
        Complete Your Donation
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={handleBack} 
          disabled={activeStep === 0}
          variant="outlined"
        >
          Back
        </Button>
        <Button 
          onClick={handleNext}
          variant="contained"
          disabled={loading}
          sx={{ 
            background: 'var(--primary-green)',
            '&:hover': { background: '#00e67a' }
          }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : activeStep === steps.length - 1 ? (
            'Complete'
          ) : (
            'Next'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 