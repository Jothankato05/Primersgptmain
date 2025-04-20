const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const usersFilePath = path.join(__dirname, 'users.json');

// Secret key for JWT - in production this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'; 
if (!JWT_SECRET) {
    throw new Error('Missing environment variable: JWT_SECRET');
}

// Token expiration time
const TOKEN_EXPIRATION = '1h';

// Helper to read users from JSON file
function readUsers() {
  if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(usersFilePath);
  return JSON.parse(data);
}

// Helper to write users to JSON file
function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

// Input validation schemas
const signupSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

const authController = {
  async signup(req, res) {
    try {
      const { error, value } = signupSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      const { username, password } = value;

      const users = readUsers();

      // Check if user already exists
      const existingUserIndex = users.findIndex(user => user.username === username);
      if (existingUserIndex !== -1) {
        // Reset password for existing user
        const hashedPassword = await bcrypt.hash(password, 10);
        users[existingUserIndex].password = hashedPassword;
        writeUsers(users);
        // Invalidate existing tokens by not generating a new token here
        return res.status(200).json({ message: 'Password reset successfully' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new user
      const newUser = {
        id: users.length + 1,
        username,
        password: hashedPassword
      };
      
      users.push(newUser);
      writeUsers(users);
      
      // Generate JWT
      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
      
      res.cookie('token', token, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      return res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async login(req, res) {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      const { username, password } = value;

      const users = readUsers();

      // Find user
      const user = users.find(user => user.username === username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
      
      res.cookie('token', token, { 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict'
      });
      
      return res.json({ message: 'Login successful' });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  verifyToken(req, res, next) {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      req.userId = decoded.userId;
      next();
    });
  }
};

module.exports = authController;
