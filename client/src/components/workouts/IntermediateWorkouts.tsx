// src/components/workouts/IntermediateWorkouts.tsx
import React, { useEffect, useState } from 'react';
import { Calendar, TrendingUp, Target, Award, Plus, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth, type UserData } from '../../contexts/AuthContext';

interface Workout {
  id: number | string;
  exerciseName: string;
  sets: number | string;
  reps: number | string;
  weight?: number | string;
  date: string;
  userId: string;
}

interface Stats {
  totalWorkouts: number;
  currentStreak: number;
  thisWeek: number;
  personalRecords: number;
}

const IntermediateWorkouts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth() as { user: UserData | null };

  const [workoutLog, setWorkoutLog] = useState({
    exerciseName: '',
    sets: '',
    reps: '',
    weight: ''
  });
  const [loggedWorkouts, setLoggedWorkouts] = useState<Workout[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalWorkouts: 0,
    currentStreak: 0,
    thisWeek: 0,
    personalRecords: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // When user changes (i.e. on login), fetch their workouts
  useEffect(() => {
    if (user?._id) {
      fetchUserWorkouts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserWorkouts = async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get<Workout[]>(`/api/workouts/user/${user._id}`);
      const workouts = res.data || [];
      setLoggedWorkouts(workouts);
      computeStats(workouts);
    } catch (err) {
      console.error('Failed to fetch workouts', err);
      setError('Failed to load workouts');
      // Set empty array on error to prevent crashes
      setLoggedWorkouts([]);
      setStats({
        totalWorkouts: 0,
        currentStreak: 0,
        thisWeek: 0,
        personalRecords: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Compute all four stats
  const computeStats = (workouts: Workout[]) => {
    if (!workouts || workouts.length === 0) {
      setStats({
        totalWorkouts: 0,
        currentStreak: 0,
        thisWeek: 0,
        personalRecords: 0
      });
      return;
    }

    const total = workouts.length;
    const weekCount = workouts.filter(w => isThisWeek(w.date)).length;
    const streak = computeStreak(workouts);
    
    // Fixed PR calculation
    const exerciseMaxWeights = new Map<string, number>();
    let prCount = 0;
    
    workouts.forEach(w => {
      const weight = typeof w.weight === 'string' ? parseFloat(w.weight) : (w.weight || 0);
      if (weight > 0) {
        const currentMax = exerciseMaxWeights.get(w.exerciseName) || 0;
        if (weight > currentMax) {
          exerciseMaxWeights.set(w.exerciseName, weight);
          prCount++;
        }
      }
    });

    setStats({
      totalWorkouts: total,
      thisWeek: weekCount,
      currentStreak: streak,
      personalRecords: prCount
    });
  };

  // Helper: is a date string in this calendar week?
  const isThisWeek = (dateStr: string) => {
    try {
      const now = new Date();
      const wd = new Date(dateStr);
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return wd >= weekStart;
    } catch (err) {
      return false;
    }
  };

  // Helper: count consecutive days up to today
  const computeStreak = (workouts: Workout[]) => {
    try {
      const days = Array.from(
        new Set(workouts.map(w => w.date.slice(0, 10)))
      ).sort().reverse();

      let streak = 0;
      let cursor = new Date();
      cursor.setHours(0, 0, 0, 0);
      
      for (const d of days) {
        const wd = new Date(d);
        wd.setHours(0, 0, 0, 0);
        const diff = (cursor.getTime() - wd.getTime()) / (1000 * 60 * 60 * 24);
        if (diff >= 0 && diff <= 1) {
          streak++;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }
      return streak;
    } catch (err) {
      return 0;
    }
  };

  // Input handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkoutLog(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Post a new workout
  const logExercise = async () => {
    if (!user?._id) return;
    const { exerciseName, sets, reps, weight } = workoutLog;
    if (!exerciseName || !sets || !reps) {
      alert('Please fill in Exercise, Sets and Reps.');
      return;
    }

    const payload: Omit<Workout, 'id'> = {
      exerciseName,
      sets,
      reps,
      weight,
      userId: user._id,
      date: new Date().toISOString()
    };

    try {
      const res = await axios.post<Workout>('/api/workouts', payload);
      const saved = res.data;
      const updated = [...loggedWorkouts, saved];
      setLoggedWorkouts(updated);
      computeStats(updated);
      setWorkoutLog({ exerciseName: '', sets: '', reps: '', weight: '' });
    } catch (err) {
      console.error('Failed to save workout', err);
      alert('Failed to save workout. Please try again.');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-stone-50 min-h-screen py-12">
        <div className="container mx-auto px-6">
          <div className="text-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
            <p className="text-stone-600">Loading your workouts...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="bg-stone-50 min-h-screen py-12">
        <div className="container mx-auto px-6">
          <div className="text-center py-24 text-stone-600">
            <p className="text-xl mb-4">Please log in to access your Intermediate Workout Dashboard.</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-stone-50 min-h-screen py-12">
        <div className="container mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-stone-700 hover:text-amber-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <div className="text-center py-24">
            <p className="text-red-600 text-xl mb-4">{error}</p>
            <button
              onClick={fetchUserWorkouts}
              className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen py-12">
      <div className="container mx-auto px-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-stone-700 hover:text-amber-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-stone-900 mb-4">
            Intermediate Training Suite
          </h1>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Track your progress, log workouts, and hit new peaks.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatBox label="Total Workouts" value={stats.totalWorkouts} icon={<Calendar />} />
          <StatBox
            label="Current Streak"
            value={`${stats.currentStreak}d 🔥`}
            icon={<TrendingUp />}
          />
          <StatBox label="This Week" value={stats.thisWeek} icon={<Target />} />
          <StatBox label="Personal Records" value={stats.personalRecords} icon={<Award />} />
        </div>

        {/* Logger */}
        <div className="bg-white rounded-2xl p-8 shadow-xl mb-12">
          <h3 className="text-2xl font-bold mb-6 flex items-center">
            <Plus className="w-6 h-6 mr-2 text-amber-700" /> Workout Logger
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { field: 'exerciseName', label: 'Exercise Name', type: 'text' },
              { field: 'sets', label: 'Sets', type: 'number' },
              { field: 'reps', label: 'Reps', type: 'number' },
              { field: 'weight', label: 'Weight (kg)', type: 'number' }
            ].map(({ field, label, type }) => (
              <div key={field}>
                <label className="block text-stone-700 font-medium mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  name={field}
                  value={(workoutLog as any)[field]}
                  onChange={handleInputChange}
                  className="w-full bg-stone-50 p-3 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none"
                  placeholder={`Enter ${label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
          <button
            onClick={logExercise}
            className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg transition-colors flex items-center"
          >
            <Save className="w-5 h-5 mr-2" />
            Log Exercise
          </button>
        </div>

        {/* Recent Workouts */}
        {loggedWorkouts.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-xl mb-12">
            <h3 className="text-2xl font-bold mb-6">Recent Workouts</h3>
            <div className="space-y-4">
              {loggedWorkouts
                .slice(-5)
                .reverse()
                .map(w => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between bg-stone-50 p-6 rounded-lg"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-xl">💪</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">{w.exerciseName}</h4>
                        <p className="text-stone-500">
                          {new Date(w.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-8 text-stone-700">
                      <div className="text-center">
                        <div className="font-semibold">{w.sets}</div>
                        <div className="text-sm text-stone-500">Sets</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{w.reps}</div>
                        <div className="text-sm text-stone-500">Reps</div>
                      </div>
                      {w.weight && (
                        <div className="text-center">
                          <div className="font-semibold">{w.weight}kg</div>
                          <div className="text-sm text-stone-500">Weight</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {loggedWorkouts.length === 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
            <div className="text-6xl mb-4">🏋️</div>
            <h3 className="text-2xl font-bold mb-4">Start Your Fitness Journey</h3>
            <p className="text-stone-600 mb-6">
              Log your first workout above to start tracking your progress!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const StatBox: React.FC<{
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
    <div className="text-stone-500 text-sm uppercase font-medium mb-2">{label}</div>
    <div className="text-3xl font-bold text-amber-700 mb-2">{value}</div>
    <div className="mx-auto text-stone-400 flex justify-center">{icon}</div>
  </div>
);

export default IntermediateWorkouts;