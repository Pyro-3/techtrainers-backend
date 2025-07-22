// src/pages/BeginnerPage.tsx
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BeginnerWorkouts from '../components/workouts/BeginnerWorkouts';
import {
  ChevronDown,
  ArrowLeft,
  Target,
  Clock,
  TrendingUp,
  Award,
  Zap,
  Shield,
  Calendar,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const benefits = [
  {
    icon: <Zap className="w-6 h-6 text-amber-700" />,
    title: 'Quick Start',
    desc: 'Jump right in with zero setup — your first workout is ready to go.',
  },
  {
    icon: <Clock className="w-6 h-6 text-amber-700" />,
    title: 'Structured Timing',
    desc: 'Built‑in rest timers and pacing guidance to keep you on track.',
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-amber-700" />,
    title: 'Progress Tracking',
    desc: 'Log sets & reps and watch your numbers climb over time.',
  },
  {
    icon: <Shield className="w-6 h-6 text-amber-700" />,
    title: 'Safety First',
    desc: 'Form cues and recovery tips to keep you injury‑free.',
  },
];

const faqs = [
  {
    q: 'How often should I train each muscle group?',
    a: 'For beginners, 2–3× per week per muscle group works well — just allow 48 h between sessions.',
  },
  {
    q: 'Do I need any special equipment?',
    a: 'All workouts are designed for dumbbells and machines, but body‑weight alternatives are suggested too.',
  },
  {
    q: 'What if I miss a day?',
    a: 'No sweat — just pick up where you left off. Consistency over perfection wins long‑term.',
  },
];

const BeginnerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-inter">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Beginner <span className="text-emerald-400">Fitness</span> Journey
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-stone-200 max-w-3xl mx-auto">
                Start strong with our hand‑held, step‑by‑step fitness plan designed to build confidence and lasting habits.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/workout-generator"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                >
                  Start Your Journey
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

        {/* Core Benefits */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Core Benefits</h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              Everything you need to start your fitness journey with confidence and structure.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ y: -8 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-stone-600 leading-relaxed">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Sample Routine */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Sample Routine</h2>
            <p className="text-xl text-stone-600">
              Here's an example to give you an idea of what a beginner workout looks like.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <BeginnerWorkouts />
          </div>
        </section>

        {/* FAQ */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Need to Know</h2>
            <p className="text-xl text-stone-600">
              Common questions about starting your fitness journey.
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
                <summary className="cursor-pointer flex justify-between items-center font-semibold text-lg hover:text-emerald-600 transition-colors">
                  {faq.q}
                  <ChevronDown className="w-5 h-5" />
                </summary>
                <p className="mt-4 text-stone-600 leading-relaxed">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BeginnerPage;
