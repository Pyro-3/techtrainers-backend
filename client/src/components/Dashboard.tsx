import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { workoutAPI } from '../services/api';
import { Activity, Calendar, ChevronRight, Clock, BarChart2, Award, Plus } from 'lucide-react';
import WorkoutList from './workout/WorkoutList';
import WorkoutCreator from './workout/WorkoutCreator';
import WorkoutDetail from './workout/WorkoutDetail';

interface WorkoutSummary {
  _id: string;
  name: string;
  type: string;
  difficulty: string;
  duration: number;
  status: string;
  scheduledFor?: string;
}

interface WorkoutStats {
  totalWorkouts: number;
  totalMinutes: number;
  streakDays: number;
  level: string;
  progress: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    totalMinutes: 0,
    streakDays: 0,
    level: user?.fitnessLevel || 'beginner',
    progress: 0
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'workouts' | 'create'>('overview');
  const [activeFilter, setActiveFilter] = useState<'planned' | 'in_progress' | 'completed' | null>(null);
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<WorkoutSummary[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<WorkoutSummary[]>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {        // Load stats
        const statsResponse = await workoutAPI.getStats();
        const statsData = statsResponse?.data?.data || {};
        
        setStats({
          totalWorkouts: statsData?.totalWorkouts || 0,
          totalMinutes: statsData?.totalMinutes || 0,
          streakDays: statsData?.currentStreak || 0,
          level: user?.fitnessLevel || 'beginner',
          progress: statsData?.progress || 0
        });
        
        // Load upcoming workouts (planned)
        const upcoming = await workoutAPI.getWorkouts({ status: 'planned', limit: 3 });
        setUpcomingWorkouts(upcoming?.data?.data?.workouts || []);
        
        // Load recent workouts (completed)
        const recent = await workoutAPI.getWorkouts({ status: 'completed', limit: 3 });
        setRecentWorkouts(recent?.data?.data?.workouts || []);
          } catch (err) {
        console.error('Error loading dashboard data:', err);
        // Set fallback data if API fails
        setStats({
          totalWorkouts: 0,
          totalMinutes: 0,
          streakDays: 0,
          level: user?.fitnessLevel || 'beginner',
          progress: 0
        });
        setUpcomingWorkouts([]);
        setRecentWorkouts([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user]);
  
  const calculateProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-amber-500';
    return 'bg-green-500';
  };
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not scheduled';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleRefreshData = () => {
    setSelectedWorkoutId(null);
    setActiveTab('overview');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  if (selectedWorkoutId) {
    return (
      <div className="max-w-6xl mx-auto">
        <WorkoutDetail 
          workoutId={selectedWorkoutId} 
          onClose={() => setSelectedWorkoutId(null)} 
          onComplete={handleRefreshData}
        />
      </div>
    );
  }

  if (activeTab === 'create') {
    return (
      <div className="max-w-6xl mx-auto">
        <WorkoutCreator onComplete={handleRefreshData} />
      </div>
    );
  }

  if (activeTab === 'workouts') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => setActiveTab('overview')}
            className="text-amber-700 hover:text-amber-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 010 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-stone-800">All Workouts</h2>
            <button
              onClick={() => setActiveTab('create')}
              className="flex items-center space-x-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg transition-colors duration-300"
            >
              <Plus size={18} />
              <span>Create Workout</span>
            </button>
          </div>
          
