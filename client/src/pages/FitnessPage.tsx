import React, { useState, Suspense, lazy } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Activity, BarChart2, ClipboardList, Settings, User, Target, TrendingUp } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

// Lazy-loaded tab content
const FitnessProgressTracker = lazy(() => import('../components/fitness/FitnessProgressTracker'))
const GoalSetting            = lazy(() => import('../components/fitness/GoalSetting'))
const BodyMetrics            = lazy(() => import('../components/BodyMetrics'))
const FitnessSettings        = lazy(() => import('../components/fitness/FitnessSettings'))

// Simple spinner while loading tabs
const Spinner: React.FC = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin" />
  </div>
)

const tabList = [
  { key: 'progress', label: 'Progress Tracker', icon: BarChart2 },
  { key: 'goals',    label: 'My Goals',         icon: Activity  },
  { key: 'metrics',  label: 'Body Metrics',     icon: ClipboardList },
  { key: 'settings', label: 'Preferences',      icon: Settings  },
] as const

type TabKey = typeof tabList[number]['key']
const transitionProps = { duration: 0.3 }

const FitnessPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabKey>('progress')

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-inter">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20" />
        <div className="relative container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Fitness <span className="text-blue-400">Tracking</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-stone-200 max-w-3xl mx-auto">
                Monitor your progress, set goals, and track your fitness journey with comprehensive analytics and insights.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">

              {/* Sidebar */}
              <aside className="lg:w-1/4">
                <motion.div 
                  className="bg-white rounded-2xl shadow-lg p-6 sticky top-8"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex items-center p-4 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                    <div className="bg-blue-100 rounded-full p-3">
                      <User size={24} className="text-blue-700" />
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-lg">{user?.name}</p>
                      <p className="text-sm text-stone-500 capitalize">
                        {user?.fitnessLevel || 'beginner'} level
                      </p>
                    </div>
                  </div>
                  <nav>
                    <ul className="space-y-2">
                      {tabList.map(({ key, label, icon: Icon }) => (
                        <li key={key}>
                          <button
                            className={`flex items-center w-full p-4 rounded-xl transition-all duration-300 ${
                              activeTab === key
                                ? 'bg-blue-100 text-blue-800 shadow-md transform scale-105'
                                : 'hover:bg-stone-100 text-stone-700 hover:transform hover:scale-102'
                            }`}
                            onClick={() => setActiveTab(key)}
                          >
                            <Icon size={20} className="mr-3" />
                            <span className="font-medium">{label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </motion.div>
              </aside>

              {/* Main Content */}
              <section className="lg:w-3/4">
                <motion.div 
                  className="bg-white rounded-2xl shadow-lg p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Suspense fallback={<Spinner />}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={transitionProps}
                      >
                        {activeTab === 'progress' && <FitnessProgressTracker />}
                        {activeTab === 'goals' && <GoalSetting />}
                        {activeTab === 'metrics' && <BodyMetrics />}
                        {activeTab === 'settings' && <FitnessSettings />}
                      </motion.div>
                    </AnimatePresence>
                  </Suspense>
                </motion.div>
              </section>

            </div>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

export default FitnessPage
