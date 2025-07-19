import React, { useState } from 'react';
import { Send } from 'lucide-react';

const Contact: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `mailto:ttt@tirothetyrant.com?subject=Contact from TechTrainer&body=${encodeURIComponent(message)}`;
  };

  return (
    <section id="contact" className="py-20 bg-stone-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-stone-900 mb-6">Get In Touch</h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Have questions about your fitness journey? We're here to help you succeed.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-stone-700 font-semibold mb-3">
                  Your Email:
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-stone-50 text-stone-900 p-4 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none transition-colors duration-300"
                  placeholder="Enter your email address"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-stone-700 font-semibold mb-3">
                  Your Message:
                </label>
                <div className="relative">
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={8}
                    className="w-full bg-stone-50 text-stone-900 p-4 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                  <button
                    type="submit"
                    className="absolute bottom-4 right-4 bg-amber-700 hover:bg-amber-800 text-white p-3 rounded-lg transition-all duration-300 flex items-center space-x-2 transform hover:scale-105"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;