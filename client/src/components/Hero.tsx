import React from 'react';

interface HeroProps {
  onStartJourney: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartJourney }) => {
  return (
    <section className="bg-white py-20 pt-32">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Exercise Icons Grid */}
          <div className="relative">
            <div 
              className="relative bg-cover bg-center rounded-2xl overflow-hidden shadow-2xl"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800')`
              }}
            >
              <div className="h-96 lg:h-[500px] flex items-center justify-center">
                {/* Exercise Icons Overlay */}
                <div className="grid grid-cols-3 gap-4 p-8">
                  {[
                    '🏃', '🏋️', '💪', '🤸', '🧘', '⚡', '🎯', '🔥', '⭐'
                  ].map((icon, index) => (
                    <div 
                      key={index}
                      className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl hover:bg-white/30 transition-all duration-300 cursor-pointer transform hover:scale-110"
                    >
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-8">
            <div>
              <p className="text-amber-700 font-medium text-lg mb-4 tracking-wide">WELCOME</p>
              <h1 className="text-5xl lg:text-6xl font-bold text-stone-900 leading-tight mb-6">
                Unlock Your<br />
                <span className="text-amber-700">Tech Potential</span>
              </h1>
              <p className="text-xl text-stone-600 leading-relaxed mb-8">
                Expert tech training with interactive features to track your progress and achieve your fitness goals.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="font-medium">Progress Tracking</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="font-medium">Custom Workouts</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-medium">Goal Setting</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="font-medium">Workout Scheduling</span>
              </div>
            </div>

            <button 
              onClick={onStartJourney}
              className="bg-amber-700 hover:bg-amber-800 text-white font-semibold py-4 px-12 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-lg tracking-wide"
            >
              START YOUR JOURNEY
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;