import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FitnessLevel } from '../types/fitness';

const SelectTierPage: React.FC = () => {
  const navigate = useNavigate();

  const levels = [
    {
      id: 'beginner' as FitnessLevel,
      title: 'Beginner',
      description: 'Just starting out? Let\'s lay the groundwork for strength and consistency.',
      image: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=600',
      alt: 'A person performing a fundamental squat exercise, symbolizing foundational strength.',
      icon: '🌱'
    },
    {
      id: 'intermediate' as FitnessLevel,
      title: 'Intermediate',
      description: 'Already grinding? Time to personalize your game plan and break limits.',
      image: 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=600',
      alt: 'A person lifting weights with focus, indicating progressing in training.',
      icon: '🔥'
    },
    {
      id: 'advanced' as FitnessLevel,
      title: 'Advanced',
      description: 'Max out your potential with the total package: track habits, log workouts, and unlock streak rewards.',
      image: 'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=600',
      alt: 'An individual performing a heavy compound lift, representing peak performance and advanced training.',
      icon: '⚡'
    }
  ];

  const handleLevelClick = (level: FitnessLevel) => {
    navigate(`/${level}`);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-stone-900 mb-6">Select Your Training Tier</h1>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Choose the training level that matches your current fitness journey and goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {levels.map((level) => (
              <div key={level.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-stone-200">
                <div className="relative overflow-hidden">
                  <img 
                    src={level.image}
                    alt={level.alt}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl">
                    {level.icon}
                  </div>
                </div>
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-stone-900 mb-4">{level.title}</h3>
                  <p className="text-stone-600 mb-8 leading-relaxed">{level.description}</p>
                  <button 
                    onClick={() => handleLevelClick(level.id)}
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Enter Level
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default SelectTierPage;