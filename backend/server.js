const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
    isEmailVerified: true
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
    isEmailVerified: true
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

// Basic API Routes
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

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication
  if (email === 'john@example.com' && password === 'password') {
    res.json({
      success: true,
      token: 'dummy-token-for-testing',
      user: workers[0]
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'User registered successfully! Please verify your email.',
    workerId: 'TN-' + req.body.homeState.substring(0, 2).toUpperCase() + '-23-' + Math.floor(100000 + Math.random() * 900000)
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Email verified successfully! You can now login.'
  });
});

// Fallback route for all other API requests
app.use('/api', (req, res) => {
  res.status(200).json({ message: 'API endpoint not fully implemented yet' });
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
const fs = require('fs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
