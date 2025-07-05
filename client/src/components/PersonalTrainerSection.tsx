//  import React from 'react';
import React, { useState } from 'react';
import { User, Calendar, MessageCircle, Star, Award, Target } from 'lucide-react';

const PersonalTrainerSection: React.FC = () => {
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const trainer = {
    id: 'courage',
    name: 'Courage Ihoeginlan',
    gender: 'Male',
    specialty: 'Personal & Group Training, Nutrition',
    experience: '3+ years',
    rating: 4.9,
    image: 'https://www.instagram.com/p/C8dgL9nt7Ox/?img_index=1',
    bio: 'An enthusiastic young fitness trainer with the knowledge and experience of helping individuals reach their ultimate fitness goals and improving overall well-being. A versatile fitness coach who works with the general population from young to elderly. My services range from nutrition to hands-on personal and group fitness training. With over 3 years of experience, my services are guaranteed to deliver results.',
    certifications: ['Certified Nutrition & Fitness Coach'],
    achievements: ['Transformed dozens of clients across all age groups'],
    contact: {
      instagram: ['@mrihoeg', '@_cofitness'],
      email: 'cofits1@gmail.com',
      linkedin: 'https://www.linkedin.com/in/courage-williams-21b079260'
    }
  };

  const handleBookSession = () => {
    setSelectedTrainer(trainer.id);
    setShowBookingModal(true);
  };

  return (
    <section className="py-20 bg-stone-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-stone-900 mb-6">Personal Trainer</h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Get personalized guidance from our certified trainer for fitness and nutrition plans.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl p-8 shadow-xl">
          <div className="flex items-start space-x-6 mb-6">
            <img 
              src={trainer.image}
              alt={trainer.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-amber-100"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-2xl font-bold text-stone-900">{trainer.name}</h3>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                  {trainer.gender}
                </span>
              </div>
              <p className="text-amber-700 font-semibold mb-2">{trainer.specialty}</p>
              <div className="flex items-center space-x-4 text-stone-600">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{trainer.experience}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{trainer.rating}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-stone-600 mb-6 leading-relaxed">{trainer.bio}</p>

          <div className="mb-6">
            <h4 className="font-semibold text-stone-900 mb-3 flex items-center">
              <Award className="w-5 h-5 mr-2 text-amber-700" />
              Certifications
            </h4>
            <div className="flex flex-wrap gap-2">
              {trainer.certifications.map((cert, index) => (
                <span key={index} className="px-3 py-1 bg-stone-100 text-stone-700 rounded-lg text-sm">
                  {cert}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-stone-900 mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2 text-amber-700" />
              Achievements
            </h4>
            <ul className="space-y-1">
              {trainer.achievements.map((achievement, index) => (
                <li key={index} className="text-stone-600 flex items-center">
                  <span className="w-2 h-2 bg-amber-700 rounded-full mr-3"></span>
                  {achievement}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-stone-900 mb-3 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-amber-700" />
              Contact
            </h4>
            <ul className="space-y-1 text-stone-600">
              <li>Email: <a href={`mailto:${trainer.contact.email}`} className="text-amber-700 underline">{trainer.contact.email}</a></li>
              <li>Instagram: {trainer.contact.instagram.map((handle, i) => (
                <span key={i} className="ml-1">{handle}</span>
              ))}</li>
              <li>LinkedIn: <a href={trainer.contact.linkedin} target="_blank" className="text-amber-700 underline">Profile</a></li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleBookSession}
              className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Session
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-stone-900 mb-6">Book Training Session</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-stone-700 font-semibold mb-2">Session Type</label>
                <select className="w-full bg-stone-50 text-stone-900 p-3 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none">
                  <option>1-on-1 Training Session</option>
                  <option>Nutrition Consultation</option>
                  <option>Fitness Assessment</option>
                </select>
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-2">Preferred Date</label>
                <input 
                  type="date" 
                  className="w-full bg-stone-50 text-stone-900 p-3 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-2">Preferred Time</label>
                <select className="w-full bg-stone-50 text-stone-900 p-3 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none">
                  <option>Morning (6:00 AM - 12:00 PM)</option>
                  <option>Afternoon (12:00 PM - 6:00 PM)</option>
                  <option>Evening (6:00 PM - 10:00 PM)</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-4 mt-8">
              <button 
                onClick={() => setShowBookingModal(false)}
                className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold py-3 px-6 rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PersonalTrainerSection;