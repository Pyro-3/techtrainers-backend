import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold text-stone-900 mb-6">About TechTrainer</h1>
              <p className="text-xl text-stone-600 leading-relaxed">
                Your ultimate fitness companion for achieving peak performance
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <img 
                  src="https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Fitness training in action"
                  className="w-full h-80 object-cover rounded-2xl shadow-lg"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-stone-900 mb-6">Our Mission</h2>
                <p className="text-lg text-stone-600 leading-relaxed mb-6">
                  TechTrainer is a cutting-edge fitness platform designed for lifters at every stage—from beginner to elite. 
                  Whether you're aiming to build muscle, improve performance, or track progress, TechTrainer provides tier-based 
                  training, workout generators, analytics, habit tracking, and motivational tools to elevate your fitness journey.
                </p>
                <p className="text-lg text-stone-600 leading-relaxed">
                  No gimmicks—just powerful tools to help you stay consistent, focused, and accountable on your path to greatness.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-stone-100 p-8 rounded-xl text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-4">Personalized Training</h3>
                <p className="text-stone-600">Customized workout plans tailored to your fitness level and goals.</p>
              </div>
              
              <div className="bg-stone-100 p-8 rounded-xl text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-4">Progress Analytics</h3>
                <p className="text-stone-600">Track your progress with detailed analytics and performance insights.</p>
              </div>
              
              <div className="bg-stone-100 p-8 rounded-xl text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-4">Achievement System</h3>
                <p className="text-stone-600">Stay motivated with streaks, badges, and milestone rewards.</p>
              </div>
            </div>

            <div className="bg-amber-50 p-8 rounded-2xl">
              <h2 className="text-3xl font-bold text-stone-900 mb-6 text-center">Why Choose TechTrainer?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900 mb-2">Tier-Based Training</h4>
                    <p className="text-stone-600">Progressive training systems that grow with your abilities</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900 mb-2">Smart Analytics</h4>
                    <p className="text-stone-600">Data-driven insights to optimize your performance</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900 mb-2">Habit Tracking</h4>
                    <p className="text-stone-600">Build lasting habits with our comprehensive tracking system</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900 mb-2">Personal Trainers</h4>
                    <p className="text-stone-600">Expert guidance from certified male and female trainers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default AboutPage;