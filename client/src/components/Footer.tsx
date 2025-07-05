import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">TECH TRAINERS</h3>
            <p className="text-stone-400 leading-relaxed">
              Unlock your tech potential with expert training for all skill levels.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Training</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-amber-400 transition-colors duration-300">Beginner</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors duration-300">Intermediate</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors duration-300">Advanced</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Features</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-amber-400 transition-colors duration-300">Workout Generator</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors duration-300">Progress Tracking</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors duration-300">Exercise Library</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-amber-400 transition-colors duration-300">Help Center</a></li>
              <li><a href="#contact" className="hover:text-amber-400 transition-colors duration-300">Contact Us</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors duration-300">Community</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-stone-700 pt-8 text-center">
          <p className="text-stone-400">
            &copy; 2025 TechTrainer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;