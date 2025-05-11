const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
// Import database connection
const { connectDB } = require('./config/db');

// Initialize Express
const app = express();

// Connect to database
(async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to database:', error);
  }
})();

// In-memory storage for OTPs and verification status
const otpStore = {};
const aadharVerificationStatus = {};

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Mock data for testing
const workers = [
  { 
    _id: '1', 
    name: 'John Doe', 
    email: 'john@example.com',
    phone: '9876543210',
    workerId: 'TN-UP-23-123456',
    homeState: 'Uttar Pradesh',
    district: 'Lucknow',
    role: 'worker',
    status: 'approved',
    skills: ['Construction', 'Carpentry'],
    isEmailVerified: true,
    isAadharVerified: true,
    aadharNumber: '123456789012'
  },
  { 
    _id: '2', 
    name: 'Raj Kumar', 
    email: 'raj@example.com',
    phone: '9876543211',
    workerId: 'TN-BR-23-123457',
    homeState: 'Bihar',
    district: 'Patna',
    role: 'worker',
    status: 'pending', 
    skills: ['Plumbing', 'Electrical'],
    isEmailVerified: true,
    isAadharVerified: false,
    aadharNumber: '987654321098'
  }
];

const tasks = [
  {
    _id: '1',
    title: 'Building Construction Work',
    description: 'Help with construction work at new site in Madurai',
    dueDate: '2025-05-30T00:00:00.000Z',
    priority: 'High',
    status: 'pending',
    location: 'Madurai',
    assignedTo: '1',
    assignedBy: '3',
    createdAt: '2025-05-01T00:00:00.000Z'
  },
  {
    _id: '2',
    title: 'Road Repair Work',
    description: 'Assist with road repair in Chennai central area',
    dueDate: '2025-05-25T00:00:00.000Z',
    priority: 'Medium',
    status: 'in-progress',
    location: 'Chennai',
    assignedTo: '1',
    assignedBy: '3',
    createdAt: '2025-05-02T00:00:00.000Z'
  }
];

const documents = [
  {
    _id: '1',
    name: 'Aadhar Card',
    type: 'identity',
    fileUrl: '/uploads/dummy-aadhar.pdf',
    filePath: 'uploads/dummy-aadhar.pdf',
    status: 'approved',
    user: '1',
    createdAt: '2025-04-20T00:00:00.000Z'
  },
  {
    _id: '2',
    name: 'Work Certificate',
    type: 'employment',
    fileUrl: '/uploads/dummy-certificate.pdf',
    filePath: 'uploads/dummy-certificate.pdf',
    status: 'pending',
    user: '1',
    createdAt: '2025-05-01T00:00:00.000Z'
  }
];

