// src/pages/AdvancedPage.tsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdvancedWorkouts from '../components/workouts/AdvancedWorkouts';
import PersonalTrainerSection from '../components/PersonalTrainerSection';
import { useAuth } from '../contexts/AuthContext';
import {
  ChevronDown,
  ArrowLeft,
  Calendar,
  Users,
  TrendingUp,
  Zap,
  Award,
  Target,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface WeeklyStat {
  day: string;
  volume: number;
}

const features = [
  {
    icon: <Calendar className="w-6 h-6 text-amber-700" />,
    title: 'Periodized Programming',
    desc: 'Built‑in deloads, AMRAPs & peaking phases to break through plateaus.',
  },
  {
    icon: <Target className="w-6 h-6 text-amber-700" />,
    title: 'Accessory Emphasis',
    desc: 'Targeted accessory lifts (paused squats, banded glute bridges) for balanced strength.',
  },
  {
    icon: <Award className="w-6 h-6 text-amber-700" />,
    title: 'PR Tracker',
    desc: 'Automatically log personal records and visualize your strength curve.',
  },
  {
    icon: <Zap className="w-6 h-6 text-amber-700" />,
    title: 'Custom Warm‑Ups',
    desc: 'Dynamic warm‑up sequences tailored to your session’s main lifts.',
  },
];

const faqs = [
  {
    q: 'How do I interpret my volume curve?',
    a: 'Volume is reps × weight. Look for gradual upward trends—spikes can indicate overtraining risks.',
  },
  {
    q: 'Can I request programming tweaks?',
    a: 'Yes—connect with your trainer via the “Ask a Pro” button below to adjust phases or emphasis.',
  },
  {
    q: 'What if I miss a week?',
    a: 'Use the built‑in deload week, or manually shift your cycle forward to stay on track.',
  },
];

const AdvancedPage: React.FC = () => {
  const { user } = useAuth();
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);

  useEffect(() => {
    if (!user?._id) return;
    (async () => {
      try {
        const res = await fetch(
          `/api/stats/weekly-volume?userId=${encodeURIComponent(user._id)}`
        );
        const data: WeeklyStat[] = await res.json();
        setWeeklyStats(data);
      } catch (err) {
        console.error('Failed to load weekly stats', err);
      }
    })();
  }, [user?._id]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-inter">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Advanced <span className="text-purple-400">Training</span> Suite
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-stone-200 max-w-3xl mx-auto">
                Unlock advanced insights, browse our toughest workouts, and connect with your trainer for elite performance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/workout-generator"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                >
                  Advanced Workouts
                </Link>
                <Link
                  to="/dashboard"
                  className="border-2 border-white hover:bg-white hover:text-stone-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16 space-y-20">

        {/* Advanced Features */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Advanced Features</h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              Elite tools and insights designed for serious athletes and advanced trainees.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
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
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-stone-600 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Weekly Volume */}
        <section className="bg-white rounded-3xl p-8 md:p-12 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">Weekly Volume</h2>
            <p className="text-xl text-stone-600">
              Track your training volume and intensity across the week.
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="volume" fill="#9333ea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* All Workouts */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">All Advanced Workouts</h2>
            <p className="text-xl text-stone-600">
              Comprehensive training programs for elite performance.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AdvancedWorkouts />
          </motion.div>
        </section>

        {/* Personal Trainer */}
        <section>
          <PersonalTrainerSection />
        </section>

        {/* FAQ */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Need to Know</h2>
            <p className="text-xl text-stone-600">
              Expert answers to advanced training questions.
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
                <summary className="cursor-pointer flex justify-between items-center font-semibold text-lg hover:text-purple-600 transition-colors">
                  {faq.q}
                  <ChevronDown className="w-5 h-5" />
                </summary>
                <p className="mt-4 text-stone-600 leading-relaxed">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-3xl p-8 md:p-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Want Custom Programming?
            </h3>
            <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
              Take your training to the elite level with personalized programming.
            </p>
            <Link
              to="/workout-generator"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-purple-50 transition-all duration-300 transform hover:scale-105"
            >
              Open Workout Generator
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AdvancedPage;
