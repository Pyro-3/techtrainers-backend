import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Award, Shield, Users, Zap } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                About <span className="text-cyan-400">TechTrainer</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-stone-200 max-w-3xl mx-auto">
                Your ultimate fitness companion for achieving peak performance and building lasting habits.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      
      <main className="container mx-auto px-4 py-16 space-y-20">
        {/* Mission Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src="https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Fitness training in action"
              className="w-full h-80 object-cover rounded-2xl shadow-lg"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold text-stone-900 mb-6">Our Mission</h2>
            <p className="text-lg text-stone-600 leading-relaxed mb-6">
              TechTrainer is a cutting-edge fitness platform designed for lifters at every stage—from beginner to elite. 
              Whether you're aiming to build muscle, improve performance, or track progress, TechTrainer provides tier-based 
              training, workout generators, analytics, habit tracking, and motivational tools to elevate your fitness journey.
            </p>
            <p className="text-lg text-stone-600 leading-relaxed">
              No gimmicks—just powerful tools to help you stay consistent, focused, and accountable on your path to greatness.
            </p>
          </motion.div>
        </section>

        {/* Core Features */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">What We Offer</h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              Comprehensive fitness solutions designed to support your journey at every level.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              whileHover={{ y: -8 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-4">Personalized Training</h3>
              <p className="text-stone-600">Customized workout plans tailored to your fitness level and goals.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              whileHover={{ y: -8 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-4">Progress Analytics</h3>
              <p className="text-stone-600">Track your progress with detailed analytics and performance insights.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              whileHover={{ y: -8 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-4">Achievement System</h3>
              <p className="text-stone-600">Stay motivated with streaks, badges, and milestone rewards.</p>
            </motion.div>
          </div>
        </section>

        {/* Why Choose TechTrainer */}
        <section className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-3xl p-8 md:p-12">
          <h2 className="text-4xl font-bold text-stone-900 mb-12 text-center">Why Choose TechTrainer?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="flex items-start space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 mb-2 text-lg">Tier-Based Training</h4>
                <p className="text-stone-600">Progressive training systems that grow with your abilities</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 mb-2 text-lg">Smart Analytics</h4>
                <p className="text-stone-600">Data-driven insights to optimize your performance</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 mb-2 text-lg">Habit Tracking</h4>
                <p className="text-stone-600">Build lasting habits with our comprehensive tracking system</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-start space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-900 mb-2 text-lg">Personal Trainers</h4>
                <p className="text-stone-600">Expert guidance from certified male and female trainers</p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutPage;