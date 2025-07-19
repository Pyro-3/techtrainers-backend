import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-stone-100">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-stone-900 mb-6">About TechTrainer</h2>
          <p className="text-xl text-stone-600 leading-relaxed mb-12">
            TechTrainer is a cutting-edge fitness platform designed for lifters at every stage—from beginner to elite. 
            Whether you're aiming to build muscle, improve performance, or track progress, TechTrainer provides tier-based 
            training, workout generators, analytics, habit tracking, and motivational tools to elevate your fitness journey.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-4">Personalized Training</h3>
              <p className="text-stone-600">Customized workout plans tailored to your fitness level and goals.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-4">Progress Analytics</h3>
              <p className="text-stone-600">Track your progress with detailed analytics and performance insights.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-4">Achievement System</h3>
              <p className="text-stone-600">Stay motivated with streaks, badges, and milestone rewards.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;