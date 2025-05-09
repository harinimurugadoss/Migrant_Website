const express = require('express');
const app = express();

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>TN Migrant Worker Portal</title>
      <style>
        body { font-family: Arial; padding: 20px; background-color: #f0f9ff; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { color: #0369a1; text-align: center; }
        nav { background-color: #0369a1; padding: 15px; border-radius: 8px; margin-bottom: 30px; }
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
          <a href="/api-test">API Test</a>
        </nav>

        <div class="hero">
          <h1>Tamil Nadu Migrant Worker Portal</h1>
          <p>A comprehensive platform to register, manage, and support migrant workers across Tamil Nadu</p>
          <a href="/register" class="btn btn-primary">Register as a Worker</a>
          <a href="/login" class="btn">Login to Account</a>
        </div>

        <h2 style="text-align: center; color: #0369a1;">Key Features</h2>
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
            <h3>Task Assignment</h3>
            <p>Efficiently manage work assignments and track progress through our intuitive interface</p>
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
        body { font-family: Arial; padding: 20px; background-color: #f0f9ff; }
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
            <label for="email">Email Address</label>
            <input type="email" id="email" placeholder="Enter your email" required>
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
        body { font-family: Arial; padding: 20px; background-color: #f0f9ff; }
        .container { max-width: 500px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { color: #0369a1; text-align: center; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { background: #0369a1; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
        .back-link { display: block; margin-top: 20px; text-align: center; color: #0369a1; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Register as a Worker</h1>
        <form>
          <div class="form-group">
            <label for="name">Full Name</label>
            <input type="text" id="name" placeholder="Enter your full name" required>
          </div>
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" placeholder="Enter your email" required>
          </div>
          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input type="tel" id="phone" placeholder="Enter your phone number" required>
          </div>
          <div class="form-group">
            <label for="homeState">Home State</label>
            <select id="homeState" required>
              <option value="">Select your home state</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Bihar">Bihar</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="West Bengal">West Bengal</option>
              <!-- Add more states as needed -->
            </select>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" placeholder="Create a password" required>
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" placeholder="Confirm your password" required>
          </div>
          <button type="submit">Register</button>
        </form>
        <a href="/" class="back-link">← Back to Home</a>
      </div>
    </body>
    </html>
  `);
});

// API Test page
app.get('/api-test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>API Test - TN Migrant Worker Portal</title>
      <style>
        body { font-family: Arial; padding: 20px; background-color: #f0f9ff; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        h1 { color: #0369a1; text-align: center; }
        .back-link { display: block; margin-top: 20px; text-align: center; color: #0369a1; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>API Test Page</h1>
        <p>The backend server is running at <a href="http://localhost:8000" target="_blank">http://localhost:8000</a></p>
        <p>API endpoints available:</p>
        <ul>
          <li><a href="http://localhost:8000/api/users/me" target="_blank">/api/users/me</a> - Get current user info</li>
          <li><a href="http://localhost:8000/api/tasks" target="_blank">/api/tasks</a> - Get tasks</li>
          <li><a href="http://localhost:8000/api/documents" target="_blank">/api/documents</a> - Get documents</li>
        </ul>
        <a href="/" class="back-link">← Back to Home</a>
      </div>
    </body>
    </html>
  `);
});

// Redirect any unknown routes to home page
app.use((req, res) => {
  res.redirect('/');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});