// Home page - Serve HTML
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>TN Migrant Worker Portal</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 0; 
          margin: 0;
          background-image: url('https://images.unsplash.com/photo-1588097261099-b4bae4aa0ed0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80');
          background-size: cover;
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          line-height: 1.6;
          color: #333;
        }
        .overlay {
          background-color: rgba(255, 255, 255, 0.9);
          min-height: 100vh;
          padding: 20px;
        }
        .container { 
          max-width: 1100px; 
          margin: 0 auto; 
          background: white; 
          padding: 30px; 
          border-radius: 12px; 
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        h1, h2 { 
          color: #114B5F; 
          text-align: center; 
        }
        h3 {
          color: #028090;
        }
        nav { 
          background-color: #114B5F; 
          padding: 15px; 
          border-radius: 8px; 
          margin-bottom: 30px; 
          text-align: center; 
        }
        nav a { 
          color: white; 
          text-decoration: none; 
          margin: 0 15px; 
          font-weight: bold; 
          transition: color 0.3s;
        }
        nav a:hover {
          color: #E4FDE1;
        }
        .hero { 
          background: linear-gradient(135deg, #114B5F, #028090); 
          color: white; 
          padding: 60px 20px; 
          text-align: center; 
          border-radius: 12px; 
          margin-bottom: 40px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .hero h1 {
          color: white;
          font-size: 2.5rem;
          margin-bottom: 20px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .hero p {
          font-size: 1.2rem;
          max-width: 800px;
          margin: 0 auto 30px auto;
        }
        .features { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
          gap: 25px; 
          margin-bottom: 40px; 
        }
        .feature-card { 
          background-color: white; 
          padding: 30px; 
          border-radius: 12px; 
          box-shadow: 0 5px 15px rgba(0,0,0,0.05); 
          text-align: center;
          transition: transform 0.3s, box-shadow 0.3s;
          border-top: 4px solid #028090;
        }
        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .btn { 
          display: inline-block; 
          background-color: #F45B69; 
          color: white; 
          padding: 12px 28px; 
          border-radius: 50px; 
          text-decoration: none; 
          font-weight: bold; 
          margin: 10px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
          background-color: #E63946;
        }
        .btn-primary { 
          background-color: #028090; 
        }
        .btn-primary:hover {
          background-color: #114B5F;
        }
        .cta { 
          background-color: #F45B69; 
          color: white; 
          padding: 50px 20px; 
          text-align: center; 
          border-radius: 12px; 
          margin-bottom: 40px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .cta h2 {
          color: white;
          font-size: 2rem;
          margin-bottom: 15px;
        }
        .section-title {
          position: relative;
          margin-bottom: 40px;
          padding-bottom: 15px;
        }
        .section-title:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 3px;
          background-color: #028090;
        }
        .job-list, .scheme-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .job-card, .scheme-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          padding: 25px;
          transition: transform 0.3s, box-shadow 0.3s;
          display: flex;
          flex-direction: column;
        }
        .job-card:hover, .scheme-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }
        .job-card h3, .scheme-card h3 {
          margin-top: 0;
          color: #114B5F;
        }
        .job-meta, .scheme-meta {
          display: flex;
          margin-bottom: 10px;
          font-size: 0.9rem;
          color: #666;
        }
        .job-meta > div, .scheme-meta > div {
          margin-right: 15px;
          display: flex;
          align-items: center;
        }
        .job-meta svg, .scheme-meta svg {
          margin-right: 5px;
          height: 16px;
          width: 16px;
        }
        .btn-sm {
          padding: 8px 20px;
          font-size: 0.9rem;
          margin-top: auto;
          align-self: start;
        }
        .search-box {
          margin-bottom: 40px;
          display: flex;
          justify-content: center;
        }
        .search-box input {
          padding: 12px 20px;
          width: 60%;
          border: 1px solid #ddd;
          border-top-left-radius: 50px;
          border-bottom-left-radius: 50px;
          font-size: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border-right: none;
        }
        .search-box button {
          background: #028090;
          color: white;
          border: none;
          padding: 0 25px;
          border-top-right-radius: 50px;
          border-bottom-right-radius: 50px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .search-box button:hover {
          background: #114B5F;
        }
        .tab-container {
          margin-bottom: 40px;
        }
        .tabs {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }
        .tab {
          padding: 12px 25px;
          background: #f5f5f5;
          border: none;
          cursor: pointer;
          margin: 0 5px;
          border-radius: 30px;
          transition: all 0.3s;
        }
        .tab.active {
          background: #028090;
          color: white;
        }
        .tab-content {
          display: none;
        }
        .tab-content.active {
          display: block;
          animation: fadeIn 0.5s;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      </style>
    </head>
    <body>
      <div class="overlay">
        <div class="container">
          <nav>
            <a href="/">Home</a>
            <a href="/jobs">Jobs</a>
            <a href="/schemes">Gov. Schemes</a>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
            <a href="/aadhar-verification">Aadhar Verification</a>
          </nav>

          <div class="hero">
            <h1>Tamil Nadu Migrant Worker Portal</h1>
            <p>A comprehensive platform to register, manage, and support migrant workers across Tamil Nadu with job opportunities and government scheme access</p>
            <a href="/register" class="btn btn-primary">Register as a Worker</a>
            <a href="/login" class="btn">Login to Account</a>
            <a href="/aadhar-verification" class="btn">Verify Aadhar</a>
          </div>

          <h2 class="section-title">Key Features</h2>
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

          <div class="tab-container">
            <div class="tabs">
              <button class="tab active" onclick="openTab(event, 'jobs')">Available Jobs</button>
              <button class="tab" onclick="openTab(event, 'schemes')">Government Schemes</button>
            </div>

            <div id="jobs" class="tab-content active">
              <div class="search-box">
                <input type="text" placeholder="Search for jobs by title, location, or skill...">
                <button>Search</button>
              </div>

              <div class="job-list">
                <div class="job-card">
                  <h3>Construction Worker</h3>
                  <div class="job-meta">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      Chennai
                    </div>
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      Full-time
                    </div>
                  </div>
                  <p>We are looking for experienced construction workers for our new residential project in Chennai. Daily wages with overtime benefits.</p>
                  <div class="job-meta">
                    <div>Salary: ₹500-600/day</div>
                  </div>
                  <a href="/jobs/1" class="btn btn-sm">Apply Now</a>
                </div>

                <div class="job-card">
                  <h3>Factory Worker</h3>
                  <div class="job-meta">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      Coimbatore
                    </div>
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      Full-time
                    </div>
                  </div>
                  <p>Textile factory in Coimbatore requires workers for various positions. Experience in textile industry preferred but not required.</p>
                  <div class="job-meta">
                    <div>Salary: ₹12,000-15,000/month</div>
                  </div>
                  <a href="/jobs/2" class="btn btn-sm">Apply Now</a>
                </div>

                <div class="job-card">
                  <h3>Agricultural Helper</h3>
                  <div class="job-meta">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      Thanjavur
                    </div>
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      Seasonal
                    </div>
                  </div>
                  <p>Farm workers needed for rice plantation and harvesting. Accommodation provided. Seasonal work with potential for long-term employment.</p>
                  <div class="job-meta">
                    <div>Salary: ₹350-450/day + meals</div>
                  </div>
                  <a href="/jobs/3" class="btn btn-sm">Apply Now</a>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="/jobs" class="btn btn-primary">View All Jobs</a>
              </div>
            </div>

            <div id="schemes" class="tab-content">
              <div class="search-box">
                <input type="text" placeholder="Search for government schemes...">
                <button>Search</button>
              </div>

              <div class="scheme-list">
                <div class="scheme-card">
                  <h3>PM-KISAN Scheme</h3>
                  <div class="scheme-meta">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path></svg>
                      Central Government
                    </div>
                  </div>
                  <p>Income support of ₹6,000 per year to all land holding farmer families in three equal installments.</p>
                  <a href="/schemes/1" class="btn btn-sm">Check Eligibility</a>
                </div>

                <div class="scheme-card">
                  <h3>Pradhan Mantri Awas Yojana</h3>
                  <div class="scheme-meta">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path></svg>
                      Central Government
                    </div>
                  </div>
                  <p>Housing scheme providing financial assistance up to ₹2.67 lakh for construction of houses for eligible families.</p>
                  <a href="/schemes/2" class="btn btn-sm">Check Eligibility</a>
                </div>

                <div class="scheme-card">
                  <h3>Tamil Nadu Rural Housing Scheme</h3>
                  <div class="scheme-meta">
                    <div>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path></svg>
                      State Government
                    </div>
                  </div>
                  <p>State scheme offering ₹1.8 lakh financial assistance to construct pucca houses in rural areas for eligible families.</p>
                  <a href="/schemes/3" class="btn btn-sm">Check Eligibility</a>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="/schemes" class="btn btn-primary">View All Schemes</a>
              </div>
            </div>
          </div>

          <div class="cta">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of migrant workers who have streamlined their work experience through our platform</p>
            <a href="/register" class="btn">Register Now</a>
          </div>

          <p style="text-align: center;">© 2025 Tamil Nadu Migrant Worker Portal. All rights reserved.</p>
        </div>
      </div>

      <script>
        function openTab(evt, tabName) {
          // Hide all tab content
          var tabcontent = document.getElementsByClassName("tab-content");
          for (var i = 0; i < tabcontent.length; i++) {
            tabcontent[i].classList.remove("active");
          }
          
          // Remove active class from all tabs
          var tablinks = document.getElementsByClassName("tab");
          for (var i = 0; i < tablinks.length; i++) {
            tablinks[i].classList.remove("active");
          }
          
          // Show the current tab and add active class to the button
          document.getElementById(tabName).classList.add("active");
          evt.currentTarget.classList.add("active");
        }
      </script>
      
      <!-- Load the chatbot script -->
      <script src="/chatbot.js"></script>
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
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 0; 
          margin: 0;
          background-image: url('https://images.unsplash.com/photo-1588097261099-b4bae4aa0ed0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80');
          background-size: cover;
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          line-height: 1.6;
          color: #333;
        }
        .overlay {
          background-color: rgba(255, 255, 255, 0.9);
          min-height: 100vh;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .container { 
          max-width: 500px; 
          width: 100%;
          background: white; 
          padding: 30px; 
          border-radius: 12px; 
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        h1 { 
          color: #114B5F; 
          text-align: center; 
          margin-bottom: 30px;
        }
        .form-group { 
          margin-bottom: 20px; 
        }
        label { 
          display: block; 
          margin-bottom: 8px; 
          font-weight: bold;
          color: #114B5F;
        }
        input { 
          width: 100%; 
          padding: 12px; 
          border: 1px solid #ddd; 
          border-radius: 8px;
          font-size: 16px;
          box-sizing: border-box;
        }
        button { 
          background: #028090; 
          color: white; 
          border: none; 
          padding: 12px 15px; 
          border-radius: 50px; 
          cursor: pointer;
          width: 100%;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.3s;
        }
        button:hover {
          background: #114B5F;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .back-link { 
          display: block; 
          margin-top: 20px; 
          text-align: center; 
          color: #028090;
          text-decoration: none;
        }
        .back-link:hover {
          text-decoration: underline;
        }
        .error-message {
          background-color: #f8d7da;
          color: #842029;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          display: none;
        }
        .register-link {
          text-align: center;
          margin-top: 20px;
          font-size: 0.9rem;
        }
        .register-link a {
          color: #028090;
          text-decoration: none;
          font-weight: bold;
        }
        .register-link a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="overlay">
        <div class="container">
          <h1>Login to Your Account</h1>
          
          <div id="errorMessage" class="error-message"></div>
          
          <form id="loginForm" action="/api/auth/login" method="post">
            <div class="form-group">
              <label for="email">Email Address or Worker ID</label>
              <input type="text" id="email" name="email" placeholder="Enter your email or ID" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" placeholder="Enter your password" required>
            </div>
            <button type="submit">Login</button>
          </form>
          
          <div class="login-note" style="margin-top: 20px; text-align: center; font-size: 0.9rem; color: #666;">
            <strong>For testing purposes:</strong><br>
            Worker login: john@example.com / password<br>
            Admin login: admin@example.com / admin123
          </div>
          
          <div class="register-link">
            Don't have an account? <a href="/register">Register Now</a>
          </div>
          
          <a href="/" class="back-link">← Back to Home</a>
        </div>
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
        <form action="/api/auth/register" method="post">
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

// Jobs listing page
app.get('/jobs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Job Listings - TN Migrant Worker Portal</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 0; 
          margin: 0;
          background-image: url('https://images.unsplash.com/photo-1588097261099-b4bae4aa0ed0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80');
          background-size: cover;
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          line-height: 1.6;
          color: #333;
        }
        .overlay {
          background-color: rgba(255, 255, 255, 0.9);
          min-height: 100vh;
          padding: 20px;
        }
        .container { 
          max-width: 1100px; 
          margin: 0 auto; 
          background: white; 
          padding: 30px; 
          border-radius: 12px; 
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        h1, h2 { 
          color: #114B5F; 
          text-align: center; 
        }
        h3 {
          color: #028090;
        }
        nav { 
          background-color: #114B5F; 
          padding: 15px; 
          border-radius: 8px; 
          margin-bottom: 30px; 
          text-align: center; 
        }
        nav a { 
          color: white; 
          text-decoration: none; 
          margin: 0 15px; 
          font-weight: bold; 
          transition: color 0.3s;
        }
        nav a:hover {
          color: #E4FDE1;
        }
        .hero { 
          background: linear-gradient(135deg, #114B5F, #028090); 
          color: white; 
          padding: 40px 20px; 
          text-align: center; 
          border-radius: 12px; 
          margin-bottom: 40px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .btn { 
          display: inline-block; 
          background-color: #F45B69; 
          color: white; 
          padding: 12px 28px; 
          border-radius: 50px; 
          text-decoration: none; 
          font-weight: bold; 
          margin: 10px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
          background-color: #E63946;
        }
        .btn-primary { 
          background-color: #028090; 
        }
        .btn-primary:hover {
          background-color: #114B5F;
        }
        .section-title {
          position: relative;
          margin-bottom: 40px;
          padding-bottom: 15px;
        }
        .section-title:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 3px;
          background-color: #028090;
        }
        .search-box {
          margin-bottom: 40px;
          display: flex;
          justify-content: center;
        }
        .search-box input {
          padding: 12px 20px;
          width: 60%;
          border: 1px solid #ddd;
          border-top-left-radius: 50px;
          border-bottom-left-radius: 50px;
          font-size: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border-right: none;
        }
        .search-box button {
          background: #028090;
          color: white;
          border: none;
          padding: 0 25px;
          border-top-right-radius: 50px;
          border-bottom-right-radius: 50px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .search-box button:hover {
          background: #114B5F;
        }
        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 30px;
          justify-content: center;
        }
        .filter-group {
          display: flex;
          align-items: center;
          background: #f5f5f5;
          padding: 8px 15px;
          border-radius: 50px;
        }
        .filter-group label {
          margin-right: 10px;
          font-weight: bold;
          color: #114B5F;
        }
        .filter-group select {
          border: none;
          background: transparent;
          padding: 5px;
          border-radius: 4px;
          color: #333;
        }
        .job-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .job-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          padding: 25px;
          transition: transform 0.3s, box-shadow 0.3s;
          display: flex;
          flex-direction: column;
          border: 1px solid #eee;
        }
        .job-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }
        .job-card h3 {
          margin-top: 0;
          color: #114B5F;
        }
        .job-meta {
          display: flex;
          margin-bottom: 10px;
          font-size: 0.9rem;
          color: #666;
          flex-wrap: wrap;
        }
        .job-meta > div {
          margin-right: 15px;
          display: flex;
          align-items: center;
          margin-bottom: 5px;
        }
        .job-meta svg {
          margin-right: 5px;
          height: 16px;
          width: 16px;
        }
        .btn-sm {
          padding: 8px 20px;
          font-size: 0.9rem;
          margin-top: auto;
          align-self: start;
        }
        .pagination {
          display: flex;
          justify-content: center;
          margin-top: 40px;
          margin-bottom: 20px;
        }
        .pagination a {
          display: inline-block;
          padding: 8px 16px;
          margin: 0 5px;
          border-radius: 4px;
          background: #f5f5f5;
          color: #333;
          text-decoration: none;
          transition: all 0.2s;
        }
        .pagination a:hover, .pagination a.active {
          background: #028090;
          color: white;
        }
        .back-link { 
          display: block; 
          margin-top: 20px; 
          text-align: center; 
          color: #0369a1; 
        }
      </style>
    </head>
    <body>
      <div class="overlay">
        <div class="container">
          <nav>
            <a href="/">Home</a>
            <a href="/jobs">Jobs</a>
            <a href="/schemes">Gov. Schemes</a>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
            <a href="/aadhar-verification">Aadhar Verification</a>
          </nav>

          <div class="hero">
            <h1>Available Jobs</h1>
            <p>Find suitable employment opportunities across Tamil Nadu</p>
          </div>

          <div class="search-box">
            <input type="text" placeholder="Search for jobs by title, location, or skill...">
            <button>Search</button>
          </div>

          <div class="filters">
            <div class="filter-group">
              <label>Location:</label>
              <select id="locationFilter">
                <option value="all">All Locations</option>
                <option value="Chennai">Chennai</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Madurai">Madurai</option>
                <option value="Thanjavur">Thanjavur</option>
                <option value="Salem">Salem</option>
                <option value="Tiruchirapalli">Tiruchirapalli</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Job Type:</label>
              <select id="typeFilter">
                <option value="all">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Seasonal">Seasonal</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Salary Range:</label>
              <select id="salaryFilter">
                <option value="all">Any Salary</option>
                <option value="0-10000">Under ₹10,000/month</option>
                <option value="10000-15000">₹10,000 - ₹15,000/month</option>
                <option value="15000-20000">₹15,000 - ₹20,000/month</option>
                <option value="20000+">Above ₹20,000/month</option>
              </select>
            </div>
          </div>

          <div class="job-list">
            <div class="job-card">
              <h3>Construction Worker</h3>
              <div class="job-meta">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  Chennai
                </div>
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Full-time
                </div>
              </div>
              <p>We are looking for experienced construction workers for our new residential project in Chennai. Daily wages with overtime benefits.</p>
              <div class="job-meta">
                <div>Salary: ₹500-600/day</div>
              </div>
              <a href="/jobs/1" class="btn btn-sm">Apply Now</a>
            </div>

            <div class="job-card">
              <h3>Factory Worker</h3>
              <div class="job-meta">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  Coimbatore
                </div>
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Full-time
                </div>
              </div>
              <p>Textile factory in Coimbatore requires workers for various positions. Experience in textile industry preferred but not required.</p>
              <div class="job-meta">
                <div>Salary: ₹12,000-15,000/month</div>
              </div>
              <a href="/jobs/2" class="btn btn-sm">Apply Now</a>
            </div>

            <div class="job-card">
              <h3>Agricultural Helper</h3>
              <div class="job-meta">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  Thanjavur
                </div>
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Seasonal
                </div>
              </div>
              <p>Farm workers needed for rice plantation and harvesting. Accommodation provided. Seasonal work with potential for long-term employment.</p>
              <div class="job-meta">
                <div>Salary: ₹350-450/day + meals</div>
              </div>
              <a href="/jobs/3" class="btn btn-sm">Apply Now</a>
            </div>

            <div class="job-card">
              <h3>Hotel Staff</h3>
              <div class="job-meta">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  Madurai
                </div>
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Full-time
                </div>
              </div>
              <p>Popular hotel chain looking for housekeeping staff, waiters, and kitchen helpers. Previous experience in hospitality sector is a plus.</p>
              <div class="job-meta">
                <div>Salary: ₹10,000-18,000/month + tips</div>
              </div>
              <a href="/jobs/4" class="btn btn-sm">Apply Now</a>
            </div>

            <div class="job-card">
              <h3>Security Guard</h3>
              <div class="job-meta">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  Chennai
                </div>
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Full-time
                </div>
              </div>
              <p>Security guards needed for residential apartments and commercial buildings. Different shift timings available.</p>
              <div class="job-meta">
                <div>Salary: ₹12,000-14,000/month</div>
              </div>
              <a href="/jobs/5" class="btn btn-sm">Apply Now</a>
            </div>

            <div class="job-card">
              <h3>Delivery Driver</h3>
              <div class="job-meta">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  Chennai
                </div>
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  Full-time
                </div>
              </div>
              <p>Food delivery drivers needed urgently. Must have two-wheeler with valid driving license. Flexible timings available.</p>
              <div class="job-meta">
                <div>Salary: ₹15,000-25,000/month</div>
              </div>
              <a href="/jobs/6" class="btn btn-sm">Apply Now</a>
            </div>
          </div>

          <div class="pagination">
            <a href="#" class="active">1</a>
            <a href="#">2</a>
            <a href="#">3</a>
            <a href="#">Next →</a>
          </div>

          <a href="/" class="back-link">← Back to Home</a>
        </div>
      </div>
      
      <script>
        // Job filtering functionality
        document.getElementById('locationFilter').addEventListener('change', filterJobs);
        document.getElementById('typeFilter').addEventListener('change', filterJobs);
        document.getElementById('salaryFilter').addEventListener('change', filterJobs);
        
        function filterJobs() {
          const locationFilter = document.getElementById('locationFilter').value;
          const typeFilter = document.getElementById('typeFilter').value;
          const salaryFilter = document.getElementById('salaryFilter').value;
          
          const jobCards = document.querySelectorAll('.job-list .job-card');
          
          jobCards.forEach(card => {
            // Extract information from the job card
            const jobLocation = card.querySelector('.job-meta div:first-child').textContent.trim();
            const jobType = card.querySelector('.job-meta div:nth-child(2)').textContent.trim();
            const jobSalary = card.querySelector('.job-meta:last-of-type').textContent.trim();
            
            // Check if job matches all selected filters
            const locationMatch = locationFilter === 'all' || jobLocation.includes(locationFilter);
            const typeMatch = typeFilter === 'all' || jobType.includes(typeFilter);
            
            // For salary, we need more complex logic
            let salaryMatch = true;
            if (salaryFilter !== 'all') {
              // This is a simple approach - in a real app, would need more robust parsing
              const salaryText = jobSalary.toLowerCase();
              
              if (salaryFilter === '0-10000' && !salaryText.includes('month')) {
                // Daily wage jobs are typically below 10k/month
                salaryMatch = true;
              } else if (salaryFilter === '0-10000' && salaryText.includes('10,000')) {
                salaryMatch = true;
              } else if (salaryFilter === '10000-15000' && (salaryText.includes('12,000') || salaryText.includes('15,000'))) {
                salaryMatch = true;
              } else if (salaryFilter === '15000-20000' && salaryText.includes('18,000')) {
                salaryMatch = true;
              } else if (salaryFilter === '20000+' && salaryText.includes('25,000')) {
                salaryMatch = true;
              } else {
                // Default logic for other cases
                salaryMatch = salaryFilter === 'all';
              }
            }
            
            // Show or hide the job card based on filter matches
            if (locationMatch && typeMatch && salaryMatch) {
              card.style.display = '';
            } else {
              card.style.display = 'none';
            }
          });
        }
        
        // Search functionality
        const searchInput = document.querySelector('.search-box input');
        const searchButton = document.querySelector('.search-box button');
        
        searchButton.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            performSearch();
          }
        });
        
        function performSearch() {
          const searchTerm = searchInput.value.toLowerCase().trim();
          
          if (searchTerm === '') {
            // If search is empty, reset all filters and show all jobs
            document.getElementById('locationFilter').value = 'all';
            document.getElementById('typeFilter').value = 'all';
            document.getElementById('salaryFilter').value = 'all';
            filterJobs();
            return;
          }
          
          const jobCards = document.querySelectorAll('.job-list .job-card');
          
          jobCards.forEach(card => {
            const jobTitle = card.querySelector('h3').textContent.toLowerCase();
            const jobLocation = card.querySelector('.job-meta div:first-child').textContent.toLowerCase();
            const jobDescription = card.querySelector('p').textContent.toLowerCase();
            
            // Check if job matches search term
            if (jobTitle.includes(searchTerm) || 
                jobLocation.includes(searchTerm) || 
                jobDescription.includes(searchTerm)) {
              card.style.display = '';
            } else {
              card.style.display = 'none';
            }
          });
        }
      </script>
    </body>
    </html>
  `);
});

// Government schemes page
app.get('/schemes', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Government Schemes - TN Migrant Worker Portal</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 0; 
          margin: 0;
          background-image: url('https://images.unsplash.com/photo-1588097261099-b4bae4aa0ed0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80');
          background-size: cover;
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          line-height: 1.6;
          color: #333;
        }
        .overlay {
          background-color: rgba(255, 255, 255, 0.9);
          min-height: 100vh;
          padding: 20px;
        }
        .container { 
          max-width: 1100px; 
          margin: 0 auto; 
          background: white; 
          padding: 30px; 
          border-radius: 12px; 
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        h1, h2 { 
          color: #114B5F; 
          text-align: center; 
        }
        h3 {
          color: #028090;
        }
        nav { 
          background-color: #114B5F; 
          padding: 15px; 
          border-radius: 8px; 
          margin-bottom: 30px; 
          text-align: center; 
        }
        nav a { 
          color: white; 
          text-decoration: none; 
          margin: 0 15px; 
          font-weight: bold; 
          transition: color 0.3s;
        }
        nav a:hover {
          color: #E4FDE1;
        }
        .hero { 
          background: linear-gradient(135deg, #114B5F, #028090); 
          color: white; 
          padding: 40px 20px; 
          text-align: center; 
          border-radius: 12px; 
          margin-bottom: 40px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .btn { 
          display: inline-block; 
          background-color: #F45B69; 
          color: white; 
          padding: 12px 28px; 
          border-radius: 50px; 
          text-decoration: none; 
          font-weight: bold; 
          margin: 10px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
          background-color: #E63946;
        }
        .btn-primary { 
          background-color: #028090; 
        }
        .btn-primary:hover {
          background-color: #114B5F;
        }
        .section-title {
          position: relative;
          margin-bottom: 40px;
          padding-bottom: 15px;
        }
        .section-title:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100px;
          height: 3px;
          background-color: #028090;
        }
        .search-box {
          margin-bottom: 40px;
          display: flex;
          justify-content: center;
        }
        .search-box input {
          padding: 12px 20px;
          width: 60%;
          border: 1px solid #ddd;
          border-top-left-radius: 50px;
          border-bottom-left-radius: 50px;
          font-size: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border-right: none;
        }
        .search-box button {
          background: #028090;
          color: white;
          border: none;
          padding: 0 25px;
          border-top-right-radius: 50px;
          border-bottom-right-radius: 50px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .search-box button:hover {
          background: #114B5F;
        }
        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 30px;
          justify-content: center;
        }
        .filter-group {
          display: flex;
          align-items: center;
          background: #f5f5f5;
          padding: 8px 15px;
          border-radius: 50px;
        }
        .filter-group label {
          margin-right: 10px;
          font-weight: bold;
          color: #114B5F;
        }
        .filter-group select {
          border: none;
          background: transparent;
          padding: 5px;
          border-radius: 4px;
          color: #333;
        }
        .scheme-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .scheme-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          padding: 25px;
          transition: transform 0.3s, box-shadow 0.3s;
          display: flex;
          flex-direction: column;
          border: 1px solid #eee;
        }
        .scheme-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }
        .scheme-card h3 {
          margin-top: 0;
          color: #114B5F;
        }
        .scheme-meta {
          display: flex;
          margin-bottom: 10px;
          font-size: 0.9rem;
          color: #666;
        }
        .scheme-meta > div {
          margin-right: 15px;
          display: flex;
          align-items: center;
        }
        .scheme-meta svg {
          margin-right: 5px;
          height: 16px;
          width: 16px;
        }
        .features {
          margin-top: 15px;
          margin-bottom: 20px;
        }
        .feature-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        .feature-item svg {
          margin-right: 8px;
          flex-shrink: 0;
          color: #028090;
          margin-top: 3px;
        }
        .btn-sm {
          padding: 8px 20px;
          font-size: 0.9rem;
          margin-top: auto;
          align-self: start;
        }
        .pagination {
          display: flex;
          justify-content: center;
          margin-top: 40px;
          margin-bottom: 20px;
        }
        .pagination a {
          display: inline-block;
          padding: 8px 16px;
          margin: 0 5px;
          border-radius: 4px;
          background: #f5f5f5;
          color: #333;
          text-decoration: none;
          transition: all 0.2s;
        }
        .pagination a:hover, .pagination a.active {
          background: #028090;
          color: white;
        }
        .back-link { 
          display: block; 
          margin-top: 20px; 
          text-align: center; 
          color: #0369a1; 
        }
      </style>
    </head>
    <body>
      <div class="overlay">
        <div class="container">
          <nav>
            <a href="/">Home</a>
            <a href="/jobs">Jobs</a>
            <a href="/schemes">Gov. Schemes</a>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
            <a href="/aadhar-verification">Aadhar Verification</a>
          </nav>

          <div class="hero">
            <h1>Government Schemes</h1>
            <p>Access government welfare schemes and benefits available for migrant workers</p>
          </div>

          <div class="search-box">
            <input type="text" placeholder="Search for schemes by name, benefit, or eligibility...">
            <button>Search</button>
          </div>

          <div class="filters">
            <div class="filter-group">
              <label>Provider:</label>
              <select>
                <option value="">All Providers</option>
                <option value="Central">Central Government</option>
                <option value="State">State Government</option>
                <option value="Local">Local Bodies</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Category:</label>
              <select>
                <option value="">All Categories</option>
                <option value="Housing">Housing</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Financial">Financial Assistance</option>
                <option value="Education">Education</option>
                <option value="Employment">Employment</option>
              </select>
            </div>
          </div>

          <div class="scheme-list">
            <div class="scheme-card">
              <h3>PM-KISAN Scheme</h3>
              <div class="scheme-meta">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path></svg>
                  Central Government
                </div>
              </div>
              <p>Income support of ₹6,000 per year to all land holding farmer families in three equal installments.</p>
              <div class="features">
                <div class="feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Financial assistance for farming families</span>
                </div>
                <div class="feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                  <span>Eligibility: Small and marginal farmers with cultivable landholding</span>
                </div>
              </div>
              <a href="/schemes/1" class="btn btn-sm">Check Eligibility</a>
            </div>

            <div class="scheme-card">
              <h3>Pradhan Mantri Awas Yojana</h3>
              <div class="scheme-meta">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path></svg>
                  Central Government
                </div>
              </div>
              <p>Housing scheme providing financial assistance up to ₹2.67 lakh for construction of houses for eligible families.</p>
              <div class="features">
                <div class="feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Financial assistance for house construction</span>
                </div>
                <div class="feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                  <span>Eligibility: Households without pucca house, belonging to EWS/LIG/MIG categories</span>
                </div>
              </div>
              <a href="/schemes/2" class="btn btn-sm">Check Eligibility</a>
            </div>

            <div class="scheme-card">
              <h3>Tamil Nadu Rural Housing Scheme</h3>
              <div class="scheme-meta">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path></svg>
                  State Government
                </div>
              </div>
              <p>State scheme offering ₹1.8 lakh financial assistance to construct pucca houses in rural areas for eligible families.</p>
              <div class="features">
                <div class="feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Financial assistance for rural house construction</span>
                </div>
                <div class="feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                  <span>Eligibility: Rural households without pucca house, annual income below ₹60,000</span>
                </div>
              </div>
              <a href="/schemes/3" class="btn btn-sm">Check Eligibility</a>
            </div>

            <div class="scheme-card">
              <h3>Pradhan Mantri Shram Yogi Maandhan</h3>
              <div class="scheme-meta">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path></svg>
                  Central Government
                </div>
              </div>
              <p>Pension scheme for unorganized workers providing assured monthly pension of ₹3,000 after age of 60.</p>
              <div class="features">
                <div class="feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Pension benefits for unorganized workers</span>
                </div>
                <div class="feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                  <span>Eligibility: Unorganized workers aged 18-40 years with monthly income up to ₹15,000</span>
                </div>
              </div>
              <a href="/schemes/4" class="btn btn-sm">Check Eligibility</a>
            </div>

            <div class="scheme-card">
              <h3>Chief Minister Comprehensive Health Insurance Scheme</h3>
              <div class="scheme-meta">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path></svg>
                  State Government
                </div>
              </div>
              <p>Health insurance scheme providing coverage up to ₹5 lakhs per family per year for medical and surgical treatments.</p>
              <div class="features">
                <div class="feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Cashless medical treatment in government and empanelled private hospitals</span>
                </div>
                <div class="feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                  <span>Eligibility: Annual family income less than ₹72,000, Tamil Nadu residents</span>
                </div>
              </div>
              <a href="/schemes/5" class="btn btn-sm">Check Eligibility</a>
            </div>

            <div class="scheme-card">
              <h3>Jeevan Jyoti Bima Yojana</h3>
              <div class="scheme-meta">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path></svg>
                  Central Government
                </div>
              </div>
              <p>Life insurance scheme providing coverage of ₹2 lakh in case of death of the insured person for a nominal premium of ₹330 per annum.</p>
              <div class="features">
                <div class="feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Life insurance coverage for low-income individuals</span>
                </div>
                <div class="feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                  <span>Eligibility: Individuals aged 18-50 years with a bank account</span>
                </div>
              </div>
              <a href="/schemes/6" class="btn btn-sm">Check Eligibility</a>
            </div>
          </div>

          <div class="pagination">
            <a href="#" class="active">1</a>
            <a href="#">2</a>
            <a href="#">Next →</a>
          </div>

          <a href="/" class="back-link">← Back to Home</a>
        </div>
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
          
          // Send request to the API
          fetch('/api/aadhar/request-otp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ aadharNumber }),
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              // Move to step 2
              document.getElementById('step1').classList.remove('active');
              document.getElementById('step2').classList.add('active');
              
              // Show the OTP for testing purposes
              console.log('Test OTP:', data.testOtp);
              alert('For testing purposes, your OTP is: ' + data.testOtp);
            } else {
              document.getElementById('errorMessage').innerHTML = data.message;
              document.getElementById('errorMessage').style.display = 'block';
              setTimeout(() => {
                document.getElementById('errorMessage').style.display = 'none';
              }, 3000);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            document.getElementById('errorMessage').innerHTML = 'An error occurred. Please try again.';
            document.getElementById('errorMessage').style.display = 'block';
            setTimeout(() => {
              document.getElementById('errorMessage').style.display = 'none';
            }, 3000);
          });
        }
        
        function verifyOTP() {
          const aadharNumber = document.getElementById('aadharNumber').value;
          const otp = document.getElementById('otpInput').value;
          
          if (otp.length !== 6 || !/^[0-9]{6}$/.test(otp)) {
            document.getElementById('errorMessage').innerHTML = 'Please enter a valid 6-digit OTP.';
            document.getElementById('errorMessage').style.display = 'block';
            setTimeout(() => {
              document.getElementById('errorMessage').style.display = 'none';
            }, 3000);
            return;
          }
          
          // Send request to the API
          fetch('/api/aadhar/verify-otp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ aadharNumber, otp }),
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              // Hide step 2
              document.getElementById('step2').classList.remove('active');
              
              // Show step 3 (success)
              document.getElementById('step3').classList.add('active');
              
              // Hide back link
              document.getElementById('backLink').style.display = 'none';
            } else {
              document.getElementById('errorMessage').innerHTML = data.message;
              document.getElementById('errorMessage').style.display = 'block';
              setTimeout(() => {
                document.getElementById('errorMessage').style.display = 'none';
              }, 3000);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            document.getElementById('errorMessage').innerHTML = 'An error occurred. Please try again.';
            document.getElementById('errorMessage').style.display = 'block';
            setTimeout(() => {
              document.getElementById('errorMessage').style.display = 'none';
            }, 3000);
          });
        }
        
        function resendOTP() {
          const aadharNumber = document.getElementById('aadharNumber').value;
          
          // Send request to the API
          fetch('/api/aadhar/request-otp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ aadharNumber }),
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              document.getElementById('successMessage').innerHTML = 'A new OTP has been sent to your mobile number.';
              document.getElementById('successMessage').style.display = 'block';
              
              // Show the OTP for testing purposes
              console.log('Test OTP:', data.testOtp);
              alert('For testing purposes, your OTP is: ' + data.testOtp);
              
              setTimeout(() => {
                document.getElementById('successMessage').style.display = 'none';
              }, 3000);
            } else {
              document.getElementById('errorMessage').innerHTML = data.message;
              document.getElementById('errorMessage').style.display = 'block';
              setTimeout(() => {
                document.getElementById('errorMessage').style.display = 'none';
              }, 3000);
            }
          })
          .catch(error => {
            console.error('Error:', error);
            document.getElementById('errorMessage').innerHTML = 'An error occurred. Please try again.';
            document.getElementById('errorMessage').style.display = 'block';
            setTimeout(() => {
              document.getElementById('errorMessage').style.display = 'none';
            }, 3000);
          });
        }
      </script>
    </body>
    </html>
  `);
});

