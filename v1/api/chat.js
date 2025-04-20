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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}
