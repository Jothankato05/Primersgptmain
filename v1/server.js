require('dotenv').config();
const API_KEY = 'ollama'; // Replacing the API key with "ollama"
if (!process.env.JWT_SECRET) {
    throw new Error('Missing environment variable: JWT_SECRET');
}
console.log('Environment variables loaded:', 'API Key Present');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');
const authController = require('./authController');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // increased limit for image uploads
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// CORS Middleware for production and dev
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'https://primergpt-app.netlify.app',
    'https://primergpt-app.windsurf.build'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', apiLimiter);

// Auth Routes
app.post('/api/signup', authController.signup);
app.post('/api/login', authController.login);
app.post('/api/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: 'Logged out successfully' });
});

// Protected API Endpoint: /api/generate
app.post('/api/generate', authController.verifyToken, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Proxy request to Ollama API
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral',
      prompt: prompt,
      stream: false
    });

    res.json({ text: response.data.response });
  } catch (error) {
    console.error('Ollama API error:', error.message);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

// API endpoint to receive image uploads from Flutter app and analyze with AI
app.post('/api/upload-image', authController.verifyToken, async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    // Validate input
    if (!imageBase64 || typeof imageBase64 !== 'string' || !imageBase64.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid or missing image data' });
    }

    console.log('Received image from Flutter app, sending to AI for analysis');

    // Prepare prompt for AI analysis
    const prompt = `Analyze the following image data and provide a detailed description or insights: ${imageBase64.substring(0, 100)}...`;

    // Call Ollama API for AI text generation
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral',
      prompt: prompt,
      stream: false
    });

    const aiResult = response.data.response;

    // Respond with AI analysis result
    res.json({ message: 'Image analyzed successfully', analysis: aiResult });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze image with AI.' });
  }
});

// Image analysis endpoint with enhanced AI processing
app.post('/api/analyze-image', authController.verifyToken, async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    // Validate input
    if (!imageBase64 || typeof imageBase64 !== 'string' || !imageBase64.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid or missing image data' });
    }

    // Extract image format and data
    const formatMatch = imageBase64.match(/^data:image\/(\w+);base64,/);
    if (!formatMatch) {
      return res.status(400).json({ error: 'Invalid image format' });
    }

    const imageFormat = formatMatch[1];
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Prepare detailed prompt for AI analysis
    const prompt = `Analyze this image and provide:
    1. Main objects/subjects
    2. Colors and composition
    3. Any text content
    4. Mood/atmosphere
    5. Technical details (if relevant)
    6. Potential use cases or recommendations
    
    Image data (base64): ${base64Data.substring(0, 100)}...`;

    // Call Ollama API for AI analysis
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral',
      prompt: prompt,
      stream: false
    });

    // Process and structure the AI response
    const analysis = {
      result: response.data.response,
      metadata: {
        format: imageFormat,
        timestamp: new Date().toISOString(),
        processingTime: response.data.total_duration
      }
    };

    res.json({
      success: true,
      analysis: analysis
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze image',
      details: error.message
    });
  }
});

// Mock AI Service
const mockAIResponse = async (content) => {
  // Add a small delay to simulate network latency
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

  // Generate a contextual response based on the input
  let response = '';
  
  // Greeting patterns
  if (content.toLowerCase().includes('hello') || content.toLowerCase().includes('hi')) {
    const greetings = [
      "Hello! I'm PrimerGPT, your friendly AI assistant. How can I help you today?",
      "Hi there! I'm ready to help you with any questions you might have.",
      "Greetings! I'm your AI assistant. What would you like to discuss?"
    ];
    response = greetings[Math.floor(Math.random() * greetings.length)];
  } 
  // Programming patterns
  else if (content.toLowerCase().includes('javascript')) {
    response = "JavaScript is a versatile programming language that powers the web. It's used for both front-end and back-end development, and features like async/await, closures, and the event loop make it powerful yet accessible.";
  }
  else if (content.toLowerCase().includes('python')) {
    response = "Python is known for its readability and extensive library ecosystem. It's great for beginners and powers everything from web development to data science and AI.";
  }
  else if (content.toLowerCase().includes('code') || content.toLowerCase().includes('programming')) {
    const coding = [
      "Programming is all about breaking down complex problems into smaller, manageable pieces. What specific aspect would you like to learn about?",
      "The world of coding is vast and exciting! We can discuss languages, frameworks, best practices, or specific programming concepts.",
      "Programming is a creative endeavor that combines logic, problem-solving, and design. What interests you most about it?"
    ];
    response = coding[Math.floor(Math.random() * coding.length)];
  }
  // Help patterns
  else if (content.toLowerCase().includes('help')) {
    response = "I can help you with:\n1. Programming questions and concepts\n2. Code explanations\n3. Best practices and tips\n4. General knowledge and discussions\nWhat would you like to know more about?";
  }
  // Project patterns
  else if (content.toLowerCase().includes('project') || content.toLowerCase().includes('app') || content.toLowerCase().includes('application')) {
    response = "When working on projects, consider these key aspects:\n1. Clear requirements and goals\n2. Proper planning and architecture\n3. Version control and documentation\n4. Testing and quality assurance\n5. Deployment and maintenance\nWhich aspect would you like to discuss?";
  }
  // Default responses
  else {
    const responses = [
      "That's an interesting topic! Let's explore it together.",
      "I understand what you're asking about. Here's what I think...",
      "Great question! From my analysis...",
      "I'd be happy to help you with that. Here's my perspective...",
      "Let me share my thoughts on this topic..."
    ];
    response = responses[Math.floor(Math.random() * responses.length)];
  }

  return {
    type: 'assistant',
    content: response,
    id: Date.now(),
    timestamp: new Date().toISOString()
  };
};

// Chat endpoint with mock AI integration
app.post('/api/chat', async (req, res) => {
  try {
    const { type, content } = req.body;
    console.log('Received chat request:', { type, content });
    
    const response = await mockAIResponse(content);
    console.log('Mock AI response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error processing chat:', error.message);
    res.status(500).json({ 
      error: 'Failed to process message', 
      details: error.message
    });
  }
});

// Socket.IO setup with authentication
const io = new Server(app.listen(PORT), {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://primergpt-ai.netlify.app']
      : ['http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.user.username);

  // Socket.IO message handler with mock AI
  socket.on('user-message', async (data) => {
    try {
      const response = await mockAIResponse(data.content);
      socket.emit('ai-response', response);
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  // Image analysis with mock response
  socket.on('analyze-image', async (data) => {
    try {
      const response = {
        type: 'assistant',
        content: "I can see an image in the data. It appears to be a digital file that I could analyze if I had image processing capabilities. For now, I'm a mock service, but I'm happy to discuss what you'd like to know about the image!",
        id: Date.now(),
        timestamp: new Date().toISOString()
      };
      socket.emit('ai-response', response);
    } catch (error) {
      console.error('Error analyzing image:', error);
      socket.emit('error', { message: 'Failed to analyze image' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.username);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Ollama health check
app.get('/api/ollama-status', async (req, res) => {
  try {
    await axios.get('http://localhost:11434/api/version');
    res.json({ status: 'connected', message: 'Ollama is running' });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Ollama is not running' });
  }
});

// Catch-all for unmatched routes (useful for single-page apps)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

console.log(`PrimersGPT server is running on port ${PORT}`);

module.exports = { app };
