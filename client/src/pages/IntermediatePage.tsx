import React, { useState } from 'react'
import { ChevronDown, ArrowLeft, Target, Clock, TrendingUp, Award, Zap, Shield, Calendar, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import Header from '../components/Header'
import Footer from '../components/Footer'
import IntermediateWorkouts from '../components/workouts/IntermediateWorkouts'
import SampleRoutine from '../components/SampleRoutine';

const benefits = [
  {
    title: 'Strength & Muscle Growth',
    desc: 'Build serious mass and power with compound movements and progressive overload protocols designed for intermediate lifters.',
    icon: <Target className="w-8 h-8 text-amber-600" />,
    stats: '15-25% strength increase'
  },
  {
    title: 'Advanced Training Methods',
    desc: 'Master drop sets, supersets, and pyramid training to break through plateaus and maximize your gym sessions.',
    icon: <TrendingUp className="w-8 h-8 text-amber-600" />,
    stats: '4-6 training techniques'
  },
  {
    title: 'Optimized Recovery',
    desc: 'Strategic rest periods and deload weeks ensure consistent progress while preventing overtraining and injury.',
    icon: <Shield className="w-8 h-8 text-amber-600" />,
    stats: '48-72hr muscle recovery'
  },
]

const workoutSplits = [
  {
    name: 'Push/Pull/Legs',
    frequency: '6 days/week',
    focus: 'Muscle Group Isolation',
    description: 'Classic bodybuilding split focusing on pushing muscles (chest, shoulders, triceps), pulling muscles (back, biceps), and legs.',
    exercises: ['Bench Press', 'Deadlifts', 'Squats', 'Overhead Press', 'Rows', 'Leg Press'],
    difficulty: 'Intermediate',
    duration: '75-90 min'
  },
  {
    name: 'Upper/Lower Split',
    frequency: '4 days/week',
    focus: 'Balanced Development',
    description: 'Perfect for strength and size gains with adequate recovery time between sessions.',
    exercises: ['Incline Press', 'Romanian Deadlifts', 'Pull-ups', 'Bulgarian Split Squats', 'Dips', 'Hip Thrusts'],
    difficulty: 'Intermediate',
    duration: '60-75 min'
  },
  {
    name: 'Full Body Power',
    frequency: '3 days/week',
    focus: 'Athletic Performance',
    description: 'Compound movements with explosive training for strength, power, and athletic performance.',
    exercises: ['Power Cleans', 'Front Squats', 'Weighted Pull-ups', 'Push Press', 'Barbell Rows', 'Box Jumps'],
    difficulty: 'Intermediate-Advanced',
    duration: '90-105 min'
  }
]

const strengthStandards = [
  {
    lift: 'Bench Press',
    beginner: '1x bodyweight',
    intermediate: '1.25x bodyweight',
    advanced: '1.5x bodyweight',
    icon: '🏋️‍♂️'
  },
  {
    lift: 'Squat',
    beginner: '1.25x bodyweight',
    intermediate: '1.5x bodyweight',
    advanced: '2x bodyweight',
    icon: '🦵'
  },
  {
    lift: 'Deadlift',
    beginner: '1.5x bodyweight',
    intermediate: '2x bodyweight',
    advanced: '2.5x bodyweight',
    icon: '💪'
  },
  {
    lift: 'Overhead Press',
    beginner: '0.66x bodyweight',
    intermediate: '0.85x bodyweight',
    advanced: '1x bodyweight',
    icon: '🔥'
  }
]

const faqs = [
  {
    q: 'How do I know if I\'m ready for intermediate workouts?',
    a: 'You should have 6-12 months of consistent training, proper form on basic lifts, and can bench press your bodyweight, squat 1.25x, and deadlift 1.5x your bodyweight.',
  },
  {
    q: 'What\'s the difference between intermediate and beginner programs?',
    a: 'Intermediate programs have higher volume, more exercise variety, advanced techniques like drop sets, and require better recovery management. They also focus more on periodization.',
  },
  {
    q: 'How long should I rest between sets?',
    a: 'For compound lifts: 2-3 minutes. For isolation exercises: 60-90 seconds. For strength-focused work: 3-5 minutes. Listen to your body and adjust accordingly.',
  },
  {
    q: 'Can I train every day as an intermediate?',
    a: 'While possible, it\'s not recommended. 4-6 training days per week with proper programming allows for adequate recovery and consistent progress.',
  },
  {
    q: 'What should I do if I plateau?',
    a: 'Try deload weeks, change rep ranges, add new exercises, improve sleep/nutrition, or switch to a different training split. Sometimes stepping back leads to bigger gains.',
  }
]

const IntermediatePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-inter">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Intermediate <span className="text-amber-400">Strength</span> Training
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-stone-200 max-w-3xl mx-auto">
                Take your lifting to the next level with advanced programming, proven techniques, and structured progression for serious gains.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/workout-generator"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                >
                  Start Training Today
                </Link>
                <Link
                  to="/select-tier"
                  className="border-2 border-white hover:bg-white hover:text-stone-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" /> Back to Tiers
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16 space-y-20">

        {/* Key Benefits */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Intermediate Training Works</h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              Bridge the gap between beginner gains and advanced techniques with scientifically-backed programming.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -8 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center mb-4">
                  {benefit.icon}
                  <div className="ml-4">
                    <h3 className="text-xl font-bold">{benefit.title}</h3>
                    <span className="text-amber-600 font-semibold text-sm">{benefit.stats}</span>
                  </div>
                </div>
                <p className="text-stone-600 leading-relaxed">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Workout Splits */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Choose Your Training Split</h2>
            <p className="text-xl text-stone-600">
              Select the workout structure that fits your schedule and goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {workoutSplits.map((split, i) => (
              <motion.div
                key={i}
                className="border-2 border-stone-200 rounded-2xl p-6 hover:border-amber-400 transition-all duration-300 cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveTab(i)}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{split.name}</h3>
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                    {split.difficulty}
                  </span>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-stone-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{split.frequency}</span>
                  </div>
                  <div className="flex items-center text-stone-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{split.duration}</span>
                  </div>
                  <div className="flex items-center text-stone-600">
                    <Target className="w-4 h-4 mr-2" />
                    <span>{split.focus}</span>
                  </div>
                </div>
                
                <p className="text-stone-600 mb-4">{split.description}</p>
                
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Key Exercises:</h4>
                  <div className="flex flex-wrap gap-2">
                    {split.exercises.slice(0, 3).map((exercise, idx) => (
                      <span key={idx} className="bg-stone-100 text-stone-700 px-2 py-1 rounded text-sm">
                        {exercise}
                      </span>
                    ))}
                    <span className="text-stone-500 text-sm">+{split.exercises.length - 3} more</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

         {/* Sample Workouts */}
    <section>
      <h2 className="text-3xl font-semibold text-center mb-8">Sample Routine</h2>
      <div className="max-w-4xl mx-auto">
        <p className="text-stone-600 mb-6 text-center">
          Here's an example to give you an idea of what an intermediate workout looks like.
        </p>
      <SampleRoutine />
      </div>
    </section>

        {/* Strength Standards */}
        <section className="bg-gradient-to-r from-amber-50 to-stone-50 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Strength Standards</h2>
            <p className="text-xl text-stone-600">
              Track your progress with these intermediate lifting benchmarks.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {strengthStandards.map((standard, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-xl p-6 shadow-lg"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-center">
                  <div className="text-3xl mb-3">{standard.icon}</div>
                  <h3 className="text-lg font-bold mb-4">{standard.lift}</h3>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-stone-500">Beginner:</span>
                      <span className="font-semibold ml-2">{standard.beginner}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-amber-600">Intermediate:</span>
                      <span className="font-bold ml-2 text-amber-700">{standard.intermediate}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-stone-500">Advanced:</span>
                      <span className="font-semibold ml-2">{standard.advanced}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-stone-600">
              Everything you need to know about intermediate training.
            </p>
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                className="bg-white p-6 rounded-xl shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <summary className="cursor-pointer flex justify-between items-center font-semibold text-lg hover:text-amber-600 transition-colors">
                  {faq.q}
                  <ChevronDown className="w-5 h-5" />
                </summary>
                <p className="mt-4 text-stone-600 leading-relaxed">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-3xl p-8 md:p-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Level Up Your Training?
            </h3>
            <p className="text-xl mb-8 text-amber-100 max-w-2xl mx-auto">
              Join thousands of lifters who've transformed their physiques with our intermediate programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/workout-generator"
                className="bg-white text-amber-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-amber-50 transition-all duration-300 transform hover:scale-105"
              >
                Generate My Workout
              </Link>
              <Link
                to="/support"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-amber-600 transition-all duration-300 flex items-center justify-center"
              >
                <Users className="w-5 h-5 mr-2" />
                Email Us for a Trainer
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default IntermediatePage