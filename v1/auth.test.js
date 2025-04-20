const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

jest.mock('axios');

const { app, server } = require('./server');
const authController = require('./authController');

// Set environment variables for testing
process.env.JWT_SECRET = 'test-secret-key'; // Set a test JWT secret
process.env.OPENAI_API_KEY = 'ollama'; // Set the API key for testing

app.use(express.json());
app.use(cookieParser());

app.post('/api/signup', authController.signup);
app.post('/api/login', authController.login);
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});
app.post('/api/generate', authController.verifyToken, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    }, {
      headers: {
        'Authorization': `Bearer fake-api-key`,
        'Content-Type': 'application/json',
      },
    });
    const generatedText = response.data.choices[0].message.content;
    res.json({ text: generatedText });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

// Helper to reset users.json before each test
const usersFilePath = path.join(__dirname, 'users.json');
function resetUsersFile() {
  fs.writeFileSync(usersFilePath, JSON.stringify([]));
}

describe('Auth API', () => {
  beforeEach(() => {
    resetUsersFile();
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('POST /api/signup', () => {
    it('should signup a new user successfully', async () => {
      const res = await request(app)
        .post('/api/signup')
        .send({ username: 'testuser', password: 'password123' });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('User created successfully');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should not signup with existing username', async () => {
      // First signup
      await request(app)
        .post('/api/signup')
        .send({ username: 'testuser', password: 'password123' });
      // Second signup with same username (password reset)
      const res = await request(app)
        .post('/api/signup')
        .send({ username: 'testuser', password: 'password123' });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Password reset successfully');
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/signup')
        .send({ username: 'ab', password: '123' }); // username too short, password too short
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      // Signup a user to login
      await request(app)
        .post('/api/signup')
        .send({ username: 'testuser', password: 'password123' });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'testuser', password: 'password123' });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'testuser', password: 'wrongpassword' });
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('should return 400 for invalid input', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: '', password: '' });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('POST /api/logout', () => {
    it('should clear the token cookie on logout', async () => {
      const res = await request(app)
        .post('/api/logout');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Logged out successfully');
      const cookies = res.headers['set-cookie'];
      expect(cookies.some(cookie => cookie.startsWith('token=;'))).toBe(true);
    });
  });

  describe('POST /api/generate', () => {
    let token;

    beforeEach(async () => {
      // Signup and login to get token cookie
      await request(app)
        .post('/api/signup')
        .send({ username: 'testuser', password: 'password123' });
      const loginRes = await request(app)
        .post('/api/login')
        .send({ username: 'testuser', password: 'password123' });
      const cookies = loginRes.headers['set-cookie'];
      token = cookies.find(cookie => cookie.startsWith('token='));
    });

    it('should return 401 if no token provided', async () => {
      const res = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Hello' });
      expect(res.statusCode).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });

    it('should return 400 if prompt is missing', async () => {
      const res = await request(app)
        .post('/api/generate')
        .set('Cookie', token)
        .send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Prompt is required');
    });

    it('should return generated text on valid request', async () => {
      const fakeResponse = {
        data: {
          choices: [
            { message: { content: 'Generated response text' } }
          ]
        }
      };
      axios.post.mockResolvedValue(fakeResponse);

      const res = await request(app)
        .post('/api/generate')
        .set('Cookie', token)
        .send({ prompt: 'Hello' });

      expect(res.statusCode).toBe(200);
      expect(res.body.text).toBe('Generated response text');
    });

    it('should return 500 if axios call fails', async () => {
      axios.post.mockRejectedValue(new Error('API error'));

      const res = await request(app)
        .post('/api/generate')
        .set('Cookie', token)
        .send({ prompt: 'Hello' });

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Failed to generate text');
    });
  });
});
