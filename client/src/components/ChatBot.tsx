import { useState } from 'react';
import { X, Send, Bot, User } from 'lucide-react';

interface ChatBotProps {
  onClose: () => void;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot = ({ onClose }: ChatBotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm your TechTrainer assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const botResponses = {
    greeting: "Hello! Welcome to TechTrainer. I'm here to help you with any questions about our fitness programs.",
    pricing: "Our pricing varies by tier: Beginner (Free), Intermediate ($29/month), Advanced ($49/month with personal trainer access).",
    features: "TechTrainer offers workout plans, progress tracking, nutrition guidance, and personal trainer support depending on your tier.",
    support: "For technical support, please email us at support@techtrainer.com or use this chat for immediate assistance.",
    default: "I understand you're asking about that. Let me connect you with our support team for detailed assistance. You can also email us at admin@techtrainer.com"
  };

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return botResponses.greeting;
    } else if (message.includes('price') || message.includes('cost') || message.includes('pricing')) {
      return botResponses.pricing;
    } else if (message.includes('feature') || message.includes('what') || message.includes('how')) {
      return botResponses.features;
    } else if (message.includes('support') || message.includes('help') || message.includes('problem')) {
      return botResponses.support;
    } else {
      return botResponses.default;
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const userMessage: Message = {
        id: messages.length + 1,
        text: inputMessage,
        sender: 'user',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);

      // Simulate bot response delay
      setTimeout(() => {
        const botMessage: Message = {
          id: messages.length + 2,
          text: getBotResponse(inputMessage),
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1000);

      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-end p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-96 flex flex-col">
        {/* Header */}
        <div className="bg-amber-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">TechTrainer Support</h3>
              <p className="text-sm opacity-90">Online now</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-amber-200 transition-colors duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-xs ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user' ? 'bg-amber-700' : 'bg-stone-200'
                }`}>
                  {message.sender === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-stone-600" />
                  )}
                </div>
                <div className={`p-3 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-amber-700 text-white' 
                    : 'bg-stone-100 text-stone-900'
                }`}>
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-stone-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-stone-50 text-stone-900 p-3 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="bg-amber-700 hover:bg-amber-800 text-white p-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;