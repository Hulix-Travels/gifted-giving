const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = {};
    this.initializeTransporter();
    this.loadTemplates();
  }

  async initializeTransporter() {
    // Only initialize if SMTP credentials are available
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('📧 Email service: SMTP credentials not configured');
      console.log('📧 To enable email functionality, add to your config.env file:');
      console.log('   SMTP_HOST=smtp.gmail.com');
      console.log('   SMTP_PORT=587');
      console.log('   SMTP_USER=your-email@gmail.com');
      console.log('   SMTP_PASS=your-app-password');
      this.transporter = null;
      return;
    }

    // Create reusable transporter object using SMTP transport
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection configuration
    try {
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      console.log('📧 Note: For Gmail, you need to use an App Password, not your regular password');
      console.log('📧 Generate an App Password at: https://myaccount.google.com/apppasswords');
      this.transporter = null;
    }
  }

  async loadTemplates() {
    try {
      const templatesDir = path.join(__dirname, 'emailTemplates');
      
      // Create templates directory if it doesn't exist
      try {
        await fs.access(templatesDir);
      } catch {
        await fs.mkdir(templatesDir, { recursive: true });
      }

      // Load all template files
      const templateFiles = [
        'welcome.html',
        'newsletter-welcome.html',
        'password-reset.html',
        'donation-confirmation.html',
        'volunteer-application.html',
        'newsletter.html'
      ];

      for (const file of templateFiles) {
        try {
          const templatePath = path.join(templatesDir, file);
          const templateContent = await fs.readFile(templatePath, 'utf8');
          this.templates[file.replace('.html', '')] = handlebars.compile(templateContent);
        } catch (error) {
          // If template doesn't exist, create a default one
          await this.createDefaultTemplate(file);
        }
      }

      console.log('✅ Email templates loaded successfully');
    } catch (error) {
      console.error('❌ Error loading email templates:', error);
    }
  }

  async createDefaultTemplate(filename) {
    try {
      const templateName = filename.replace('.html', '');
      const templatesDir = path.join(__dirname, 'emailTemplates');
      const templatePath = path.join(templatesDir, filename);

      let defaultContent = '';

      switch (templateName) {
        case 'welcome':
          defaultContent = this.getWelcomeTemplate();
          break;
        case 'newsletter-welcome':
          defaultContent = this.getNewsletterWelcomeTemplate();
          break;
        case 'password-reset':
          defaultContent = this.getPasswordResetTemplate();
          break;
        case 'donation-confirmation':
          defaultContent = this.getDonationConfirmationTemplate();
          break;
        case 'volunteer-application':
          defaultContent = this.getVolunteerApplicationTemplate();
          break;
        case 'newsletter':
          defaultContent = this.getNewsletterTemplate();
          break;
        default:
          defaultContent = this.getDefaultTemplate();
      }

      await fs.writeFile(templatePath, defaultContent);
      this.templates[templateName] = handlebars.compile(defaultContent);
    } catch (error) {
      console.error(`Error creating template ${filename}:`, error);
      // Create a simple fallback template
      const templateName = filename.replace('.html', '');
      this.templates[templateName] = handlebars.compile(`
        <!DOCTYPE html>
        <html>
        <head><title>{{subject}}</title></head>
        <body>
          <h1>{{subject}}</h1>
          <p>{{{content}}}</p>
        </body>
        </html>
      `);
    }
  }

  getWelcomeTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Gifted Giving</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #01371f; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #00ff8c; color: #01371f; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Gifted Giving!</h1>
        </div>
        <div class="content">
          <h2>Hello {{firstName}}!</h2>
          <p>Thank you for joining our community dedicated to empowering children through education, health, and opportunity.</p>
          <p>With your account, you can:</p>
          <ul>
            <li>Make donations to support our programs</li>
            <li>Track your impact and donation history</li>
            <li>Stay updated with our latest news</li>
            <li>Volunteer your time and skills</li>
          </ul>
          <p style="text-align: center; margin: 30px 0;">
            <a href="{{dashboardUrl}}" class="button">Visit Your Dashboard</a>
          </p>
          <p>If you have any questions, feel free to reach out to us at giftedhands1256@gmail.com</p>
        </div>
        <div class="footer">
          <p>© 2025 Gifted Giving. All rights reserved.</p>
          <p>123 Buganda Road, Kampala, Uganda</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  getNewsletterWelcomeTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Newsletter Subscription Confirmed</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #01371f; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Newsletter Subscription Confirmed!</h1>
        </div>
        <div class="content">
          <h2>Welcome to our newsletter!</h2>
          <p>Thank you for subscribing to our newsletter. You'll now receive updates about:</p>
          <ul>
            <li>Our latest programs and initiatives</li>
            <li>Success stories and impact reports</li>
            <li>Volunteer opportunities</li>
            <li>Ways to get involved and make a difference</li>
          </ul>
          <p>We're excited to keep you informed about how your support is making a real difference in children's lives.</p>
        </div>
        <div class="footer">
          <p>© 2025 Gifted Giving. All rights reserved.</p>
          <p>To unsubscribe, reply to this email with "UNSUBSCRIBE" in the subject line.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  getPasswordResetTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset Request</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #01371f; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #00ff8c; color: #01371f; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello!</h2>
          <p>We received a request to reset your password for your Gifted Giving account.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="{{resetUrl}}" class="button">Reset Password</a>
          </p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2025 Gifted Giving. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  getDonationConfirmationTemplate() {
    return [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '  <meta charset="utf-8">',
      '  <title>Donation Confirmation</title>',
      '  <style>',
      '    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }',
      '    .container { max-width: 600px; margin: 0 auto; padding: 20px; }',
      '    .header { background: #01371f; color: white; padding: 30px; text-align: center; }',
      '    .content { padding: 30px; background: #f9f9f9; }',
      '    .amount { font-size: 24px; font-weight: bold; color: #00ff8c; }',
      '    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }',
      '  </style>',
      '</head>',
      '<body>',
      '  <div class="container">',
      '    <div class="header">',
      '      <h1>Thank You for Your Donation!</h1>',
      '    </div>',
      '    <div class="content">',
      '      <h2>Hello {{donorName}}!</h2>',
      '      <p>Thank you for your generous donation of <span class="amount">${{amount}}</span> to {{programName}}.</p>',
      '      <p>Your contribution will make a real difference in children\'s lives. Here\'s what your donation will help with:</p>',
      '      <ul>',
      '        <li>Providing education and school supplies</li>',
      '        <li>Supporting health and nutrition programs</li>',
      '        <li>Creating opportunities for children to thrive</li>',
      '      </ul>',
      '      <p><strong>Transaction ID:</strong> {{transactionId}}</p>',
      '      <p><strong>Date:</strong> {{date}}</p>',
      '      <p>You can view your donation history and track your impact in your dashboard.</p>',
      '    </div>',
      '    <div class="footer">',
      '      <p>© 2025 Gifted Giving. All rights reserved.</p>',
      '      <p>123 Buganda Road, Kampala, Uganda</p>',
      '    </div>',
      '  </div>',
      '</body>',
      '</html>'
    ].join('\n');
  }

  getVolunteerApplicationTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Volunteer Application Received</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #01371f; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Volunteer Application Received</h1>
        </div>
        <div class="content">
          <h2>Hello {{firstName}}!</h2>
          <p>Thank you for your interest in volunteering with Gifted Giving!</p>
          <p>We have received your application and will review it carefully. Here's what happens next:</p>
          <ol>
            <li>Our team will review your application within 3-5 business days</li>
            <li>We'll contact you to discuss opportunities that match your skills</li>
            <li>If selected, we'll provide training and orientation</li>
          </ol>
          <p><strong>Application Details:</strong></p>
          <ul>
            <li><strong>Name:</strong> {{firstName}} {{lastName}}</li>
            <li><strong>Skills:</strong> {{skills}}</li>
            <li><strong>Location:</strong> {{location}}</li>
          </ul>
          <p>We appreciate your commitment to making a difference in children's lives!</p>
        </div>
        <div class="footer">
          <p>© 2025 Gifted Giving. All rights reserved.</p>
          <p>Questions? Contact us at giftedhands1256@gmail.com</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  getNewsletterTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>{{subject}}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #01371f; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>{{subject}}</h1>
        </div>
        <div class="content">
          {{{content}}}
        </div>
        <div class="footer">
          <p>© 2025 Gifted Giving. All rights reserved.</p>
          <p>To unsubscribe, reply to this email with "UNSUBSCRIBE" in the subject line.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  getDefaultTemplate() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>{{subject}}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #01371f; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>{{subject}}</h1>
        </div>
        <div class="content">
          {{{content}}}
        </div>
        <div class="footer">
          <p>© 2025 Gifted Giving. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  async sendEmail(options) {
    try {
      if (!this.transporter) {
        console.log('📧 Email service not configured - skipping email send');
        return { messageId: 'no-transporter', status: 'skipped' };
      }

      const {
        to,
        subject,
        template,
        context = {},
        attachments = []
      } = options;

      // Get template
      const templateFn = this.templates[template];
      if (!templateFn) {
        throw new Error(`Template '${template}' not found`);
      }

      // Compile template with context
      const html = templateFn(context);

      // Email options
      const mailOptions = {
        from: `"Gifted Giving" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        attachments
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}: ${info.messageId}`);
      return info;

    } catch (error) {
      console.error('❌ Email sending failed:', error);
      throw error;
    }
  }

  // Convenience methods for different email types
  async sendWelcomeEmail(user) {
    return this.sendEmail({
      to: user.email,
      subject: 'Welcome to Gifted Giving!',
      template: 'welcome',
      context: {
        firstName: user.firstName,
        dashboardUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard`
      }
    });
  }

  async sendNewsletterWelcomeEmail(email) {
    return this.sendEmail({
      to: email,
      subject: 'Newsletter Subscription Confirmed',
      template: 'newsletter-welcome',
      context: {}
    });
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    return this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      context: { resetUrl }
    });
  }

  async sendDonationConfirmationEmail(donation) {
    return this.sendEmail({
      to: donation.donor.email,
      subject: 'Thank You for Your Donation',
      template: 'donation-confirmation',
      context: {
        donorName: donation.anonymous ? 'Anonymous Donor' : `${donation.donor.firstName} ${donation.donor.lastName}`,
        amount: donation.amount,
        programName: donation.program?.name || 'General Fund',
        transactionId: donation._id,
        date: new Date(donation.createdAt).toLocaleDateString()
      }
    });
  }

  async sendVolunteerApplicationEmail(application) {
    return this.sendEmail({
      to: application.email,
      subject: 'Volunteer Application Received',
      template: 'volunteer-application',
      context: {
        firstName: application.firstName,
        lastName: application.lastName,
        skills: application.skills.join(', '),
        location: application.location
      }
    });
  }

  async sendNewsletterEmail(subscribers, subject, content) {
    const results = [];
    
    for (const subscriber of subscribers) {
      try {
        await this.sendEmail({
          to: subscriber.email,
          subject,
          template: 'newsletter',
          context: { subject, content }
        });
        results.push({ email: subscriber.email, status: 'success' });
      } catch (error) {
        results.push({ email: subscriber.email, status: 'failed', error: error.message });
      }
    }

    return results;
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService; 