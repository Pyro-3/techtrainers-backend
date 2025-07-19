import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FitnessProgressTracker from '../components/fitness/FitnessProgressTracker';
import GoalSetting from '../components/fitness/GoalSetting';
import { Activity, BarChart2, ClipboardList, Settings, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const FitnessPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('progress');
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'progress':
        return <FitnessProgressTracker />;
      case 'goals':
        return <GoalSetting />;
      case 'metrics':
        return <BodyMetrics />;
      case 'settings':
        return <FitnessSettings />;
      default:
        return <FitnessProgressTracker />;
    }
  };
  
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
              {/* Sidebar Navigation */}
              <div className="md:w-1/4">
                <div className="bg-white rounded-xl shadow-sm p-4 sticky top-28">
                  <div className="flex items-center p-4 mb-4">
                    <div className="bg-amber-100 rounded-full p-3">
                      <User size={24} className="text-amber-700" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-stone-500 capitalize">{user?.fitnessLevel || 'beginner'} level</p>
                    </div>
                  </div>
                  
                  <nav>
                    <ul className="space-y-1">
                      <li>
                        <button
                          className={`flex items-center w-full p-3 rounded-lg ${
                            activeTab === 'progress' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'hover:bg-stone-100 text-stone-700'
                          }`}
                          onClick={() => setActiveTab('progress')}
                        >
                          <BarChart2 size={20} className="mr-3" />
                          Progress Tracker
                        </button>
                      </li>
                      <li>
                        <button
                          className={`flex items-center w-full p-3 rounded-lg ${
                            activeTab === 'goals' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'hover:bg-stone-100 text-stone-700'
                          }`}
                          onClick={() => setActiveTab('goals')}
                        >
                          <Activity size={20} className="mr-3" />
                          My Goals
                        </button>
                      </li>
                      <li>
                        <button
                          className={`flex items-center w-full p-3 rounded-lg ${
                            activeTab === 'metrics' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'hover:bg-stone-100 text-stone-700'
                          }`}
                          onClick={() => setActiveTab('metrics')}
                        >
                          <ClipboardList size={20} className="mr-3" />
                          Body Metrics
                        </button>
                      </li>
                      <li>
                        <button
                          className={`flex items-center w-full p-3 rounded-lg ${
                            activeTab === 'settings' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'hover:bg-stone-100 text-stone-700'
                          }`}
                          onClick={() => setActiveTab('settings')}
                        >
                          <Settings size={20} className="mr-3" />
                          Preferences
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="md:w-3/4">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

