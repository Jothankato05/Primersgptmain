// script.js

// DOM Elements
const chatBox = document.getElementById('chatBox');
const promptInput = document.getElementById('promptInput');
const sendButton = document.getElementById('sendButton');

const authArea = document.getElementById('authArea');
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const signupUsername = document.getElementById('signupUsername');
const signupPassword = document.getElementById('signupPassword');
const signupButton = document.getElementById('signupButton');
const signupError = document.getElementById('signupError');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginButton = document.getElementById('loginButton');
const loginError = document.getElementById('loginError');
const showLogin = document.getElementById('showLogin');
const showSignup = document.getElementById('showSignup');
const appArea = document.getElementById('appArea');
const logoutButton = document.getElementById('logoutButton');

// Function to add a message bubble
function addMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('chat-message', sender);
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Show login form
showLogin.addEventListener('click', (e) => {
  e.preventDefault();
  signupForm.style.display = 'none';
  loginForm.style.display = 'block';
  signupError.textContent = '';
  loginError.textContent = '';
});

// Show signup form
showSignup.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.style.display = 'none';
  signupForm.style.display = 'block';
  signupError.textContent = '';
  loginError.textContent = '';
});

// Signup handler
signupButton.addEventListener('click', async () => {
  const username = signupUsername.value.trim();
  const password = signupPassword.value.trim();
  signupError.textContent = '';

  if (!username || !password) {
    signupError.textContent = 'Username and password are required.';
    return;
  }

  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (response.ok) {
      // Auto-login after signup
      showAppArea();
      clearAuthForms();
    } else {
      signupError.textContent = data.error || 'Signup failed.';
    }
  } catch (error) {
    signupError.textContent = 'An unexpected error occurred.';
  }
});

// Login handler
loginButton.addEventListener('click', async () => {
  const username = loginUsername.value.trim();
  const password = loginPassword.value.trim();
  loginError.textContent = '';

  if (!username || !password) {
    loginError.textContent = 'Username and password are required.';
    return;
  }

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (response.ok) {
      showAppArea();
      clearAuthForms();
    } else {
      loginError.textContent = data.error || 'Login failed.';
    }
  } catch (error) {
    loginError.textContent = 'An unexpected error occurred.';
  }
});

// Logout handler
logoutButton.addEventListener('click', async () => {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST'
    });
    if (response.ok) {
      showAuthArea();
      clearChat();
    } else {
      alert('Logout failed.');
    }
  } catch (error) {
    alert('An unexpected error occurred.');
  }
});

// Show app area and hide auth area
function showAppArea() {
  authArea.style.display = 'none';
  appArea.style.display = 'block';
}

// Show auth area and hide app area
function showAuthArea() {
  authArea.style.display = 'block';
  appArea.style.display = 'none';
}

// Clear auth form inputs and errors
function clearAuthForms() {
  signupUsername.value = '';
  signupPassword.value = '';
  signupError.textContent = '';
  loginUsername.value = '';
  loginPassword.value = '';
  loginError.textContent = '';
}

// Clear chat messages
function clearChat() {
  chatBox.innerHTML = '';
}

// Handle send button click
sendButton.addEventListener('click', async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  // Display user message
  addMessage('user', prompt);
  promptInput.value = '';

  try {
    // Call backend API to get GPT response
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    
    if (data.error) {
      addMessage('bot', `Error: ${data.error}`);
    } else {
      addMessage('bot', data.text);
    }
  } catch (error) {
    addMessage('bot', 'An unexpected error occurred. Please try again later.');
  }
});

// Handle Enter key press for prompt input
promptInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendButton.click();
  }
});

// Camera elements
const video = document.getElementById('video');
const captureButton = document.getElementById('captureButton');
const canvas = document.getElementById('canvas');
const capturedImageContainer = document.getElementById('capturedImageContainer');
const analysisDiv = document.createElement('div');
analysisDiv.id = 'analysisResult';
capturedImageContainer.parentNode.insertBefore(analysisDiv, capturedImageContainer.nextSibling);

// Access webcam and stream to video element
function startCamera() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error('Error accessing webcam: ', err);
      });
  } else {
    console.error('getUserMedia not supported in this browser.');
  }
}

// Capture photo from video stream and send to backend for AI analysis
captureButton.addEventListener('click', async () => {
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageDataUrl = canvas.toDataURL('image/png');

  // Display captured image
  capturedImageContainer.innerHTML = '';
  const img = document.createElement('img');
  img.src = imageDataUrl;
  img.width = 320;
  img.height = 240;
  capturedImageContainer.appendChild(img);

  // Show loading message
  analysisDiv.textContent = 'Analyzing image...';

  // Send imageDataUrl to backend for AI analysis
  try {
    const token = getAuthToken(); // Implement this function to get auth token
    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ imageBase64: imageDataUrl })
    });

    const data = await response.json();
    if (response.ok) {
      analysisDiv.textContent = 'AI Analysis: ' + data.analysis;
    } else {
      analysisDiv.textContent = 'Error: ' + data.error;
    }
  } catch (error) {
    analysisDiv.textContent = 'Error sending image for analysis.';
    console.error('Error:', error);
  }
});

// Start camera when app area is shown
function showAppArea() {
  authArea.style.display = 'none';
  appArea.style.display = 'block';
  startCamera();
}

// On page load, show auth area by default
showAuthArea();
