import React, { useState } from 'react';
import { User, Calendar, MessageCircle, Star, Award, Target, MapPin } from 'lucide-react';

const PersonalTrainerSection: React.FC = () => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [formData, setFormData] = useState({
    sessionType: '1-on-1 Training Session',
    date: '',
    time: 'Morning (6:00 AM - 12:00 PM)'
  });

  const trainers = [
    {
      id: 'courage',
      name: 'Courage Ihoeginlan',
      gender: 'Male',
      specialty: 'Personal & Group Training, Nutrition',
      experience: '3+ years',
      rating: 4.9,
      image: 'https://media.licdn.com/dms/image/v2/D4E03AQFsEeSmAePzsw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1725486409750?e=2147483647&v=beta&t=iK6bce_GWatvZPD3MmngxUy9zl_76re5EwA5-iMS1pk',
      bio: 'An enthusiastic young fitness trainer with the knowledge and experience of helping individuals reach their ultimate fitness goals and improving overall well-being. A versatile fitness coach who works with the general population from young to elderly. My services range from nutrition to hands-on personal and group fitness training. With over 3 years of experience, my services are guaranteed to deliver results.',
      certifications: ['Certified Nutrition & Fitness Coach'],
      achievements: ['Transformed dozens of clients across all age groups'],
      location: null,
      contact: {
        instagram: ['@mrihoeg', '@_cofitness'],
        email: 'cofits1@gmail.com',
        linkedin: 'https://www.linkedin.com/in/courage-williams-21b079260'
      }
    },
    {
      id: 'estelle',
      name: 'Estelle Djiofack',
      gender: 'Female',
      specialty: 'Strength Training & Nutrition',
      experience: '4 years',
      rating: 4.8,
      image: 'https://media.licdn.com/dms/image/v2/D5603AQGf56ZBNhjhng/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1697585607592?e=2147483647&v=beta&t=neqwEol4uCDG0GFtniAmPLwmTd7tFAhSD9VhuhG5WJw',
      bio: 'Certified nutritionist and fitness trainer with 3+ years of experience, Estelle is passionate about helping clients of all ages reach their health goals through personalized meal plans and dynamic personal or group training.',
      certifications: ['Certified Nutritionist', 'Certified Fitness Trainer'],
      achievements: ['Specialized in strength training for all fitness levels', 'Expert in personalized nutrition planning'],
      location: {
        gym: 'Anytime Fitness',
        address: '2505 Rue De L\'Aulnaie, Mont tremblant, QC J8E 0E5, Canada'
      },
      contact: {
        instagram: ['@estrella.camille2'],
        email: 'edjiofack87@gmail.com',
        linkedin: 'https://www.linkedin.com/in/estelle-djiofack-a4a273268'
      }
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openBookingModal = (trainer: any) => {
    setSelectedTrainer(trainer);
    setShowBookingModal(true);
  };

  const sendEmail = async () => {
    const response = await fetch('https://formspree.io/f/xaylkbpr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        trainer_name: selectedTrainer.name,
        session_type: formData.sessionType,
        session_date: formData.date,
        session_time: formData.time,
        email: selectedTrainer.contact.email
      })
    });

    if (response.ok) {
      alert('Booking request sent!');
    } else {
      alert('Failed to send booking request');
    }
  };

  return (
    <section className="py-20 bg-stone-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-stone-900 mb-6">Personal Trainers</h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Get personalized guidance from our certified trainers for fitness and nutrition plans.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {trainers.map((trainer) => (
            <div key={trainer.id} className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="flex items-start space-x-6 mb-6">
                <img 
                  src={trainer.image}
                  alt={trainer.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-amber-100"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-2xl font-bold text-stone-900">{trainer.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      trainer.gender === 'Male' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-pink-100 text-pink-800'
                    }`}>
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

              {trainer.location && (
                <div className="mb-6">
                  <h4 className="font-semibold text-stone-900 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-amber-700" />
                    Location
                  </h4>
                  <div className="text-stone-600">
                    <p className="font-medium">{trainer.location.gym}</p>
                    <p className="text-sm">{trainer.location.address}</p>
                  </div>
                </div>
              )}

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
                  onClick={() => openBookingModal(trainer)}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Session
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showBookingModal && selectedTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-stone-900 mb-6">Book Training Session</h3>
            <p className="text-stone-600 mb-4">Booking with: <span className="font-semibold text-amber-700">{selectedTrainer.name}</span></p>
            <div className="space-y-4">
              <div>
                <label className="block text-stone-700 font-semibold mb-2">Session Type</label>
                <select
                  name="sessionType"
                  value={formData.sessionType}
                  onChange={handleChange}
                  className="w-full bg-stone-50 text-stone-900 p-3 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none"
                >
                  <option>1-on-1 Training Session</option>
                  <option>Nutrition Consultation</option>
                  <option>Fitness Assessment</option>
                  <option>Group Training Session</option>
                </select>
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-2">Preferred Date</label>
                <input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-stone-50 text-stone-900 p-3 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-stone-700 font-semibold mb-2">Preferred Time</label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full bg-stone-50 text-stone-900 p-3 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none"
                >
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
                onClick={() => {
                  sendEmail();
                  setShowBookingModal(false);
                }}
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