          {/* Filtering tabs */}
          <div className="flex border-b border-stone-200 mb-6">
            <button
              className={`px-4 py-2 font-medium ${
                !activeFilter ? 'border-b-2 border-amber-700 text-amber-700' : 'text-stone-500'
              }`}
              onClick={() => setActiveFilter(null)}
            >
              All
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeFilter === 'planned' ? 'border-b-2 border-amber-700 text-amber-700' : 'text-stone-500'
              }`}
              onClick={() => setActiveFilter('planned')}
            >
              Planned
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeFilter === 'in_progress' ? 'border-b-2 border-amber-700 text-amber-700' : 'text-stone-500'
              }`}
              onClick={() => setActiveFilter('in_progress')}
            >
              In Progress
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeFilter === 'completed' ? 'border-b-2 border-amber-700 text-amber-700' : 'text-stone-500'
              }`}
              onClick={() => setActiveFilter('completed')}
            >
              Completed
            </button>
          </div>
          
          <WorkoutList 
            filter={activeFilter || 'all'} 
            showCreate={false} 
          />
        </div>
      </div>
    );
  }

  // Overview tab (default)
  return (
    <div className="bg-stone-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-stone-800 mb-6">Welcome back, {user?.name.split(' ')[0]}</h1>
        
        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Activity className="w-6 h-6 text-amber-700 mr-2" />
              <h3 className="font-semibold text-stone-700">Total Workouts</h3>
            </div>
            <p className="text-3xl font-bold text-stone-800">{stats.totalWorkouts}</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-amber-700 mr-2" />
              <h3 className="font-semibold text-stone-700">Minutes Trained</h3>
            </div>
            <p className="text-3xl font-bold text-stone-800">{stats.totalMinutes}</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Calendar className="w-6 h-6 text-amber-700 mr-2" />
              <h3 className="font-semibold text-stone-700">Streak</h3>
            </div>
            <p className="text-3xl font-bold text-stone-800">{stats.streakDays} days</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <Award className="w-6 h-6 text-amber-700 mr-2" />
              <h3 className="font-semibold text-stone-700">Current Level</h3>
            </div>
            <p className="text-xl font-bold text-stone-800 capitalize">{stats.level}</p>
            
            <div className="mt-2">
              <div className="w-full bg-stone-200 rounded-full h-2.5">
                <div 
                  className={`${calculateProgressColor(stats.progress)} h-2.5 rounded-full transition-all duration-500 ease-out`} 
                  style={{ width: `${stats.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-stone-500 mt-1">{stats.progress}% to next level</p>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setActiveTab('create')}
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white p-6 rounded-xl flex flex-col items-center justify-center shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <div className="bg-white/20 rounded-full p-4 mb-4">
              <Plus size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Create Workout</h3>
            <p className="text-white/80 text-sm">Design your own custom workout routine</p>
          </button>
          
          <button
            onClick={() => setActiveTab('workouts')}
            className="bg-gradient-to-r from-stone-700 to-stone-800 hover:from-stone-800 hover:to-stone-900 text-white p-6 rounded-xl flex flex-col items-center justify-center shadow-sm transition-all duration-300 hover:shadow-md"
          >
            <div className="bg-white/20 rounded-full p-4 mb-4">
              <BarChart2 size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1">View All Workouts</h3>
            <p className="text-white/80 text-sm">Browse and manage your workout collection</p>
          </button>
          
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-6 rounded-xl flex flex-col items-center justify-center shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="bg-white/20 rounded-full p-4 mb-4">
              <Calendar size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Weekly Schedule</h3>
            <p className="text-white/80 text-sm">Plan and organize your weekly fitness routine</p>
          </div>
        </div>
        
        {/* Upcoming Workouts */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-stone-800">Upcoming Workouts</h2>
            <button 
              onClick={() => setActiveTab('workouts')}
              className="flex items-center text-amber-700 font-medium text-sm"
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          {upcomingWorkouts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-stone-500">No upcoming workouts scheduled</p>
              <button 
                onClick={() => setActiveTab('create')}
                className="mt-4 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Create a Workout
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingWorkouts.map((workout) => (
                <div 
                  key={workout._id} 
                  className="flex items-center justify-between border-b border-stone-100 pb-4 cursor-pointer hover:bg-stone-50 p-2 rounded-lg transition-colors"
                  onClick={() => setSelectedWorkoutId(workout._id)}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      workout.type === 'cardio' ? 'bg-red-100 text-red-600' : 
                      workout.type === 'strength' ? 'bg-blue-100 text-blue-600' : 
                      'bg-green-100 text-green-600'
                    }`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-stone-800">{workout.name}</h3>
                      <p className="text-sm text-stone-500">{workout.duration} min • {formatDate(workout.scheduledFor)}</p>
                    </div>
                  </div>
                  <button 
                    className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWorkoutId(workout._id);
                    }}
                  >
                    Start
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-stone-800">Recent Activity</h2>
            <button
              onClick={() => {
                setActiveTab('workouts');
              }}
              className="flex items-center text-amber-700 font-medium text-sm"
            >
              View History <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          {recentWorkouts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-stone-500">No completed workouts yet</p>
              <button 
                onClick={() => setActiveTab('create')}
                className="mt-4 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Start Your First Workout
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentWorkouts.map((workout) => (
                <div 
                  key={workout._id} 
                  className="flex items-center justify-between border-b border-stone-100 pb-4 last:border-0 cursor-pointer hover:bg-stone-50 p-2 rounded-lg transition-colors"
                  onClick={() => setSelectedWorkoutId(workout._id)}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      workout.type === 'cardio' ? 'bg-red-100 text-red-600' : 
                      workout.type === 'strength' ? 'bg-blue-100 text-blue-600' : 
                      'bg-green-100 text-green-600'
                    }`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-stone-800">{workout.name}</h3>
                      <p className="text-sm text-stone-500">{workout.duration} min</p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