// API Routes
app.get('/api', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>API Documentation - TN Migrant Worker Portal</title>
      <style>
        body { font-family: Arial; padding: 20px; background-color: #f0f9ff; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1, h2, h3 { color: #0369a1; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .endpoint { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
        .method { display: inline-block; padding: 5px 10px; border-radius: 4px; font-weight: bold; margin-right: 10px; }
        .get { background: #d1ecf1; color: #0c5460; }
        .post { background: #d4edda; color: #155724; }
        .url { font-family: monospace; background: #f8f9fa; padding: 5px; border-radius: 4px; }
        .back-link { display: block; margin-top: 20px; text-align: center; color: #0369a1; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>API Documentation</h1>
        <p>This page documents the available API endpoints for the Tamil Nadu Migrant Worker Portal.</p>
        
        <div class="endpoint">
          <h2>User Endpoints</h2>
          
          <h3>Get Current User</h3>
          <div>
            <span class="method get">GET</span>
            <span class="url">/api/users/me</span>
          </div>
          <p>Returns information about the currently authenticated user.</p>
          <pre>{
  "_id": "1",
  "name": "John Doe",
  "email": "john@example.com",
  "workerId": "TN-UP-23-123456",
  "isAadharVerified": true
}</pre>
        </div>
        
        <div class="endpoint">
          <h2>Authentication Endpoints</h2>
          
          <h3>Login</h3>
          <div>
            <span class="method post">POST</span>
            <span class="url">/api/auth/login</span>
          </div>
          <p>Authenticates a user and returns a token.</p>
          <pre>{
  "email": "john@example.com",
  "password": "password"
}</pre>
          
          <h3>Register</h3>
          <div>
            <span class="method post">POST</span>
            <span class="url">/api/auth/register</span>
          </div>
          <p>Registers a new worker and returns a unique worker ID.</p>
        </div>
        
        <div class="endpoint">
          <h2>Aadhar Verification Endpoints</h2>
          
          <h3>Request OTP</h3>
          <div>
            <span class="method post">POST</span>
            <span class="url">/api/aadhar/request-otp</span>
          </div>
          <p>Sends an OTP to the mobile number linked with the provided Aadhar number.</p>
          <pre>{
  "aadharNumber": "123456789012"
}</pre>
          
          <h3>Verify OTP</h3>
          <div>
            <span class="method post">POST</span>
            <span class="url">/api/aadhar/verify-otp</span>
          </div>
          <p>Verifies the OTP for the given Aadhar number.</p>
          <pre>{
  "aadharNumber": "123456789012",
  "otp": "123456"
}</pre>
        </div>
        
        <a href="/" class="back-link">← Back to Home</a>
      </div>
    </body>
    </html>
  `);
});

// Mock data for jobs and schemes
const jobs = [
  {
    id: 1,
    title: 'Construction Worker',
    location: 'Chennai',
    type: 'Full-time',
    description: 'We are looking for experienced construction workers for our new residential project in Chennai. Daily wages with overtime benefits.',
    salary: '₹500-600/day',
    company: 'TN Construction Ltd',
    postedDate: '2025-05-01',
    skills: ['Construction', 'Labor', 'Building']
  },
  {
    id: 2,
    title: 'Factory Worker',
    location: 'Coimbatore',
    type: 'Full-time',
    description: 'Textile factory in Coimbatore requires workers for various positions. Experience in textile industry preferred but not required.',
    salary: '₹12,000-15,000/month',
    company: 'Coimbatore Textiles',
    postedDate: '2025-05-03',
    skills: ['Manufacturing', 'Textiles', 'Machine Operation']
  },
  {
    id: 3,
    title: 'Agricultural Helper',
    location: 'Thanjavur',
    type: 'Seasonal',
    description: 'Farm workers needed for rice plantation and harvesting. Accommodation provided. Seasonal work with potential for long-term employment.',
    salary: '₹350-450/day + meals',
    company: 'Cauvery Farms',
    postedDate: '2025-05-02',
    skills: ['Agriculture', 'Farming', 'Harvesting']
  },
  {
    id: 4,
    title: 'Hotel Staff',
    location: 'Madurai',
    type: 'Full-time',
    description: 'Popular hotel chain looking for housekeeping staff, waiters, and kitchen helpers. Previous experience in hospitality sector is a plus.',
    salary: '₹10,000-18,000/month + tips',
    company: 'Royal Residency',
    postedDate: '2025-04-28',
    skills: ['Hospitality', 'Customer Service', 'Cleaning']
  },
  {
    id: 5,
    title: 'Security Guard',
    location: 'Chennai',
    type: 'Full-time',
    description: 'Security guards needed for residential apartments and commercial buildings. Different shift timings available.',
    salary: '₹12,000-14,000/month',
    company: 'Secure Solutions',
    postedDate: '2025-05-04',
    skills: ['Security', 'Surveillance', 'Protection']
  }
];

const schemes = [
  {
    id: 1,
    title: 'PM-KISAN Scheme',
    provider: 'Central Government',
    description: 'Income support of ₹6,000 per year to all land holding farmer families in three equal installments.',
    benefits: 'Financial assistance for farming families',
    eligibility: 'Small and marginal farmers with cultivable landholding',
    documents: ['Aadhar Card', 'Land Records', 'Bank Account Details'],
    applicationLink: 'https://pmkisan.gov.in/'
  },
  {
    id: 2,
    title: 'Pradhan Mantri Awas Yojana',
    provider: 'Central Government',
    description: 'Housing scheme providing financial assistance up to ₹2.67 lakh for construction of houses for eligible families.',
    benefits: 'Financial assistance for house construction',
    eligibility: 'Households without pucca house, belonging to EWS/LIG/MIG categories',
    documents: ['Aadhar Card', 'Income Certificate', 'Land Document'],
    applicationLink: 'https://pmaymis.gov.in/'
  },
  {
    id: 3,
    title: 'Tamil Nadu Rural Housing Scheme',
    provider: 'State Government',
    description: 'State scheme offering ₹1.8 lakh financial assistance to construct pucca houses in rural areas for eligible families.',
    benefits: 'Financial assistance for rural house construction',
    eligibility: 'Rural households without pucca house, annual income below ₹60,000',
    documents: ['Aadhar Card', 'Income Certificate', 'Land Document'],
    applicationLink: 'https://tnrd.gov.in/'
  },
  {
    id: 4,
    title: 'Pradhan Mantri Shram Yogi Maandhan',
    provider: 'Central Government',
    description: 'Pension scheme for unorganized workers providing assured monthly pension of ₹3,000 after age of 60.',
    benefits: 'Pension benefits for unorganized workers',
    eligibility: 'Unorganized workers aged 18-40 years with monthly income up to ₹15,000',
    documents: ['Aadhar Card', 'Bank Account Details', 'Income Proof'],
    applicationLink: 'https://maandhan.in/'
  },
  {
    id: 5,
    title: 'Chief Minister Comprehensive Health Insurance Scheme',
    provider: 'State Government',
    description: 'Health insurance scheme providing coverage up to ₹5 lakhs per family per year for medical and surgical treatments.',
    benefits: 'Cashless medical treatment in government and empanelled private hospitals',
    eligibility: 'Annual family income less than ₹72,000, Tamil Nadu residents',
    documents: ['Aadhar Card', 'Income Certificate', 'Ration Card'],
    applicationLink: 'https://www.cmchistn.com/'
  }
];

// User routes
app.get('/api/users/me', (req, res) => {
  res.json(workers[0]);
});

app.get('/api/users/profile', (req, res) => {
  res.json(workers[0]);
});

app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.get('/api/documents', (req, res) => {
  res.json(documents);
});

// Job listing routes
app.get('/api/jobs', (req, res) => {
  res.json(jobs);
});

app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.find(j => j.id === parseInt(req.params.id));
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  res.json(job);
});

// Government scheme routes
app.get('/api/schemes', (req, res) => {
  res.json(schemes);
});

app.get('/api/schemes/:id', (req, res) => {
  const scheme = schemes.find(s => s.id === parseInt(req.params.id));
  if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
  res.json(scheme);
});

// Aadhar Verification APIs
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
  
  // Check if the OTP matches
  const storedOtp = otpStore[aadharNumber];
  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ success: false, message: 'Invalid OTP' });
  }
  
  // Mark Aadhar as verified
  aadharVerificationStatus[aadharNumber] = true;
  
  // Update worker record if it exists
  const workerIndex = workers.findIndex(w => w.aadharNumber === aadharNumber);
  if (workerIndex !== -1) {
    workers[workerIndex].isAadharVerified = true;
  }
  
  // Clear the OTP after successful verification
  delete otpStore[aadharNumber];
  
  return res.json({
    success: true,
    message: 'Aadhar verification successful',
    status: 'verified'
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication
  if (email === 'john@example.com' && password === 'password') {
    // Redirect to worker dashboard instead of returning JSON
    res.redirect('/worker-dashboard');
  } else if (email === 'admin@example.com' && password === 'admin123') {
    // Redirect to admin dashboard
    res.redirect('/admin-dashboard');
  } else {
    // Return error message
    res.status(401).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Login Failed - TN Migrant Worker Portal</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 0; 
            margin: 0;
            background-image: url('https://images.unsplash.com/photo-1588097261099-b4bae4aa0ed0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80');
            background-size: cover;
            background-attachment: fixed;
            background-position: center;
            background-repeat: no-repeat;
            line-height: 1.6;
            color: #333;
          }
          .overlay {
            background-color: rgba(255, 255, 255, 0.9);
            min-height: 100vh;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .container { 
            max-width: 500px; 
            width: 100%;
            background: white; 
            padding: 30px; 
            border-radius: 12px; 
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            text-align: center;
          }
          h1 { 
            color: #114B5F; 
            text-align: center; 
            margin-bottom: 20px;
          }
          .error-icon {
            color: #F45B69;
            font-size: 3rem;
            margin-bottom: 20px;
          }
          .btn { 
            display: inline-block; 
            background-color: #028090; 
            color: white; 
            padding: 12px 28px; 
            border-radius: 50px; 
            text-decoration: none; 
            font-weight: bold; 
            margin: 20px 10px;
            transition: all 0.3s;
            border: none;
            cursor: pointer;
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
            background-color: #114B5F;
          }
          .message {
            background-color: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
          }
          .login-note {
            font-size: 0.9rem;
            color: #666;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="overlay">
          <div class="container">
            <div class="error-icon">✕</div>
            <h1>Login Failed</h1>
            
            <div class="message">
              Invalid email or password. Please try again.
            </div>
            
            <p>Make sure you are using the correct credentials and try again.</p>
            
            <div class="login-note">
              <strong>For testing purposes:</strong><br>
              Worker login: john@example.com / password<br>
              Admin login: admin@example.com / admin123
            </div>
            
            <a href="/login" class="btn">Try Again</a>
            <a href="/" class="btn">Back to Home</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, phone, aadhar, homeState } = req.body;
  
  // In a real app, we would save this information to a database
  // For now, we'll just return a successful response
  
  // Generate a worker ID
  const stateCode = homeState ? homeState.substring(0, 2).toUpperCase() : 'TN';
  const workerId = 'TN-' + stateCode + '-23-' + Math.floor(100000 + Math.random() * 900000);
  
  // Send confirmation email
  try {
    const sendEmail = require('./utils/emailService');
    
    // Generate a verification token (this would normally be stored in the database)
    const verificationToken = Math.random().toString(36).substring(2, 15);
    
    // Prepare email content
    const emailOptions = {
      email: email,
      subject: 'Welcome to TN Migrant Worker Portal - Registration Successful',
      message: `Dear ${name},

Thank you for registering with the Tamil Nadu Migrant Worker Portal.

Your Worker ID is: ${workerId}

Please keep this ID safe as you will need it for all future interactions with our services.

To complete your registration, please verify your email by clicking on the following link:
https://tnmigrantportal.gov.in/verify-email?token=${verificationToken}

If you did not register for this service, please ignore this email.

Regards,
Tamil Nadu Migrant Worker Portal Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #114B5F;">Welcome to TN Migrant Worker Portal</h2>
          </div>
          <p>Dear ${name},</p>
          <p>Thank you for registering with the Tamil Nadu Migrant Worker Portal.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px;">Your Worker ID is:</p>
            <p style="font-size: 20px; font-weight: bold; color: #028090; margin: 10px 0;">${workerId}</p>
            <p style="margin: 0; font-size: 12px;">Please keep this ID safe as you will need it for all future interactions with our services.</p>
          </div>
          <p>To complete your registration, please verify your email by clicking on the following button:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="https://tnmigrantportal.gov.in/verify-email?token=${verificationToken}" style="background-color: #028090; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold;">Verify Email</a>
          </div>
          <p>If you did not register for this service, please ignore this email.</p>
          <p>Regards,<br>Tamil Nadu Migrant Worker Portal Team</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #777; text-align: center;">
            © 2025 Tamil Nadu Migrant Worker Portal. All rights reserved.
          </div>
        </div>
      `
    };
    
    // Try to send the email
    const emailSent = await sendEmail(emailOptions);
    
    // If the email fails to send, log the information for development/testing
    if (!emailSent) {
      console.log('=== EMAIL NOT SENT - FOR DEMONSTRATION PURPOSES ===');
      console.log('Registration email would have been sent to:', email);
      console.log('Verification token:', verificationToken);
      console.log('Worker ID:', workerId);
      console.log('=== END EMAIL DETAILS ===');
    } else {
      console.log('Registration confirmation email sent to:', email);
    }
  } catch (error) {
    console.error('Failed to send registration email:', error);
    console.log('=== EMAIL WOULD HAVE BEEN SENT TO ===');
    console.log('Email:', email);
    console.log('Worker ID:', workerId);
    // We'll continue with registration even if email fails
  }
  
  // Instead of sending JSON, redirect to a registration success page
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Registration Successful - TN Migrant Worker Portal</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 0; 
          margin: 0;
          background-image: url('https://images.unsplash.com/photo-1588097261099-b4bae4aa0ed0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80');
          background-size: cover;
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          line-height: 1.6;
          color: #333;
        }
        .overlay {
          background-color: rgba(255, 255, 255, 0.9);
          min-height: 100vh;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .container { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white; 
          padding: 40px; 
          border-radius: 12px; 
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          text-align: center;
        }
        h1 { 
          color: #114B5F; 
        }
        .success-icon {
          color: #28a745;
          font-size: 5rem;
          margin-bottom: 20px;
        }
        .worker-id-box {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          margin: 20px auto;
          max-width: 80%;
          border: 1px dashed #028090;
        }
        .worker-id {
          color: #028090;
          font-size: 1.5rem;
          font-weight: bold;
          letter-spacing: 1px;
        }
        .steps {
          text-align: left;
          max-width: 80%;
          margin: 30px auto;
        }
        .step {
          margin-bottom: 15px;
          display: flex;
        }
        .step-number {
          background: #028090;
          color: white;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin-right: 15px;
          flex-shrink: 0;
        }
        .btn { 
          display: inline-block; 
          background-color: #028090; 
          color: white; 
          padding: 12px 28px; 
          border-radius: 50px; 
          text-decoration: none; 
          font-weight: bold; 
          margin: 20px 10px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
          background-color: #114B5F;
        }
      </style>
    </head>
    <body>
      <div class="overlay">
        <div class="container">
          <div class="success-icon">✓</div>
          <h1>Registration Successful!</h1>
          <p>Thank you for registering with the Tamil Nadu Migrant Worker Portal, ${name}.</p>
          
          <div class="worker-id-box">
            <p>Your Worker ID is:</p>
            <div class="worker-id">${workerId}</div>
            <p><small>Please save this ID for future reference</small></p>
          </div>
          
          <div class="steps">
            <h2>Next Steps:</h2>
            <div class="step">
              <div class="step-number">1</div>
              <div>
                <strong>Verify Your Aadhar</strong><br>
                Please complete the Aadhar verification process to enable all features.
              </div>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <div>
                <strong>Check Your Email</strong><br>
                We've sent a verification link to ${email}. Please verify your email to activate your account.
              </div>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <div>
                <strong>Complete Your Profile</strong><br>
                Log in to your account and add more details to your profile to improve job match recommendations.
              </div>
            </div>
          </div>
          
          <a href="/aadhar-verification" class="btn">Verify Aadhar Now</a>
          <a href="/login" class="btn">Go to Login</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.post('/api/auth/verify-otp', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Email verified successfully! You can now login.'
  });
});

// Individual job detail page
app.get('/jobs/:id', (req, res) => {
  const jobId = parseInt(req.params.id);
  const job = jobs.find(j => j.id === jobId);
  
  if (!job) {
    return res.status(404).send(`
      <h1>404 - Job Not Found</h1>
      <p>The job you are looking for does not exist.</p>
      <a href="/jobs">Back to Jobs</a>
    `);
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${job.title} - TN Migrant Worker Portal</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 0; 
          margin: 0;
          background-image: url('https://images.unsplash.com/photo-1588097261099-b4bae4aa0ed0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80');
          background-size: cover;
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          line-height: 1.6;
          color: #333;
        }
        .overlay {
          background-color: rgba(255, 255, 255, 0.9);
          min-height: 100vh;
          padding: 20px;
        }
        .container { 
          max-width: 1100px; 
          margin: 0 auto; 
          background: white; 
          padding: 30px; 
          border-radius: 12px; 
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        h1, h2 { 
          color: #114B5F; 
        }
        h3 {
          color: #028090;
        }
        nav { 
          background-color: #114B5F; 
          padding: 15px; 
          border-radius: 8px; 
          margin-bottom: 30px; 
          text-align: center; 
        }
        nav a { 
          color: white; 
          text-decoration: none; 
          margin: 0 15px; 
          font-weight: bold; 
          transition: color 0.3s;
        }
        nav a:hover {
          color: #E4FDE1;
        }
        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        .job-title-area {
          flex: 1;
          min-width: 60%;
        }
        .job-title-area h1 {
          margin-bottom: 5px;
          margin-top: 0;
        }
        .apply-btn-area {
          margin: 20px 0;
        }
        .btn { 
          display: inline-block; 
          background-color: #F45B69; 
          color: white; 
          padding: 14px 30px; 
          border-radius: 50px; 
          text-decoration: none; 
          font-weight: bold; 
          margin: 10px 0;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
          background-color: #E63946;
        }
        .btn-primary { 
          background-color: #028090; 
        }
        .btn-primary:hover {
          background-color: #114B5F;
        }
        .job-meta {
          display: flex;
          margin: 20px 0;
          font-size: 1rem;
          color: #666;
          flex-wrap: wrap;
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
        }
        .job-meta-item {
          margin-right: 30px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        }
        .job-meta-item svg {
          margin-right: 10px;
          height: 20px;
          width: 20px;
          color: #028090;
        }
        .job-description {
          margin: 30px 0;
          line-height: 1.8;
        }
        .section-title {
          color: #114B5F;
          border-bottom: 2px solid #e1e1e1;
          padding-bottom: 10px;
          margin-top: 40px;
        }
        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 20px 0;
        }
        .skill-tag {
          background: #e1f5f7;
          padding: 8px 15px;
          border-radius: 50px;
          color: #028090;
          font-size: 0.9rem;
        }
        .company-box {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
        }
        .application-form {
          background: #f9f9f9;
          padding: 25px;
          border-radius: 8px;
          margin: 30px 0;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #114B5F;
        }
        .form-group input, .form-group textarea, .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          font-family: inherit;
        }
        .form-group textarea {
          min-height: 120px;
        }
        .required-text {
          color: #F45B69;
          font-size: 0.9rem;
          margin-bottom: 20px;
        }
        .back-link { 
          display: block; 
          margin-top: 30px; 
          color: #028090; 
          text-decoration: none;
        }
        .back-link:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="overlay">
        <div class="container">
          <nav>
            <a href="/">Home</a>
            <a href="/jobs">Jobs</a>
            <a href="/schemes">Gov. Schemes</a>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
            <a href="/aadhar-verification">Aadhar Verification</a>
          </nav>

          <div class="job-header">
            <div class="job-title-area">
              <h1>${job.title}</h1>
              <div style="color: #666;">${job.company} | ${job.location}</div>
            </div>
          </div>

          <div class="job-meta">
            <div class="job-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              <span>${job.location}</span>
            </div>
            <div class="job-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>${job.type}</span>
            </div>
            <div class="job-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              <span>${job.company}</span>
            </div>
            <div class="job-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
              <span>${job.salary}</span>
            </div>
            <div class="job-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              <span>Posted on: ${job.postedDate}</span>
            </div>
          </div>

          <div class="apply-btn-area">
            <a href="#application-form" class="btn btn-primary">Apply Now</a>
          </div>

          <div class="job-description">
            <h2 class="section-title">Job Description</h2>
            <p>${job.description}</p>
            <p>This position offers competitive compensation along with opportunities for career advancement. We provide a supportive work environment with all necessary training and safety measures.</p>
            
            <h2 class="section-title">Required Skills</h2>
            <div class="skills-list">
              ${job.skills.map(skill => `<div class="skill-tag">${skill}</div>`).join('')}
            </div>
          </div>

          <div class="company-box">
            <h2>About ${job.company}</h2>
            <p>${job.company} is a leading employer in the ${job.skills[0].toLowerCase()} sector with a commitment to fair wages and ethical employment practices. We specialize in providing quality services while ensuring worker welfare.</p>
          </div>

          <div id="application-form" class="application-form">
            <h2>Apply for this position</h2>
            <p class="required-text">* Required fields</p>
            
            <form action="/api/jobs/${job.id}/apply" method="post">
              <div class="form-group">
                <label for="name">Full Name *</label>
                <input type="text" id="name" name="name" required>
              </div>
              
              <div class="form-group">
                <label for="email">Email Address *</label>
                <input type="email" id="email" name="email" required>
              </div>
              
              <div class="form-group">
                <label for="phone">Phone Number *</label>
                <input type="tel" id="phone" name="phone" required>
              </div>
              
              <div class="form-group">
                <label for="workerId">Worker ID (if registered)</label>
                <input type="text" id="workerId" name="workerId">
              </div>
              
              <div class="form-group">
                <label for="experience">Years of Experience *</label>
                <select id="experience" name="experience" required>
                  <option value="">Select experience</option>
                  <option value="0-1">Less than 1 year</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5+">More than 5 years</option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="message">Why are you interested in this position? *</label>
                <textarea id="message" name="message" required></textarea>
              </div>
              
              <div class="form-group">
                <button type="submit" class="btn btn-primary">Submit Application</button>
              </div>
            </form>
          </div>
          
          <a href="/jobs" class="back-link">← Back to job listings</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Worker Dashboard page
app.get('/worker-dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Worker Dashboard - TN Migrant Worker Portal</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 0; 
          margin: 0;
          background-image: url('https://images.unsplash.com/photo-1588097261099-b4bae4aa0ed0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80');
          background-size: cover;
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          line-height: 1.6;
          color: #333;
        }
        .overlay {
          background-color: rgba(255, 255, 255, 0.9);
          min-height: 100vh;
          padding: 20px;
        }
        .container { 
          max-width: 1100px; 
          margin: 0 auto; 
          background: white; 
          padding: 30px; 
          border-radius: 12px; 
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        h1, h2 { 
          color: #114B5F; 
        }
        h3 {
          color: #028090;
        }
        nav { 
          background-color: #114B5F; 
          padding: 15px; 
          border-radius: 8px; 
          margin-bottom: 30px; 
          text-align: center; 
        }
        nav a { 
          color: white; 
          text-decoration: none; 
          margin: 0 15px; 
          font-weight: bold; 
          transition: color 0.3s;
        }
        nav a:hover {
          color: #E4FDE1;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        .user-welcome {
          display: flex;
          align-items: center;
        }
        .avatar {
          width: 60px;
          height: 60px;
          background-color: #028090;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin-right: 15px;
        }
        .welcome-text h2 {
          margin: 0;
          margin-bottom: 5px;
        }
        .welcome-text p {
          margin: 0;
          color: #666;
        }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .dashboard-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          padding: 20px;
          border: 1px solid #eee;
          transition: all 0.3s;
        }
        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }
        .card-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        .card-icon {
          width: 40px;
          height: 40px;
          background-color: #e1f5f7;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
        }
        .card-icon svg {
          width: 20px;
          height: 20px;
          color: #028090;
        }
        .card-title {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
          color: #114B5F;
        }
        .task-list, .document-list {
          margin-top: 20px;
        }
        .task-item, .document-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .task-item:last-child, .document-item:last-child {
          border-bottom: none;
        }
        .task-name, .document-name {
          display: flex;
          align-items: center;
        }
        .task-name svg, .document-name svg {
          margin-right: 10px;
          color: #028090;
        }
        .task-status {
          font-size: 0.9rem;
          padding: 3px 10px;
          border-radius: 20px;
        }
        .status-pending {
          background-color: #fff3cd;
          color: #856404;
        }
        .status-progress {
          background-color: #d1ecf1;
          color: #0c5460;
        }
        .status-completed {
          background-color: #d4edda;
          color: #155724;
        }
        .document-status {
          font-size: 0.9rem;
          padding: 3px 10px;
          border-radius: 20px;
        }
        .status-pending {
          background-color: #fff3cd;
          color: #856404;
        }
        .status-approved {
          background-color: #d4edda;
          color: #155724;
        }
        .status-rejected {
          background-color: #f8d7da;
          color: #721c24;
        }
        .quick-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 15px;
        }
        .action-btn {
          background-color: #f5f5f5;
          color: #333;
          border: none;
          padding: 8px 15px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s;
          text-decoration: none;
          display: inline-block;
        }
        .action-btn:hover {
          background-color: #e0e0e0;
        }
        .action-btn-primary {
          background-color: #028090;
          color: white;
        }
        .action-btn-primary:hover {
          background-color: #114B5F;
        }
        .stats-row {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          padding: 20px;
          border: 1px solid #eee;
          flex: 1;
          min-width: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .stat-number {
          font-size: 36px;
          font-weight: bold;
          color: #028090;
          margin: 10px 0;
        }
        .stat-label {
          color: #666;
          font-size: 0.9rem;
        }
      </style>
    </head>
    <body>
      <div class="overlay">
        <div class="container">
          <nav>
            <a href="/">Home</a>
            <a href="/jobs">Jobs</a>
            <a href="/schemes">Gov. Schemes</a>
            <a href="/documents">My Documents</a>
            <a href="/profile">My Profile</a>
            <a href="/" onclick="return confirm('Are you sure you want to logout?')">Logout</a>
          </nav>

          <div class="dashboard-header">
            <div class="user-welcome">
              <div class="avatar">JD</div>
              <div class="welcome-text">
                <h2>Welcome, John Doe</h2>
                <p>Worker ID: TN-UP-23-123456</p>
              </div>
            </div>
          </div>

          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-number">2</div>
              <div class="stat-label">Active Tasks</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">3</div>
              <div class="stat-label">Job Applications</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">2</div>
              <div class="stat-label">Documents Uploaded</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">1</div>
              <div class="stat-label">Scheme Eligibility</div>
            </div>
          </div>

          <div class="dashboard-grid">
            <div class="dashboard-card">
              <div class="card-header">
                <div class="card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                <h3 class="card-title">My Tasks</h3>
              </div>
              <p>Your assigned tasks and their status</p>
              <div class="task-list">
                <div class="task-item">
                  <div class="task-name">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Building Construction Work
                  </div>
                  <div class="task-status status-pending">Pending</div>
                </div>
                <div class="task-item">
                  <div class="task-name">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Road Repair Work
                  </div>
                  <div class="task-status status-progress">In Progress</div>
                </div>
              </div>
              <div class="quick-actions">
                <a href="/tasks" class="action-btn action-btn-primary">View All Tasks</a>
              </div>
            </div>

            <div class="dashboard-card">
              <div class="card-header">
                <div class="card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <h3 class="card-title">My Documents</h3>
              </div>
              <p>Your uploaded documents and their verification status</p>
              <div class="document-list">
                <div class="document-item">
                  <div class="document-name">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Aadhar Card
                  </div>
                  <div class="document-status status-approved">Approved</div>
                </div>
                <div class="document-item">
                  <div class="document-name">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Work Certificate
                  </div>
                  <div class="document-status status-pending">Pending</div>
                </div>
              </div>
              <div class="quick-actions">
                <a href="/upload-document" class="action-btn">Upload New</a>
                <a href="/documents" class="action-btn action-btn-primary">View All</a>
              </div>
            </div>
            
            <div class="dashboard-card">
              <div class="card-header">
                <div class="card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                </div>
                <h3 class="card-title">Quick Actions</h3>
              </div>
              <p>Common actions and resources you may need</p>
              <div class="quick-actions" style="margin-top: 20px;">
                <a href="/jobs" class="action-btn">Find Jobs</a>
                <a href="/schemes" class="action-btn">Check Schemes</a>
                <a href="/profile" class="action-btn">Update Profile</a>
                <a href="/aadhar-verification" class="action-btn">Verify Aadhar</a>
                <a href="/help" class="action-btn">Get Help</a>
              </div>
            </div>
          </div>
          
          <h2>Recommended Jobs</h2>
          <div class="dashboard-grid">
            <div class="dashboard-card">
              <div class="card-header">
                <h3 class="card-title">Construction Worker</h3>
              </div>
              <p>Chennai | Full-time</p>
              <p>We are looking for experienced construction workers for our new residential project in Chennai. Daily wages with overtime benefits.</p>
              <div class="quick-actions">
                <a href="/jobs/1" class="action-btn action-btn-primary">View Details</a>
              </div>
            </div>
            
            <div class="dashboard-card">
              <div class="card-header">
                <h3 class="card-title">Factory Worker</h3>
              </div>
              <p>Coimbatore | Full-time</p>
              <p>Textile factory in Coimbatore requires workers for various positions. Experience in textile industry preferred but not required.</p>
              <div class="quick-actions">
                <a href="/jobs/2" class="action-btn action-btn-primary">View Details</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Admin Dashboard page
app.get('/admin-dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Admin Dashboard - TN Migrant Worker Portal</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 0; 
          margin: 0;
          background-image: url('https://images.unsplash.com/photo-1588097261099-b4bae4aa0ed0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80');
          background-size: cover;
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          line-height: 1.6;
          color: #333;
        }
        .overlay {
          background-color: rgba(255, 255, 255, 0.9);
          min-height: 100vh;
          padding: 20px;
        }
        .container { 
          max-width: 1100px; 
          margin: 0 auto; 
          background: white; 
          padding: 30px; 
          border-radius: 12px; 
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        h1, h2 { 
          color: #114B5F; 
        }
        h3 {
          color: #028090;
        }
        nav { 
          background-color: #114B5F; 
          padding: 15px; 
          border-radius: 8px; 
          margin-bottom: 30px; 
          text-align: center; 
        }
        nav a { 
          color: white; 
          text-decoration: none; 
          margin: 0 15px; 
          font-weight: bold; 
          transition: color 0.3s;
        }
        nav a:hover {
          color: #E4FDE1;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        .user-welcome {
          display: flex;
          align-items: center;
        }
        .avatar {
          width: 60px;
          height: 60px;
          background-color: #028090;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin-right: 15px;
        }
        .welcome-text h2 {
          margin: 0;
          margin-bottom: 5px;
        }
        .welcome-text p {
          margin: 0;
          color: #666;
        }
        .stats-row {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          padding: 20px;
          border: 1px solid #eee;
          flex: 1;
          min-width: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .stat-number {
          font-size: 36px;
          font-weight: bold;
          color: #028090;
          margin: 10px 0;
        }
        .stat-label {
          color: #666;
          font-size: 0.9rem;
        }
        .worker-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 0 10px rgba(0,0,0,0.05);
        }
        .worker-table th, .worker-table td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        .worker-table th {
          background-color: #f5f5f5;
          color: #114B5F;
          font-weight: bold;
        }
        .worker-table tr:hover {
          background-color: #f9f9f9;
        }
        .btn { 
          display: inline-block; 
          background-color: #F45B69; 
          color: white; 
          padding: 12px 28px; 
          border-radius: 50px; 
          text-decoration: none; 
          font-weight: bold; 
          margin: 10px 0;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
          background-color: #E63946;
        }
        .btn-primary { 
          background-color: #028090; 
        }
        .btn-primary:hover {
          background-color: #114B5F;
        }
        .action-btn {
          background-color: #f5f5f5;
          color: #333;
          border: none;
          padding: 8px 15px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s;
          text-decoration: none;
          display: inline-block;
        }
        .action-btn:hover {
          background-color: #e0e0e0;
        }
        .action-btn-primary {
          background-color: #028090;
          color: white;
        }
        .action-btn-primary:hover {
          background-color: #114B5F;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .status-pending {
          background-color: #fff3cd;
          color: #856404;
        }
        .status-approved {
          background-color: #d4edda;
          color: #155724;
        }
        .status-rejected {
          background-color: #f8d7da;
          color: #721c24;
        }
        .btn-sm {
          padding: 5px 10px;
          font-size: 0.8rem;
          border-radius: 4px;
        }
        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }
        .filter-group {
          display: flex;
          align-items: center;
          background-color: #f5f5f5;
          padding: 8px 15px;
          border-radius: 30px;
        }
        .filter-group label {
          margin-right: 10px;
          font-weight: 500;
          color: #114B5F;
        }
        .filter-group select {
          background: transparent;
          border: none;
          font-family: inherit;
          color: #333;
          padding: 5px;
        }
      </style>
    </head>
    <body>
      <div class="overlay">
        <div class="container">
          <nav>
            <a href="/">Home</a>
            <a href="/admin/workers">Workers</a>
            <a href="/admin/documents">Documents</a>
            <a href="/admin/tasks">Tasks</a>
            <a href="/admin/reports">Reports</a>
            <a href="/" onclick="return confirm('Are you sure you want to logout?')">Logout</a>
          </nav>

          <div class="dashboard-header">
            <div class="user-welcome">
              <div class="avatar">A</div>
              <div class="welcome-text">
                <h2>Welcome, Admin</h2>
                <p>Admin Dashboard</p>
              </div>
            </div>
          </div>

          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-number">289</div>
              <div class="stat-label">Total Workers</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">42</div>
              <div class="stat-label">Pending Approvals</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">156</div>
              <div class="stat-label">Active Tasks</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">75</div>
              <div class="stat-label">Documents Pending</div>
            </div>
          </div>

          <h2>Recent Worker Registrations</h2>
          
          <div class="filters">
            <div class="filter-group">
              <label>Status:</label>
              <select id="statusFilter">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Home State:</label>
              <select id="stateFilter">
                <option value="all">All States</option>
                <option value="Bihar">Bihar</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
              </select>
            </div>
          </div>
          
          <table class="worker-table">
            <thead>
              <tr>
                <th>Worker ID</th>
                <th>Name</th>
                <th>Home State</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>TN-UP-23-123456</td>
                <td>John Doe</td>
                <td>Uttar Pradesh</td>
                <td>April 20, 2025</td>
                <td><span class="status-badge status-approved">Approved</span></td>
                <td>
                  <a href="#" class="action-btn btn-sm">View</a>
                  <a href="#" class="action-btn btn-sm action-btn-primary">Edit</a>
                </td>
              </tr>
              <tr>
                <td>TN-BR-23-123457</td>
                <td>Raj Kumar</td>
                <td>Bihar</td>
                <td>May 1, 2025</td>
                <td><span class="status-badge status-pending">Pending</span></td>
                <td>
                  <a href="#" class="action-btn btn-sm">View</a>
                  <a href="#" class="action-btn btn-sm action-btn-primary">Approve</a>
                </td>
              </tr>
              <tr>
                <td>TN-WB-23-123458</td>
                <td>Amit Sen</td>
                <td>West Bengal</td>
                <td>May 3, 2025</td>
                <td><span class="status-badge status-pending">Pending</span></td>
                <td>
                  <a href="#" class="action-btn btn-sm">View</a>
                  <a href="#" class="action-btn btn-sm action-btn-primary">Approve</a>
                </td>
              </tr>
              <tr>
                <td>TN-TN-23-123459</td>
                <td>Ramesh Kumar</td>
                <td>Tamil Nadu</td>
                <td>May 4, 2025</td>
                <td><span class="status-badge status-rejected">Rejected</span></td>
                <td>
                  <a href="#" class="action-btn btn-sm">View</a>
                  <a href="#" class="action-btn btn-sm action-btn-primary">Reconsider</a>
                </td>
              </tr>
            </tbody>
          </table>
          
          <h2>Documents Pending Verification</h2>
          <table class="worker-table">
            <thead>
              <tr>
                <th>Document ID</th>
                <th>Document Type</th>
                <th>Worker ID</th>
                <th>Submitted Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>DOC-2025-001</td>
                <td>Work Certificate</td>
                <td>TN-UP-23-123456</td>
                <td>May 1, 2025</td>
                <td><span class="status-badge status-pending">Pending</span></td>
                <td>
                  <a href="#" class="action-btn btn-sm">View</a>
                  <a href="#" class="action-btn btn-sm action-btn-primary">Verify</a>
                </td>
              </tr>
              <tr>
                <td>DOC-2025-002</td>
                <td>Aadhar Card</td>
                <td>TN-BR-23-123457</td>
                <td>May 2, 2025</td>
                <td><span class="status-badge status-pending">Pending</span></td>
                <td>
                  <a href="#" class="action-btn btn-sm">View</a>
                  <a href="#" class="action-btn btn-sm action-btn-primary">Verify</a>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div style="margin-top: 30px; display: flex; justify-content: space-between;">
            <a href="/admin/workers" class="btn btn-primary">Manage All Workers</a>
            <a href="/admin/add-task" class="btn">Create New Task</a>
          </div>
        </div>
      </div>
      
      <script>
        // Status filter functionality
        document.getElementById('statusFilter').addEventListener('change', function() {
          filterTable();
        });
        
        // State filter functionality
        document.getElementById('stateFilter').addEventListener('change', function() {
          filterTable();
        });
        
        function filterTable() {
          const statusFilter = document.getElementById('statusFilter').value;
          const stateFilter = document.getElementById('stateFilter').value;
          
          const rows = document.querySelectorAll('.worker-table tbody tr');
          
          rows.forEach(row => {
            const statusCell = row.querySelector('td:nth-child(5)').textContent.trim().toLowerCase();
            const stateCell = row.querySelector('td:nth-child(3)').textContent.trim();
            
            const statusMatch = statusFilter === 'all' || statusCell.includes(statusFilter.toLowerCase());
            const stateMatch = stateFilter === 'all' || stateCell === stateFilter;
            
            if (statusMatch && stateMatch) {
              row.style.display = '';
            } else {
              row.style.display = 'none';
            }
          });
        }
      </script>
    </body>
    </html>
  `);
});

// Individual scheme detail page
app.get('/schemes/:id', (req, res) => {
  const schemeId = parseInt(req.params.id);
  const scheme = schemes.find(s => s.id === schemeId);
  
  if (!scheme) {
    return res.status(404).send(`
      <h1>404 - Scheme Not Found</h1>
      <p>The government scheme you are looking for does not exist.</p>
      <a href="/schemes">Back to Schemes</a>
    `);
  }
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${scheme.title} - TN Migrant Worker Portal</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 0; 
          margin: 0;
          background-image: url('https://images.unsplash.com/photo-1588097261099-b4bae4aa0ed0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80');
          background-size: cover;
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          line-height: 1.6;
          color: #333;
        }
        .overlay {
          background-color: rgba(255, 255, 255, 0.9);
          min-height: 100vh;
          padding: 20px;
        }
        .container { 
          max-width: 1100px; 
          margin: 0 auto; 
          background: white; 
          padding: 30px; 
          border-radius: 12px; 
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        h1, h2 { 
          color: #114B5F; 
        }
        h3 {
          color: #028090;
        }
        nav { 
          background-color: #114B5F; 
          padding: 15px; 
          border-radius: 8px; 
          margin-bottom: 30px; 
          text-align: center; 
        }
        nav a { 
          color: white; 
          text-decoration: none; 
          margin: 0 15px; 
          font-weight: bold; 
          transition: color 0.3s;
        }
        nav a:hover {
          color: #E4FDE1;
        }
        .scheme-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        .scheme-title-area {
          flex: 1;
          min-width: 60%;
        }
        .scheme-title-area h1 {
          margin-bottom: 5px;
          margin-top: 0;
        }
        .apply-btn-area {
          margin: 20px 0;
        }
        .btn { 
          display: inline-block; 
          background-color: #F45B69; 
          color: white; 
          padding: 14px 30px; 
          border-radius: 50px; 
          text-decoration: none; 
          font-weight: bold; 
          margin: 10px 0;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
          background-color: #E63946;
        }
        .btn-primary { 
          background-color: #028090; 
        }
        .btn-primary:hover {
          background-color: #114B5F;
        }
        .scheme-meta {
          display: flex;
          margin: 20px 0;
          font-size: 1rem;
          color: #666;
          flex-wrap: wrap;
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
        }
        .scheme-meta-item {
          margin-right: 30px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        }
        .scheme-meta-item svg {
          margin-right: 10px;
          height: 20px;
          width: 20px;
          color: #028090;
        }
        .scheme-description {
          margin: 30px 0;
          line-height: 1.8;
        }
        .section-title {
          color: #114B5F;
          border-bottom: 2px solid #e1e1e1;
          padding-bottom: 10px;
          margin-top: 40px;
        }
        .document-list {
          margin: 20px 0;
        }
        .document-item {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        .document-item svg {
          margin-right: 10px;
          color: #028090;
        }
        .eligibility-box {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
        }
        .step-box {
          display: flex;
          margin-bottom: 15px;
        }
        .step-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background-color: #028090;
          color: white;
          border-radius: 50%;
          margin-right: 15px;
          flex-shrink: 0;
          font-weight: bold;
        }
        .step-content {
          flex: 1;
        }
        .application-form {
          background: #f9f9f9;
          padding: 25px;
          border-radius: 8px;
          margin: 30px 0;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: bold;
          color: #114B5F;
        }
        .form-group input, .form-group textarea, .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
          font-family: inherit;
        }
        .form-group textarea {
          min-height: 120px;
        }
        .required-text {
          color: #F45B69;
          font-size: 0.9rem;
          margin-bottom: 20px;
        }
        .back-link { 
          display: block; 
          margin-top: 30px; 
          color: #028090; 
          text-decoration: none;
        }
        .back-link:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="overlay">
        <div class="container">
          <nav>
            <a href="/">Home</a>
            <a href="/jobs">Jobs</a>
            <a href="/schemes">Gov. Schemes</a>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
            <a href="/aadhar-verification">Aadhar Verification</a>
          </nav>

          <div class="scheme-header">
            <div class="scheme-title-area">
              <h1>${scheme.title}</h1>
              <div style="color: #666;">${scheme.provider}</div>
            </div>
          </div>

          <div class="scheme-meta">
            <div class="scheme-meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path></svg>
              <span>${scheme.provider}</span>
            </div>
          </div>

          <div class="apply-btn-area">
            <a href="#eligibility-check" class="btn btn-primary">Check Eligibility</a>
            <a href="${scheme.applicationLink}" target="_blank" class="btn">Official Website</a>
          </div>

          <div class="scheme-description">
            <h2 class="section-title">Scheme Description</h2>
            <p>${scheme.description}</p>
            
            <h2 class="section-title">Benefits</h2>
            <p>${scheme.benefits}</p>
            
            <h2 class="section-title">Eligibility Criteria</h2>
            <p>${scheme.eligibility}</p>
            
            <h2 class="section-title">Required Documents</h2>
            <div class="document-list">
              ${scheme.documents.map(doc => `
                <div class="document-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>${doc}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="eligibility-box">
            <h2>How to Apply</h2>
            <div class="step-box">
              <div class="step-number">1</div>
              <div class="step-content">
                <h3>Check eligibility</h3>
                <p>Determine if you meet all eligibility criteria mentioned above.</p>
              </div>
            </div>
            <div class="step-box">
              <div class="step-number">2</div>
              <div class="step-content">
                <h3>Gather documents</h3>
                <p>Collect all required documents mentioned in the document list.</p>
              </div>
            </div>
            <div class="step-box">
              <div class="step-number">3</div>
              <div class="step-content">
                <h3>Visit official website</h3>
                <p>Go to the <a href="${scheme.applicationLink}" target="_blank">official website</a> or nearest government office.</p>
              </div>
            </div>
            <div class="step-box">
              <div class="step-number">4</div>
              <div class="step-content">
                <h3>Submit application</h3>
                <p>Fill out the application form and submit it with all required documents.</p>
              </div>
            </div>
          </div>

          <div id="eligibility-check" class="application-form">
            <h2>Check Your Eligibility</h2>
            <p class="required-text">* Required fields</p>
            
            <form action="/api/schemes/${scheme.id}/check-eligibility" method="post">
              <div class="form-group">
                <label for="name">Full Name *</label>
                <input type="text" id="name" name="name" required>
              </div>
              
              <div class="form-group">
                <label for="email">Email Address *</label>
                <input type="email" id="email" name="email" required>
              </div>
              
              <div class="form-group">
                <label for="phone">Phone Number *</label>
                <input type="tel" id="phone" name="phone" required>
              </div>
              
              <div class="form-group">
                <label for="aadhar">Aadhar Number *</label>
                <input type="text" id="aadhar" name="aadhar" pattern="[0-9]{12}" required>
              </div>
              
              <div class="form-group">
                <label for="income">Annual Income (in ₹) *</label>
                <input type="number" id="income" name="income" required>
              </div>
              
              <div class="form-group">
                <label for="district">District *</label>
                <select id="district" name="district" required>
                  <option value="">Select district</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Coimbatore">Coimbatore</option>
                  <option value="Madurai">Madurai</option>
                  <option value="Salem">Salem</option>
                  <option value="Tiruchirappalli">Tiruchirappalli</option>
                  <option value="Tirunelveli">Tirunelveli</option>
                  <option value="Vellore">Vellore</option>
                  <option value="Thanjavur">Thanjavur</option>
                  <option value="Dindigul">Dindigul</option>
                  <option value="Erode">Erode</option>
                </select>
              </div>
              
              <div class="form-group">
                <button type="submit" class="btn btn-primary">Check Eligibility</button>
              </div>
            </form>
          </div>
          
          <a href="/schemes" class="back-link">← Back to government schemes</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// API endpoints for job applications and scheme eligibility checks
app.post('/api/jobs/:id/apply', (req, res) => {
  const jobId = parseInt(req.params.id);
  const job = jobs.find(j => j.id === jobId);
  
  if (!job) {
    return res.status(404).json({ success: false, message: 'Job not found' });
  }
  
  // In a real app, we would save the application to a database
  // For now, just return a success response
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Application Submitted - TN Migrant Worker Portal</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 0; 
          margin: 0;
          background-image: url('https://images.unsplash.com/photo-1588097261099-b4bae4aa0ed0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80');
          background-size: cover;
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          line-height: 1.6;
          color: #333;
        }
        .overlay {
          background-color: rgba(255, 255, 255, 0.9);
          min-height: 100vh;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .container { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white; 
          padding: 40px; 
          border-radius: 12px; 
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          text-align: center;
        }
        h1 { 
          color: #114B5F; 
        }
        .success-icon {
          color: #28a745;
          font-size: 5rem;
          margin-bottom: 20px;
        }
        .btn { 
          display: inline-block; 
          background-color: #028090; 
          color: white; 
          padding: 12px 28px; 
          border-radius: 50px; 
          text-decoration: none; 
          font-weight: bold; 
          margin: 20px 10px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
          background-color: #114B5F;
        }
      </style>
    </head>
    <body>
      <div class="overlay">
        <div class="container">
          <div class="success-icon">✓</div>
          <h1>Application Submitted Successfully!</h1>
          <p>Thank you for applying to the ${job.title} position at ${job.company}. Your application has been received and is under review.</p>
          <p>We will contact you via email or phone regarding the next steps in the hiring process.</p>
          <p>Application Reference Number: <strong>JOB-${job.id}-${Date.now().toString().slice(-6)}</strong></p>
          <a href="/jobs" class="btn">Back to Job Listings</a>
          <a href="/" class="btn">Home</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.post('/api/schemes/:id/check-eligibility', (req, res) => {
  const schemeId = parseInt(req.params.id);
  const scheme = schemes.find(s => s.id === schemeId);
  
  if (!scheme) {
    return res.status(404).json({ success: false, message: 'Scheme not found' });
  }
  
  // In a real app, we would check eligibility based on the submitted data
  // For now, just return a success response with mock eligibility results
  const eligible = Math.random() > 0.2; // 80% chance of being eligible for demo purposes
  
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Eligibility Check Result - TN Migrant Worker Portal</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          padding: 0; 
          margin: 0;
          background-image: url('https://images.unsplash.com/photo-1588097261099-b4bae4aa0ed0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80');
          background-size: cover;
          background-attachment: fixed;
          background-position: center;
          background-repeat: no-repeat;
          line-height: 1.6;
          color: #333;
        }
        .overlay {
          background-color: rgba(255, 255, 255, 0.9);
          min-height: 100vh;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .container { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white; 
          padding: 40px; 
          border-radius: 12px; 
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
          text-align: center;
        }
        h1 { 
          color: #114B5F; 
        }
        .icon {
          font-size: 5rem;
          margin-bottom: 20px;
        }
        .success-icon {
          color: #28a745;
        }
        .warning-icon {
          color: #ffc107;
        }
        .btn { 
          display: inline-block; 
          background-color: #028090; 
          color: white; 
          padding: 12px 28px; 
          border-radius: 50px; 
          text-decoration: none; 
          font-weight: bold; 
          margin: 20px 10px;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
          background-color: #114B5F;
        }
        .eligibility-details {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
        }
        .detail-item {
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
        }
        .detail-label {
          font-weight: bold;
          color: #114B5F;
        }
      </style>
    </head>
    <body>
      <div class="overlay">
        <div class="container">
          <div class="icon ${eligible ? 'success-icon' : 'warning-icon'}">${eligible ? '✓' : '!'}</div>
          <h1>${eligible ? 'You are Eligible!' : 'You may not be Eligible'}</h1>
          <p>${eligible 
            ? `Based on the information provided, you are eligible for the ${scheme.title}.` 
            : `Based on the information provided, you may not meet all eligibility criteria for the ${scheme.title}.`}</p>
          
          <div class="eligibility-details">
            <h2>Eligibility Details</h2>
            <div class="detail-item">
              <div class="detail-label">Scheme:</div>
              <div>${scheme.title}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Provider:</div>
              <div>${scheme.provider}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Eligibility Criteria:</div>
              <div>${scheme.eligibility}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Required Documents:</div>
              <div>${scheme.documents.join(', ')}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Next Steps:</div>
              <div>${eligible 
                ? `Proceed to the <a href="${scheme.applicationLink}" target="_blank">official website</a> to complete your application or visit your nearest government office with the required documents.` 
                : `You may want to review the eligibility criteria and check if there are any other schemes you might qualify for. If you believe this determination is incorrect, please visit your nearest government office for assistance.`}</div>
            </div>
          </div>
          
          <a href="/schemes" class="btn">Back to Schemes</a>
          <a href="/" class="btn">Home</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).send(`
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <a href="/">Go Home</a>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Server
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Set up upload directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
