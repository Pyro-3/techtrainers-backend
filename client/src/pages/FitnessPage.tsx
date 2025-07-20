import React, { useState, Suspense, lazy } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Activity, BarChart2, ClipboardList, Settings, User } from 'lucide-react'
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
    <>
      <Header />

      <div className="pt-28 pb-20 bg-stone-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-stone-800 mb-2">Fitness Tracking</h1>
            <p className="text-stone-600 mb-8">
              Monitor your progress, set goals, and track your fitness journey
            </p>
            <div className="flex flex-col md:flex-row gap-8">

              {/* Sidebar */}
              <aside className="md:w-1/4">
                <div className="bg-white rounded-xl shadow-sm p-4 sticky top-28">
                  <div className="flex items-center p-4 mb-4">
                    <div className="bg-amber-100 rounded-full p-3">
                      <User size={24} className="text-amber-700" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-stone-500 capitalize">
                        {user?.fitnessLevel || 'beginner'} level
                      </p>
                    </div>
                  </div>
                  <nav>
                    <ul className="space-y-1">
                      {tabList.map(({ key, label, icon: Icon }) => (
                        <li key={key}>
                          <button
                            className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                              activeTab === key
                                ? 'bg-amber-100 text-amber-800'
                                : 'hover:bg-stone-100 text-stone-700'
                            }`}
                            onClick={() => setActiveTab(key)}
                          >
                            <Icon size={20} className="mr-3" />
                            {label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </aside>

              {/* Main Content */}
              <section className="md:w-3/4 bg-white rounded-xl shadow-sm p-6">
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
              </section>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}

export default FitnessPage
