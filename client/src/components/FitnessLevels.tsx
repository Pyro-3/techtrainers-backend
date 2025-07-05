import { FitnessLevel } from '../types/fitness';

interface FitnessLevelsProps {
  onSectionChange: (section: FitnessLevel) => void;
}

const FitnessLevels = ({ onSectionChange }: FitnessLevelsProps) => {
  const levels = [
    {
      id: 'beginner' as FitnessLevel,
      title: 'Beginner',
      description: 'Just starting out? Let\'s lay the groundwork for strength and consistency.',
      image: '/beginner-fitness-woman.jpg',
      // Fallback in case the local image fails to load
      fallbackImage: '/beginner-fitness-woman.jpg', // Using local file as both primary and fallback
      alt: 'A fit woman at beginner level working out, showing determination and focus.',
      icon: '🌱'
    },
    {
      id: 'intermediate' as FitnessLevel,
      title: 'Intermediate',
      description: 'Already grinding? Time to personalize your game plan and break limits.',
      image: '/intermediate-fitness.jpg',
      fallbackImage: 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=600',
      alt: 'A person lifting weights with focus, indicating progressing in training.',
      icon: '🔥'
    },
    {
      id: 'advanced' as FitnessLevel,
      title: 'Advanced',
      description: 'Max out your potential with the total package: track habits, log workouts, and unlock streak rewards.',
      image: '/advanced-fitness.jpg',
      fallbackImage: 'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=600',
      alt: 'An individual performing a heavy compound lift, representing peak performance and advanced training.',
      icon: '⚡'
    }
  ];

  const handleLevelClick = (level: FitnessLevel) => {
    onSectionChange(level);
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-stone-900 mb-6">Select Your Training Tier</h2>
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
                  loading="eager" // Prioritize loading this image
                  // Enhanced error handling for image loading
                  onError={(e) => {
                    const fallback = level.fallbackImage;
                    console.log(`Image load error for ${level.id}, trying fallback: ${fallback}`);
                    if (fallback && e.currentTarget.src !== fallback) {
                      e.currentTarget.src = fallback;
                    }
                  }}
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
  );
};

export default FitnessLevels;