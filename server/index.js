const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: './config.env' });

const { getJwtSecret } = require('./utils/jwtSecret');

// Fail fast in production if JWT_SECRET is missing
if (process.env.NODE_ENV === 'production') {
  getJwtSecret();
}

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy — single hop when behind Render/Vercel
app.set('trust proxy', 1);

// Import routes
const authRoutes = require('./routes/auth');
const donationRoutes = require('./routes/donations');
const programRoutes = require('./routes/programs');
const volunteerRoutes = require('./routes/volunteers');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const stripeRoutes = require('./routes/stripe');
const feedbackRoutes = require('./routes/feedback');
const successStoriesRoutes = require('./routes/successStories');
const newsletterRoutes = require('./routes/newsletter');

// Security middleware
app.use(helmet());
// Build allowed origins list from env to support multiple frontends
const envAllowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);
// Optional regex patterns for origins, comma-separated (e.g., ^https://gifted-givings-[^.]+\.vercel\.app$)
const envOriginPatterns = (process.env.ALLOWED_ORIGIN_PATTERNS || '')
  .split(',')
  .map(p => p.trim())
  .filter(Boolean)
  .map(p => {
    try { return new RegExp(p); } catch { return null; }
  })
  .filter(Boolean);
const clientUrl = process.env.CLIENT_URL;

const buildAllowedOrigins = () => [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://www.giftedgivings.com',
  'https://giftedgivings.com',
]
  .concat(envAllowedOrigins)
  .concat(clientUrl ? [clientUrl] : []);

const corsOptionsDelegate = (req, callback) => {
  const origin = req.header('Origin');
  const path = req.path || req.originalUrl || '';

  const baseOptions = {
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };

  if (!origin) {
    const allowNoOrigin =
      process.env.NODE_ENV !== 'production' ||
      path.includes('/stripe/webhook') ||
      path.startsWith('/api/health');

    if (!allowNoOrigin) {
      console.log('CORS blocked no-origin request to:', path);
    }
    return callback(null, { ...baseOptions, origin: allowNoOrigin });
  }

  const allowedOrigins = buildAllowedOrigins();
  const isListed = allowedOrigins.includes(origin);
  const matchesPattern = envOriginPatterns.some(re => re.test(origin));

  if (isListed || matchesPattern) {
    return callback(null, { ...baseOptions, origin: true });
  }

  console.log('CORS blocked origin:', origin);
  return callback(null, { ...baseOptions, origin: false });
};

app.use(cors(corsOptionsDelegate));
// Explicitly handle preflight requests for all routes with same options
app.options('*', cors(corsOptionsDelegate));

// Stricter rate limits on authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const sensitiveAuthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/auth/login', sensitiveAuthLimiter);
app.use('/api/auth/forgot-password', sensitiveAuthLimiter);
app.use('/api/auth/reset-password', sensitiveAuthLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/verify-email', authLimiter);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(compression());
app.use(morgan('combined'));

// Stripe webhook needs raw body for signature verification
// So we must exclude it from JSON parsing
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use('/api/stripe/webhook-test', express.raw({ type: 'application/json' }));

// Apply JSON parsing to all other routes (except webhook routes)
app.use((req, res, next) => {
  // Skip JSON parsing for Stripe webhook routes (they need raw body)
  const path = req.path || req.originalUrl || '';
  if (path.includes('/stripe/webhook')) {
    return next();
  }
  express.json({ limit: '10mb' })(req, res, next);
});

app.use((req, res, next) => {
  // Skip URL encoded parsing for Stripe webhook routes
  const path = req.path || req.originalUrl || '';
  if (path.includes('/stripe/webhook')) {
    return next();
  }
  express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
});

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gifted-giving';
    console.log('Attempting to connect to MongoDB...');
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('\n📋 To fix this issue:');
    console.log('1. Install MongoDB: https://docs.mongodb.com/manual/installation/');
    console.log('2. Start MongoDB service: sudo systemctl start mongod');
    console.log('3. Or use MongoDB Atlas (cloud): Update MONGODB_URI in config.env');
    if (process.env.NODE_ENV === 'production') {
      console.error('Exiting — production requires a working database connection.');
      process.exit(1);
    }
    console.log('\n🚀 The server will continue running but database features will not work.');
    return false;
  }
};

// Connect to MongoDB
connectDB();

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/success-stories', successStoriesRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Serve uploads directory statically using an absolute path for reliability in production
const path = require('path');
const uploadsAbsolutePath = path.join(__dirname, 'uploads');
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(uploadsAbsolutePath, {
  fallthrough: true,
  etag: true,
  maxAge: '30d'
}));

// Upload route
app.use('/api/upload', require('./routes/upload'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    message: 'Gifted givings API is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

let server;

// Only start the server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📱 Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  });
}

module.exports = app; 