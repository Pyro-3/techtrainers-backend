const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   POST /api/chat/message
// @desc    Send a message to the AI trainer
// @access  Private
router.post('/message', auth, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Message content is required'
      });
    }
    
    // In a real application, this would interact with an AI model or chat service
    // For now, we'll just provide some basic canned responses
    
    let response;
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes('workout') || lowercaseMessage.includes('exercise')) {
      response = "I recommend focusing on compound exercises like squats, deadlifts, and bench press for overall strength. Make sure to warm up properly and maintain good form!";
    } else if (lowercaseMessage.includes('diet') || lowercaseMessage.includes('nutrition') || lowercaseMessage.includes('eat')) {
      response = "A balanced diet with adequate protein is essential for your fitness goals. Try to eat whole, unprocessed foods and stay hydrated throughout the day.";
    } else if (lowercaseMessage.includes('weight loss') || lowercaseMessage.includes('fat loss') || lowercaseMessage.includes('lose weight')) {
      response = "For weight loss, focus on maintaining a slight caloric deficit, consistent exercise, and getting enough sleep. Remember that sustainable progress takes time!";
    } else if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi') || lowercaseMessage.includes('hey')) {
      response = "Hello! I'm your TechTrainer assistant. How can I help with your fitness journey today?";
    } else {
      response = "Thanks for your message! As your fitness assistant, I'm here to help with workouts, nutrition advice, and motivation. What specific fitness goals are you working towards?";
    }
    
    // Store message in history (would be in a database in production)
    // For now, just return the response
    
    res.json({
      status: 'success',
      data: {
        message: {
          id: `msg-${Date.now()}`,
          from: 'assistant',
          content: response,
          timestamp: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to process message'
    });
  }
});

// @route   GET /api/chat/messages
// @desc    Get chat message history
// @access  Private
router.get('/messages', auth, async (req, res) => {
  try {
    // In production, fetch from database
    // For now, return mock data
    const messages = [
      {
        id: 'msg-1',
        from: 'user',
        content: 'Hi, I need help with my workout routine',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 'msg-2',
        from: 'assistant',
        content: "Hello! I'd be happy to help with your workout routine. What are your fitness goals and how much time can you dedicate to working out each week?",
        timestamp: new Date(Date.now() - 3500000)
      }
    ];
    
    res.json({
      status: 'success',
      data: {
        messages
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve messages'
    });
  }
});

module.exports = router;