// Body Metrics Component
const BodyMetrics = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-stone-800">Body Metrics</h2>
        <button className="flex items-center space-x-1 bg-amber-700 hover:bg-amber-800 text-white px-3 py-2 rounded-lg transition-colors duration-300">
          <Activity size={16} />
          <span>Add New Measurement</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
          <h3 className="font-semibold text-stone-700 mb-2">Weight History</h3>
          <div className="h-48 flex items-end space-x-1">
            {/* Sample chart bars */}
            {Array.from({ length: 12 }).map((_, i) => {
              const height = 30 + Math.random() * 70;
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-amber-500 rounded-t"
                    style={{ height: `${height}px` }}
                  ></div>
                  <span className="text-xs text-stone-500 mt-1">{i+1}</span>
                </div>
              );
            })}
          </div>
          <p className="text-center text-sm text-stone-500 mt-4">Tracking last 12 weeks</p>
        </div>
        
        <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
          <h3 className="font-semibold text-stone-700 mb-2">Body Composition</h3>
          <div className="flex justify-center items-center h-48">
            {/* Placeholder for body composition chart */}
            <div className="w-32 h-32 rounded-full border-8 border-amber-500 flex items-center justify-center relative">
              <div className="absolute inset-0 border-8 border-blue-500 rounded-full" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}></div>
              <div className="text-center">
                <p className="text-sm text-stone-500">Body Fat</p>
                <p className="font-bold text-xl">18%</p>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-stone-500 mt-4">Current body composition</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200">
              <th className="px-4 py-3 text-left text-stone-600">Date</th>
              <th className="px-4 py-3 text-left text-stone-600">Weight</th>
              <th className="px-4 py-3 text-left text-stone-600">Body Fat %</th>
              <th className="px-4 py-3 text-left text-stone-600">Chest</th>
              <th className="px-4 py-3 text-left text-stone-600">Waist</th>
              <th className="px-4 py-3 text-left text-stone-600">Hips</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: '2025-06-15', weight: 76.2, bodyFat: 18.5, chest: 92, waist: 82, hips: 95 },
              { date: '2025-06-01', weight: 77.1, bodyFat: 19.2, chest: 93, waist: 83, hips: 95 },
              { date: '2025-05-15', weight: 78.3, bodyFat: 19.8, chest: 94, waist: 84, hips: 96 }
            ].map((entry, i) => (
              <tr key={i} className="border-b border-stone-200">
                <td className="px-4 py-3">{new Date(entry.date).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-medium">{entry.weight} kg</td>
                <td className="px-4 py-3">{entry.bodyFat}%</td>
                <td className="px-4 py-3">{entry.chest} cm</td>
                <td className="px-4 py-3">{entry.waist} cm</td>
                <td className="px-4 py-3">{entry.hips} cm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Fitness Settings Component
const FitnessSettings = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-stone-800">Fitness Preferences</h2>
        <button className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg transition-colors duration-300">
          Save Changes
        </button>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-stone-700 mb-3">Workout Preferences</h3>
          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">
                  Preferred Workout Duration
                </label>
                <select className="w-full p-2 border border-stone-300 rounded-lg">
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60" selected>60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">
                  Weekly Workout Frequency
                </label>
                <select className="w-full p-2 border border-stone-300 rounded-lg">
                  <option value="1-2">1-2 times per week</option>
                  <option value="3-4" selected>3-4 times per week</option>
                  <option value="5-6">5-6 times per week</option>
                  <option value="7">Daily</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                Preferred Workout Types
              </label>
              <div className="flex flex-wrap gap-2">
                {['Strength', 'Cardio', 'HIIT', 'Yoga', 'Pilates', 'Running'].map(type => (
                  <label key={type} className="inline-flex items-center bg-white p-2 rounded-lg border border-stone-200">
                    <input type="checkbox" className="form-checkbox text-amber-700 rounded mr-2" />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-stone-700 mb-3">Goal Tracking</h3>
          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                Primary Fitness Goal
              </label>
              <select className="w-full p-2 border border-stone-300 rounded-lg">
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain" selected>Muscle Gain</option>
                <option value="endurance">Endurance</option>
                <option value="flexibility">Flexibility</option>
                <option value="general">General Fitness</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                Notification Preferences
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="form-checkbox text-amber-700 rounded" checked />
                  <span className="ml-2">Weekly progress summaries</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="form-checkbox text-amber-700 rounded" checked />
                  <span className="ml-2">Goal reminders</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="form-checkbox text-amber-700 rounded" />
                  <span className="ml-2">Workout suggestions</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-stone-700 mb-3">Measurement Units</h3>
          <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                Weight Units
              </label>
              <div className="flex">
                <label className="inline-flex items-center bg-white p-2 rounded-l-lg border border-stone-200">
                  <input type="radio" name="weight" className="form-radio text-amber-700" checked />
                  <span className="ml-2">kg</span>
                </label>
                <label className="inline-flex items-center bg-white p-2 rounded-r-lg border-t border-r border-b border-stone-200">
                  <input type="radio" name="weight" className="form-radio text-amber-700" />
                  <span className="ml-2">lbs</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                Distance Units
              </label>
              <div className="flex">
                <label className="inline-flex items-center bg-white p-2 rounded-l-lg border border-stone-200">
                  <input type="radio" name="distance" className="form-radio text-amber-700" checked />
                  <span className="ml-2">km</span>
                </label>
                <label className="inline-flex items-center bg-white p-2 rounded-r-lg border-t border-r border-b border-stone-200">
                  <input type="radio" name="distance" className="form-radio text-amber-700" />
                  <span className="ml-2">miles</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitnessPage;
