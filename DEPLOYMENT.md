# 🚀 Deployment Guide - Gifted Giving Website

This guide will walk you through deploying your Gifted Giving website to AWS using GitHub Actions CI/CD.

## 📋 Prerequisites

- AWS Account
- GitHub repository with your code
- MongoDB Atlas account (for database)
- Domain name (optional)

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Repo   │    │   GitHub Actions│    │   AWS Services  │
│                 │    │   CI/CD Pipeline│    │                 │
│  React Frontend │───▶│                 │───▶│  S3 + CloudFront│
│  Node.js Backend│    │  • Build        │    │  (Frontend)     │
│                 │    │  • Test         │    │                 │
│                 │    │  • Deploy       │    │  EC2 Instance   │
│                 │    │                 │    │  (Backend)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Step 1: AWS Setup

### 1.1 Create EC2 Instance
1. Go to AWS EC2 Console
2. Launch Instance:
   - **AMI**: Amazon Linux 2 (free tier)
   - **Instance Type**: t2.micro (free tier)
   - **Security Group**: 
     - SSH (port 22) from your IP
     - HTTP (port 80) from anywhere
     - HTTPS (port 443) from anywhere
3. Download your key pair (.pem file)

### 1.2 Create S3 Bucket
1. Go to AWS S3 Console
2. Create bucket: `gifted-giving-frontend`
3. Enable static website hosting
4. Set index document to `index.html`

### 1.3 (Optional) Set up CloudFront
1. Create CloudFront distribution
2. Set S3 bucket as origin
3. Note the distribution ID

## 🔑 Step 2: GitHub Secrets Setup

Follow the guide in `scripts/setup-github-secrets.md` to add all required secrets to your GitHub repository.

## 🖥️ Step 3: EC2 Instance Setup

### 3.1 Connect to EC2
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ec2-user@your-ec2-public-dns
```

### 3.2 Run Setup Script
```bash
# Copy the setup script to EC2
scp -i your-key.pem scripts/deploy-ec2.sh ec2-user@your-ec2-public-dns:~/

# SSH into EC2 and run the script
ssh -i your-key.pem ec2-user@your-ec2-public-dns
chmod +x deploy-ec2.sh
./deploy-ec2.sh
```

### 3.3 Configure Environment
```bash
# Edit the environment file
nano /home/ec2-user/gifted-giving/server/.env
```

Add your actual values:
```env
NODE_ENV=production
PORT=80
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gifted-giving
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=https://your-s3-bucket.s3.amazonaws.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3.4 Restart Application
```bash
pm2 restart gifted-giving-backend
pm2 save
```

## 🌐 Step 4: Test Your Deployment

### 4.1 Test Backend
```bash
curl http://your-ec2-public-dns/api/health
```

### 4.2 Test Frontend
Visit your S3 bucket URL or CloudFront distribution URL.

## 🔄 Step 5: Enable CI/CD

1. Push your code to the main branch
2. GitHub Actions will automatically:
   - Build and test your code
   - Deploy backend to EC2
   - Deploy frontend to S3
   - Run health checks

## 📊 Step 6: Monitoring

### 6.1 PM2 Monitoring
```bash
pm2 monit          # Real-time monitoring
pm2 logs           # View logs
pm2 status         # Check status
```

### 6.2 AWS Monitoring
- CloudWatch for EC2 metrics
- S3 access logs
- CloudFront analytics

## 🔒 Step 7: Security Best Practices

### 7.1 EC2 Security
- Use security groups to restrict access
- Keep system updated
- Use SSH keys instead of passwords

### 7.2 Application Security
- Use HTTPS (CloudFront provides this)
- Keep dependencies updated
- Use environment variables for secrets

### 7.3 Database Security
- Use MongoDB Atlas with network access restrictions
- Enable authentication
- Regular backups

## 💰 Cost Optimization

### Free Tier (12 months)
- EC2: 750 hours/month t2.micro
- S3: 5GB storage
- CloudFront: 1TB data transfer

### After Free Tier
- Monitor usage in AWS Billing Dashboard
- Set up billing alerts
- Consider reserved instances for EC2

## 🚨 Troubleshooting

### Common Issues

1. **EC2 Connection Failed**
   - Check security group settings
   - Verify SSH key permissions
   - Ensure instance is running

2. **Application Not Starting**
   - Check PM2 logs: `pm2 logs`
   - Verify environment variables
   - Check MongoDB connection

3. **Frontend Not Loading**
   - Verify S3 bucket configuration
   - Check CloudFront distribution
   - Ensure API URLs are correct

4. **GitHub Actions Failing**
   - Check all secrets are set correctly
   - Verify SSH key format
   - Check AWS credentials

### Useful Commands

```bash
# EC2
pm2 restart gifted-giving-backend
pm2 logs gifted-giving-backend
pm2 monit

# AWS CLI
aws s3 ls s3://your-bucket-name
aws cloudfront list-distributions

# Health Checks
curl -f http://your-ec2-public-dns/api/health
curl -f https://your-frontend-url
```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review GitHub Actions logs
3. Check AWS CloudWatch logs
4. Verify all configuration steps

## 🎉 Going Live Checklist

- [ ] EC2 instance running and accessible
- [ ] Backend API responding to health checks
- [ ] Frontend deployed to S3/CloudFront
- [ ] Database connected and working
- [ ] Environment variables configured
- [ ] GitHub Actions pipeline working
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificates working
- [ ] Monitoring set up
- [ ] Backup strategy in place

Congratulations! Your Gifted Giving website is now live on AWS! 🚀 