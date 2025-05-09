const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// In-memory storage for OTPs and verification status
const otpStore = {};
const verificationStatus = {};

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>TN Migrant Worker Portal</title>
      <style>
        body { font-family: Arial; padding: 20px; background-color: #f0f9ff; line-height: 1.6; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1, h2 { color: #0369a1; text-align: center; }
        nav { background-color: #0369a1; padding: 15px; border-radius: 8px; margin-bottom: 30px; text-align: center; }
        nav a { color: white; text-decoration: none; margin: 0 15px; font-weight: bold; }
        .hero { background: linear-gradient(to right, #0369a1, #0c4a6e); color: white; padding: 50px 20px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .feature-card { background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 5px rgba(0,0,0,0.05); text-align: center; }
        .btn { display: inline-block; background-color: #a21caf; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 10px; }
        .btn-primary { background-color: #0369a1; }
        .cta { background-color: #a21caf; color: white; padding: 40px 20px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <nav>
          <a href="/">Home</a>
          <a href="/login">Login</a>
          <a href="/register">Register</a>
          <a href="/aadhar-verification">Aadhar Verification</a>
        </nav>

        <div class="hero">
          <h1>Tamil Nadu Migrant Worker Portal</h1>
          <p>A comprehensive platform to register, manage, and support migrant workers across Tamil Nadu</p>
          <a href="/register" class="btn btn-primary">Register as a Worker</a>
          <a href="/login" class="btn">Login to Account</a>
          <a href="/aadhar-verification" class="btn">Verify Aadhar</a>
        </div>

        <h2>Key Features</h2>
        <div class="features">
          <div class="feature-card">
            <h3>Unique Worker ID</h3>
            <p>Each worker receives a unique identification number that helps in tracking benefits and services</p>
          </div>
          <div class="feature-card">
            <h3>Document Management</h3>
            <p>Securely store and manage important documents like identification, work permits, and contracts</p>
          </div>
          <div class="feature-card">
            <h3>Aadhar Verification</h3>
            <p>Verify your identity securely through Aadhar OTP verification system</p>
          </div>
        </div>

        <div class="cta">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of migrant workers who have streamlined their work experience through our platform</p>
          <a href="/register" class="btn">Register Now</a>
        </div>

        <p style="text-align: center;">© 2025 Tamil Nadu Migrant Worker Portal. All rights reserved.</p>
      </div>
    </body>
    </html>
  `);
});

// Login page
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login - TN Migrant Worker Portal</title>
      <style>
        body { font-family: Arial; padding: 20px; background-color: #f0f9ff; line-height: 1.6; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { color: #0369a1; text-align: center; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #0369a1; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
        .back-link { display: block; margin-top: 20px; text-align: center; color: #0369a1; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Login to Your Account</h1>
        <form>
          <div class="form-group">
            <label for="email">Email Address or Worker ID</label>
            <input type="text" id="email" placeholder="Enter your email or ID" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password" required>
          </div>
          <button type="submit">Login</button>
        </form>
        <a href="/" class="back-link">← Back to Home</a>
      </div>
    </body>
    </html>
  `);
});

// Register page
app.get('/register', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Register - TN Migrant Worker Portal</title>
      <style>
        body { font-family: Arial; padding: 20px; background-color: #f0f9ff; line-height: 1.6; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { color: #0369a1; text-align: center; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #0369a1; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
        .back-link { display: block; margin-top: 20px; text-align: center; color: #0369a1; }
        .note { font-size: 0.9em; color: #666; margin-top: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Register as a Worker</h1>
        <form action="/register" method="post">
          <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" name="name" placeholder="Enter your full name" required>
          </div>
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" placeholder="Enter your email" required>
          </div>
          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input type="tel" id="phone" name="phone" placeholder="Enter your phone number" required>
          </div>
          <div class="form-group">
            <label for="aadhar">Aadhar Number</label>
            <input type="text" id="aadhar" name="aadhar" placeholder="Enter your 12-digit Aadhar number" pattern="[0-9]{12}" required>
            <p class="note">You will need to verify this Aadhar number after registration</p>
          </div>
          <div class="form-group">
            <label for="homeState">Home State</label>
            <select id="homeState" name="homeState" required>
              <option value="">Select your home state</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Bihar">Bihar</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Rajasthan">Rajasthan</option>
            </select>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Create a password" required>
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password" required>
          </div>
          <button type="submit">Register</button>
        </form>
        <a href="/" class="back-link">← Back to Home</a>
      </div>
    </body>
    </html>
  `);
});

// Aadhar Verification Page
app.get('/aadhar-verification', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Aadhar Verification - TN Migrant Worker Portal</title>
      <style>
        body { font-family: Arial; padding: 20px; background-color: #f0f9ff; line-height: 1.6; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { color: #0369a1; text-align: center; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #0369a1; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; width: 100%; }
        .back-link { display: block; margin-top: 20px; text-align: center; color: #0369a1; }
        .step { display: none; }
        .step.active { display: block; }
        .success-message { background-color: #d1e7dd; color: #0f5132; padding: 15px; border-radius: 4px; text-align: center; margin-bottom: 15px; display: none; }
        .error-message { background-color: #f8d7da; color: #842029; padding: 15px; border-radius: 4px; text-align: center; margin-bottom: 15px; display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Aadhar Verification</h1>
        
        <div class="success-message" id="successMessage">
          Your Aadhar has been successfully verified!
        </div>
        
        <div class="error-message" id="errorMessage">
          Invalid OTP. Please try again.
        </div>
        
        <div class="step active" id="step1">
          <p>Please enter your 12-digit Aadhar number to receive an OTP for verification.</p>
          <div class="form-group">
            <label for="aadharNumber">Aadhar Number</label>
            <input type="text" id="aadharNumber" placeholder="Enter your 12-digit Aadhar number" pattern="[0-9]{12}" required>
          </div>
          <button type="button" onclick="requestOTP()">Request OTP</button>
        </div>
        
        <div class="step" id="step2">
          <p>An OTP has been sent to the mobile number linked with your Aadhar. Please enter it below.</p>
          <div class="form-group">
            <label for="otpInput">OTP</label>
            <input type="text" id="otpInput" placeholder="Enter 6-digit OTP" pattern="[0-9]{6}" required>
          </div>
          <button type="button" onclick="verifyOTP()">Verify OTP</button>
          <p style="text-align: center; margin-top: 10px;">
            <a href="#" onclick="resendOTP(); return false;">Resend OTP</a>
          </p>
        </div>
        
        <div class="step" id="step3">
          <div style="text-align: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0f5132" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <h2 style="color: #0f5132;">Verification Successful</h2>
            <p>Your Aadhar has been successfully verified. You can now access all services on the portal.</p>
            <a href="/" class="btn-primary" style="display: inline-block; background: #0369a1; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; margin-top: 15px;">Return to Home</a>
          </div>
        </div>
        
        <a href="/" class="back-link" id="backLink">← Back to Home</a>
      </div>
      
      <script>
        // For demo purposes - in a real app, this would call your backend API
        function requestOTP() {
          const aadharNumber = document.getElementById('aadharNumber').value;
          
          if (aadharNumber.length !== 12 || !/^[0-9]{12}$/.test(aadharNumber)) {
            document.getElementById('errorMessage').innerHTML = 'Please enter a valid 12-digit Aadhar number.';
            document.getElementById('errorMessage').style.display = 'block';
            setTimeout(() => {
              document.getElementById('errorMessage').style.display = 'none';
            }, 3000);
            return;
          }
          
          // In a real app, this would make an API call to your backend
          // Here we'll simulate the OTP request process
          
          // Hide error message if it's showing
          document.getElementById('errorMessage').style.display = 'none';
          
          // Show loading state
          const button = document.querySelector('#step1 button');
          const originalText = button.innerHTML;
          button.innerHTML = 'Sending OTP...';
          button.disabled = true;
          
          // Simulate API call delay
          setTimeout(() => {
            // Move to step 2
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step2').classList.add('active');
            
            // Reset button
            button.innerHTML = originalText;
            button.disabled = false;
          }, 1500);
        }
        
        function verifyOTP() {
          const otp = document.getElementById('otpInput').value;
          
          if (otp.length !== 6 || !/^[0-9]{6}$/.test(otp)) {
            document.getElementById('errorMessage').innerHTML = 'Please enter a valid 6-digit OTP.';
            document.getElementById('errorMessage').style.display = 'block';
            setTimeout(() => {
              document.getElementById('errorMessage').style.display = 'none';
            }, 3000);
            return;
          }
          
          // Show loading state
          const button = document.querySelector('#step2 button');
          const originalText = button.innerHTML;
          button.innerHTML = 'Verifying...';
          button.disabled = true;
          
          // Simulate API call delay
          setTimeout(() => {
            // For demo purposes, we'll accept any 6-digit OTP
            // In a real app, this would validate against a backend API
            
            // Hide step 2
            document.getElementById('step2').classList.remove('active');
            
            // Show step 3 (success)
            document.getElementById('step3').classList.add('active');
            
            // Hide back link
            document.getElementById('backLink').style.display = 'none';
            
            // Reset button
            button.innerHTML = originalText;
            button.disabled = false;
          }, 1500);
        }
        
        function resendOTP() {
          // Show loading state
          const resendLink = document.querySelector('#step2 a');
          const originalText = resendLink.innerHTML;
          resendLink.innerHTML = 'Sending...';
          
          // Simulate API call delay
          setTimeout(() => {
            document.getElementById('successMessage').innerHTML = 'A new OTP has been sent to your mobile number.';
            document.getElementById('successMessage').style.display = 'block';
            
            // Reset link
            resendLink.innerHTML = originalText;
            
            setTimeout(() => {
              document.getElementById('successMessage').style.display = 'none';
            }, 3000);
          }, 1500);
        }
      </script>
    </body>
    </html>
  `);
});

// Handle Aadhar verification API endpoints (mock implementation)
app.post('/api/aadhar/request-otp', (req, res) => {
  const { aadharNumber } = req.body;
  
  // Validate Aadhar number format
  if (!aadharNumber || !/^[0-9]{12}$/.test(aadharNumber)) {
    return res.status(400).json({ success: false, message: 'Invalid Aadhar number' });
  }
  
  // Generate OTP and store it (in a real app, this would be sent via SMS)
  const otp = generateOTP();
  otpStore[aadharNumber] = otp;
  
  // In a real app, this would call an SMS service to send the OTP
  console.log(`OTP for Aadhar ${aadharNumber}: ${otp}`);
  
  return res.json({ 
    success: true, 
    message: 'OTP sent successfully to registered mobile number',
    // Only for testing - would never expose OTP in response in production
    testOtp: otp
  });
});

app.post('/api/aadhar/verify-otp', (req, res) => {
  const { aadharNumber, otp } = req.body;
  
  // Validate inputs
  if (!aadharNumber || !otp) {
    return res.status(400).json({ success: false, message: 'Aadhar number and OTP are required' });
  }
  
  // Check if the OTP matches (in a real app, this would also check expiry)
  const storedOtp = otpStore[aadharNumber];
  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
  
  // Mark Aadhar as verified
  verificationStatus[aadharNumber] = true;
  
  // Clear the OTP after successful verification
  delete otpStore[aadharNumber];
  
  return res.json({
    success: true,
    message: 'Aadhar verification successful',
    status: 'verified'
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).send(`
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <a href="/">Go Home</a>
  `);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
});
