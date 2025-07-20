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
  }, [user]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-inter">
      <Header />

      {/* Hero */}
      <section
        className="relative h-80 flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/images/advanced-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="relative text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Advanced Training Suite
          </h1>
          <p className="text-lg md:text-xl text-stone-200 max-w-2xl mx-auto">
            Unlock advanced insights, browse our toughest workouts, and connect with your trainer.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Back Link */}
        <div>
          <Link
            to="/dashboard"
            className="inline-flex items-center text-stone-700 hover:text-amber-700 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
          </Link>
        </div>

        {/* Features */}
        <section>
          <h2 className="text-3xl font-semibold text-center mb-8">
            Advanced Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-start space-y-4"
                whileHover={{ y: -4, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
              >
                {f.icon}
                <h3 className="text-xl font-medium">{f.title}</h3>
                <p className="text-stone-600 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Weekly Volume */}
        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Weekly Volume</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="volume" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* All Workouts */}
        <section>
          <h2 className="text-3xl font-semibold text-center mb-6">
            All Advanced Workouts
          </h2>
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
          <h2 className="text-3xl font-semibold text-center mb-8">Need to Know</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="bg-white p-4 rounded-lg shadow cursor-pointer"
              >
                <summary className="flex justify-between items-center font-medium text-stone-800">
                  {f.q} <ChevronDown className="w-5 h-5" />
                </summary>
                <p className="mt-2 text-stone-600 text-sm">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-amber-100 py-12 rounded-2xl text-center">
          <h3 className="text-2xl font-semibold mb-4">
            Want Custom Programming?
          </h3>
          <Link
            to="/workout-generator"
            className="inline-block bg-amber-700 text-white px-8 py-3 rounded-full font-medium hover:bg-amber-800 transition"
          >
            Open Workout Generator
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AdvancedPage;
