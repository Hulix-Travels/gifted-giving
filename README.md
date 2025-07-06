# 🎁 Gifted Giving Website

A modern, full-stack donation platform built with React, Node.js, and MongoDB. This application enables users to make donations to various charitable programs, track their giving history, and provides administrators with comprehensive management tools.

## ✨ Features

### 🏠 **Public Features**
- **Program Browsing**: View and learn about different charitable programs
- **Anonymous Donations**: Make donations without creating an account
- **Multiple Payment Methods**: Stripe, PayPal, Bank Transfer support
- **Recurring Donations**: Set up monthly, quarterly, or yearly donations
- **Impact Tracking**: See how your donations make a difference
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### 👤 **User Features**
- **User Registration/Login**: Secure authentication system
- **Donation History**: Track all your past donations
- **Profile Management**: Update personal information
- **Public Donations**: Choose to make your donations public
- **Email Notifications**: Receive confirmation emails

### 🔧 **Admin Features**
- **Dashboard Analytics**: Real-time donation statistics
- **Program Management**: Create, edit, and manage programs
- **User Management**: View and manage user accounts
- **Donation Tracking**: Monitor all donations and payment status
- **Content Management**: Update website content dynamically

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Material-UI (MUI)** - Component library
- **Vite** - Fast build tool
- **Stripe Elements** - Secure payment processing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Stripe API** - Payment processing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy
- **Redis** - Caching and sessions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- MongoDB (or use Docker)
- Stripe account (for payments)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gifted-giving-website.git
   cd gifted-giving-website
   ```

2. **Set up environment variables**
   ```bash
   # Copy environment files
   cp server/config.env.example server/config.env
   cp client/.env.example client/.env
   
   # Edit the files with your configuration
   nano server/config.env
   nano client/.env
   ```

3. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install
   
   # Install server dependencies
   cd ../server && npm install
   ```

### Development Mode

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Admin Dashboard: http://localhost:5173/admin

### Production with Docker

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

## 📁 Project Structure

```
gifted-giving-website/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── assets/         # Static assets
│   ├── public/             # Public assets
│   └── Dockerfile          # Frontend Docker config
├── server/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── models/             # MongoDB models
│   ├── middleware/         # Express middleware
│   ├── services/           # Business logic
│   └── Dockerfile          # Backend Docker config
├── docker-compose.yml      # Multi-container setup
├── nginx.conf             # Nginx configuration
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

#### Backend (`server/config.env`)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gifted-giving
JWT_SECRET=your-super-secret-jwt-key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm test
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Donation Endpoints
- `POST /api/donations` - Create donation
- `GET /api/donations` - Get user donations
- `GET /api/donations/stats` - Get donation statistics

### Program Endpoints
- `GET /api/programs` - Get all programs
- `POST /api/programs` - Create program (admin)
- `PUT /api/programs/:id` - Update program (admin)

### Payment Endpoints
- `POST /api/stripe/create-payment-intent` - Create Stripe payment
- `POST /api/stripe/webhook` - Stripe webhook handler

## 🚀 Deployment

### Docker Deployment
```bash
# Build and deploy
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment
1. Build the frontend: `cd client && npm run build`
2. Start the backend: `cd server && npm start`
3. Set up a reverse proxy (Nginx) to serve the frontend
4. Configure environment variables for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/gifted-giving-website/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- [Stripe](https://stripe.com/) for payment processing
- [Material-UI](https://mui.com/) for the component library
- [MongoDB](https://www.mongodb.com/) for the database
- [React](https://reactjs.org/) for the frontend framework

---

**Made with ❤️ for making the world a better place** 