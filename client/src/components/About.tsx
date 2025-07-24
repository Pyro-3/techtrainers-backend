import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const About: React.FC = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: '🎯',
      title: 'Personalized Training',
      description: 'Customized workout plans tailored to your fitness level and goals.',
      gradient: 'from-amber-500 to-orange-500',
      link: '/beginner'
    },
    {
      icon: '📊',
      title: 'Progress Analytics',
      description: 'Track your progress with detailed analytics and performance insights.',
      gradient: 'from-amber-500 to-orange-500',
      link: '/dashboard'
    },
    {
      icon: '🏆',
      title: 'Achievement System',
      description: 'Stay motivated with streaks, badges, and milestone rewards.',
      gradient: 'from-amber-500 to-orange-500',
      link: '/fitness'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7
      }
    }
  };

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid grid-cols-12 gap-4 h-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <motion.div
              key={i}
              className="border-r border-stone-700/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 5
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <motion.div
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full px-6 py-2 mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <span className="text-amber-400 font-medium">ABOUT TECHTRAINER</span>
              <ChevronRightIcon className="w-4 h-4 text-amber-400" />
            </motion.div>
            
            <h2 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-amber-200 to-orange-200 bg-clip-text text-transparent leading-tight mb-6">
              Elevate Your<br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Fitness Journey
              </span>
            </h2>
            
            <motion.p
              className="text-xl text-stone-300 leading-relaxed max-w-3xl mx-auto"
              variants={itemVariants}
            >
              TechTrainer is a cutting-edge fitness platform designed for lifters at every stage—from beginner to elite. 
              Whether you're aiming to build muscle, improve performance, or track progress, TechTrainer provides tier-based 
              training, workout generators, analytics, habit tracking, and motivational tools to elevate your fitness journey.
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ 
                  y: -10,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative bg-stone-800/50 backdrop-blur-sm border border-stone-700/50 p-8 rounded-2xl hover:border-amber-500/50 transition-all duration-500">
                  {/* Icon with Gradient Background */}
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    <span className="text-2xl filter drop-shadow-sm">{feature.icon}</span>
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-amber-200 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-stone-400 leading-relaxed mb-6 group-hover:text-stone-300 transition-colors duration-300">
                    {feature.description}
                  </p>

                  {/* Action Button */}
                  <motion.button
                    className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium transition-colors duration-300"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => navigate(feature.link)}
                  >
                    Learn More
                    <ArrowRightIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Key Features Section */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-stone-800/30 to-stone-700/30 backdrop-blur-sm border border-stone-600/30 rounded-3xl p-8 md:p-12"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Platform Features</h3>
              <p className="text-stone-400">Everything you need for a complete fitness experience</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { feature: 'Tier-Based Training', icon: '⬆️' },
                { feature: 'Workout Generators', icon: '🎲' },
                { feature: 'Progress Analytics', icon: '📈' },
                { feature: 'Habit Tracking', icon: '✅' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="text-center p-4 rounded-xl bg-stone-700/30 border border-stone-600/30 hover:border-amber-500/50 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="text-stone-300 font-medium">{item.feature}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-16"
          >
            <motion.button
              className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg transition-all duration-300"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(245, 158, 11, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/beginner')}
            >
              <span>Start Training Today</span>
              <ChevronRightIcon className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;