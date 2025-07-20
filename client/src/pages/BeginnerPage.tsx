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

      {/* Hero */}
      <section
        className="relative h-80 flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/images/beginner-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="relative text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Beginner Workouts
          </h1>
          <p className="text-lg md:text-xl text-stone-200">
            Start strong with our hand‑held, step‑by‑step fitness plan.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Back Link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center text-stone-700 hover:text-amber-700 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
          </Link>
        </div>

        {/* Benefits */}
        <section>
          <h2 className="text-3xl font-semibold text-center mb-8">
            Core Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-start space-y-4"
                whileHover={{ y: -4, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
              >
                {b.icon}
                <h3 className="text-xl font-medium">{b.title}</h3>
                <p className="text-stone-600 text-sm">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Sample Routine */}
        <section>
          <h2 className="text-3xl font-semibold text-center mb-6">
            Sample Routine
          </h2>
          <div className="max-w-4xl mx-auto">
            <BeginnerWorkouts />
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-3xl font-semibold text-center mb-8">
            Need to Know
          </h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {faqs.map((f, i) => (
              <details
                key={i}
                className="bg-white p-4 rounded-lg shadow cursor-pointer"
              >
                <summary className="flex justify-between items-center text-stone-800 font-medium">
                  {f.q} <ChevronDown className="w-5 h-5" />
                </summary>
                <p className="mt-2 text-stone-600 text-sm">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BeginnerPage;
